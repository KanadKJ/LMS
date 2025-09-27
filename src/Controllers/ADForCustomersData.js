// customersChartService.js
const User = require("../Models/Records/RecordsModel"); // adjust path

// ---- helpers ----
function getSinceDate(unit, n) {
  const now = new Date();
  if (unit === "day") {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate() - (n - 1)); // start of earliest day
  }
  if (unit === "week") {
    return new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 7 * (n - 1)
    );
  }
  if (unit === "month") {
    const d = new Date(now);
    d.setMonth(d.getMonth() - (n - 1));
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  throw new Error('unit must be "days" | "weeks" | "months"');
}

// Return YYYY-MM-DD for a Date in given timezone (reliable)
function toYMDInTZ(d, tz = "Asia/Kolkata") {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  // en-CA produces YYYY-MM-DD
  return fmt.format(d); // e.g. "2025-09-27"
}

// Return { year, month, day } for a Date in given timezone using formatToParts
function partsYMDInTZ(d, tz = "Asia/Kolkata") {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = fmt.formatToParts(d);
  const year = Number(parts.find((p) => p.type === "year").value);
  const month = Number(parts.find((p) => p.type === "month").value);
  const day = Number(parts.find((p) => p.type === "day").value);
  return { year, month, day };
}

// Compute ISO week/year for a JS Date in a target timezone (robust)
function getIsoWeekAndYearForDate(date, tz = "Asia/Kolkata") {
  // get y/m/d in timezone
  const { year, month, day } = partsYMDInTZ(date, tz);

  // build a UTC date that represents the same local date at 00:00
  const d = new Date(Date.UTC(year, month - 1, day));

  // ISO week algorithm on UTC date
  // Thursday in current week determines week year
  const dayOfWeek = (d.getUTCDay() + 6) % 7; // Mon=0..Sun=6
  d.setUTCDate(d.getUTCDate() - dayOfWeek + 3); // move to Thursday of this week
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const firstDayOfWeek = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayOfWeek + 3);
  const weekNo = 1 + Math.round((d - firstThursday) / (7 * 24 * 3600 * 1000));
  return { year: d.getUTCFullYear(), week: weekNo };
}

// format label helpers (use Intl, no fragile new Date(localString) round-trip)
function formatDayLabel(d, tz = "Asia/Kolkata") {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    timeZone: tz,
  }).format(d); // e.g. "27 Sep"
}
function formatMonthLabel(d, tz = "Asia/Kolkata") {
  return new Intl.DateTimeFormat("en-GB", {
    month: "short",
    year: "numeric",
    timeZone: tz,
  }).format(d); // e.g. "Sep 2025"
}
function formatIsoWeekLabelFromDate(d, tz = "Asia/Kolkata") {
  const iso = getIsoWeekAndYearForDate(d, tz);
  return `${iso.year}-W${String(iso.week).padStart(2, "0")}`;
}

// ---- main function ----
/**
 * Returns data ready for PrimeReact BarChart
 * @param {'days'|'weeks'|'months'} unit
 * @param {number} n number of periods (e.g. last 7 days, last 4 weeks)
 * @param {object} [opts] optional: { label: string, backgroundColor: string }
 * @returns { Promise<{ labels: string[], datasets: [{ label: string, data: number[], backgroundColor: string | string[] }] }> }
 */
async function getCustomersChartData(unit, n, opts = {}) {
  if (!["day", "week", "month"].includes(unit))
    throw new Error("unit must be days|weeks|months");

  const since = getSinceDate(unit, n);
  const timezone = "Asia/Kolkata";

  // build aggregation group depending on unit
  let groupStage, projectStage;
  if (unit === "day") {
    groupStage = {
      _id: {
        $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone },
      },
      count: { $sum: 1 },
    };
    projectStage = { _id: 0, period: "$_id", count: 1 };
  } else if (unit === "week") {
    groupStage = {
      _id: {
        year: { $isoWeekYear: { date: "$createdAt", timezone } },
        week: { $isoWeek: { date: "$createdAt", timezone } },
      },
      count: { $sum: 1 },
    };
    projectStage = {
      _id: 0,
      period: {
        $concat: [{ $toString: "$_id.year" }, "-W", { $toString: "$_id.week" }],
      },
      count: 1,
    };
  } else {
    // months
    groupStage = {
      _id: { $dateToString: { format: "%Y-%m", date: "$createdAt", timezone } },
      count: { $sum: 1 },
    };
    projectStage = { _id: 0, period: "$_id", count: 1 };
  }

  const pipeline = [
    { $match: { createdAt: { $gte: since } } },
    { $group: groupStage },
    { $project: projectStage },
    { $sort: { period: 1 } },
  ];

  const raw = await User.aggregate(pipeline).exec(); // [{ period: '2025-09-27', count: 5 }, ... ]

  // Build ordered list of labels (and corresponding lookup keys)
  const labels = [];
  const keys = []; // keys used in raw map (same as period strings)
  const now = new Date();

  if (unit === "day") {
    // n days: oldest -> newest
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      labels.push(formatDayLabel(d, timezone));
      keys.push(toYMDInTZ(d, timezone)); // YYYY-MM-DD (matches aggregation)
    }
  } else if (unit === "week") {
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - i * 7
      );
      labels.push(formatIsoWeekLabelFromDate(d, timezone));
      const iso = getIsoWeekAndYearForDate(d, timezone);
      keys.push(`${iso.year}-W${iso.week}`); // matches aggregation project for weeks
    }
  } else {
    // months
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(formatMonthLabel(d, timezone));
      keys.push(
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      ); // YYYY-MM (matches aggregation)
    }
  }

  // turn raw into a map: period -> count
  const rawMap = new Map(raw.map((r) => [r.period, r.count]));

  // build data array in the same order as labels / keys
  const data = keys.map((k) => rawMap.get(k) || 0);

  // dataset shape for PrimeReact / Chart.js
  const datasetLabel = opts.label || "Customers";
  const backgroundColor = opts.backgroundColor || "rgba(54,162,235,0.7)";

  const result = {
    labels,
    datasets: [
      {
        label: datasetLabel,
        data,
        backgroundColor,
      },
    ],
  };

  return result;
}

module.exports = { getCustomersChartData };
