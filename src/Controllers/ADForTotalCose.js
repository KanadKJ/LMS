// records.model.js
const Records = require("../Models/Records/RecordsModel"); // your schema file
const TZ = "Asia/Kolkata";

/**
 * Generic: build continuous time buckets & aggregate totals.
 * @param {'week'|'month'|'year'} granularity
 * @param {number} periods  e.g., 12 = last 12 weeks/months/years
 * @param {{ userId?: string }} [filter]
 * @returns {Promise<{labels: string[], datasets: [{ label: string, data: number[] }]} >}
 */
async function getBarChartData(granularity, periods, filter = {}) {
  const now = new Date();

  // Compute the JS start range for $match
  const start = new Date(now);
  if (granularity === "week")
    start.setDate(start.getDate() - (periods - 1) * 7);
  if (granularity === "month") start.setMonth(start.getMonth() - (periods - 1));
  if (granularity === "year")
    start.setFullYear(start.getFullYear() - (periods - 1));

  const match = {
    createdAt: { $gte: start, $lte: now },
    ...(filter.userId ? { userId: filter.userId } : {}),
  };

  // Choose label format per granularity (server sends readable strings)
  const formats = {
    week: "%Y-%m-%d", // start-of-week date; format in UI if you want
    month: "%Y-%m", // e.g. 2025-09
    year: "%Y", // e.g. 2025
  };

  const pipeline = [
    { $match: match },
    {
      $group: {
        _id: {
          $dateTrunc: { date: "$createdAt", unit: granularity, timezone: TZ },
        },
        total: { $sum: "$totalCost" },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id: 0,
        bucket: "$_id",
        label: {
          $dateToString: {
            date: "$_id",
            timezone: TZ,
            format: formats[granularity],
          },
        },
        total: 1,
      },
    },
  ];

  const rows = await Records.aggregate(pipeline);

  // Build expected bucket keys for the last `periods`, ensure continuity
  const add = (d, unit, n) => {
    const dd = new Date(d);
    if (unit === "week") dd.setDate(dd.getDate() + n * 7);
    if (unit === "month") dd.setMonth(dd.getMonth() + n);
    if (unit === "year") dd.setFullYear(dd.getFullYear() + n);
    return dd;
  };

  // Truncate `now` to the start of its bucket (to align labels)
  const truncPipeline = [
    {
      $project: {
        startBucket: {
          $dateTrunc: { date: now, unit: granularity, timezone: TZ },
        },
      },
    },
  ];
  const [{ startBucket }] = await Records.aggregate(truncPipeline);
  let cursor = new Date(startBucket);

  const expected = [];
  for (let i = periods - 1; i >= 0; i--) {
    expected.push(add(cursor, granularity, -i));
  }

  const byLabel = new Map(rows.map((r) => [r.label, r.total]));

  const labels = expected.map((d) =>
    // produce the same label strings that the pipeline emitted
    // we reuse Mongo's formatting by mirroring it on the client would be ideal,
    // but to keep it simple we compute the same format here using Intl.
    // For perfect consistency, you can also return ISO from server and format in UI.
    new Intl.DateTimeFormat("en-CA", {
      // en-CA yields YYYY-MM-DD for dates
      timeZone: TZ,
      ...(granularity === "year"
        ? { year: "numeric" }
        : granularity === "month"
        ? { year: "numeric", month: "2-digit" }
        : { year: "numeric", month: "2-digit", day: "2-digit" }),
    })
      .format(d)
      // normalize en-CA output (YYYY-MM-DD or YYYY-MM) to match pipeline labels
      .replace(/\/|(?<=\d{4})\//g, "-")
  );

  // If your label strings from the server differ, an even safer approach:
  //   return raw buckets (as ISO strings) and format labels purely in React.

  const data = labels.map((l) => byLabel.get(l) ?? 0);

  return {
    labels,
    datasets: [
      {
        label:
          granularity === "week"
            ? "Weekly Total Cost"
            : granularity === "month"
            ? "Monthly Total Cost"
            : "Yearly Total Cost",
        data,
      },
    ],
  };
}

// Convenience wrappers
async function getWeeklyBarData(periods = 12, filter) {
  return getBarChartData("week", periods, filter);
}
async function getMonthlyBarData(periods = 12, filter) {
  return getBarChartData("month", periods, filter);
}
async function getYearlyBarData(periods = 5, filter) {
  return getBarChartData("year", periods, filter);
}

module.exports = {
  getWeeklyBarData,
  getMonthlyBarData,
  getYearlyBarData,
  getBarChartData,
};
