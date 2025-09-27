const express = require("express");
const getAllServiceStatusCounts = require("../Controllers/ADForRecordsServiceType");
const responseGenerator = require("../config/Constants/Response");
const generateHexShades = require("../config/Constants/ColorShadesGenerator");
const {
  getWeeklyBarData,
  getMonthlyBarData,
  getYearlyBarData,
} = require("../Controllers/ADForTotalCose");
const { getCustomersChartData } = require("../Controllers/ADForCustomersData");
const getCustomerTotals = require("../Controllers/ADForTotalCostPerUser");
const router = express.Router();

router.get("/getCountOfStatusTypes", async (req, res) => {
  try {
    const allData = await getAllServiceStatusCounts();
    const { New, Pending, Processing, Completed, Delivered, Cancelled, total } =
      allData;
    const data = {
      New,
      Pending,
      Processing,
      Completed,
      Delivered,
      Cancelled,
    };
    const dataValue = Object.values(data);
    const lables = Object.keys(data);
    const colors = generateHexShades(lables.length, "#374151");

    const ChartData = {
      labels: lables,
      datasets: [
        {
          data: dataValue,
          backgroundColor: colors,
          hoverBackgroundColor: colors,
        },
      ],
    };

    const pieData = {
      ChartData,
      total,
    };
    res.send(responseGenerator(200, pieData, ""));
  } catch (error) {
    res
      .status(500)
      .send(
        responseGenerator(500, [], error.message || "something went wrong")
      );
  }
});
router.get("/totalCostData", async (req, res) => {
  try {
    const { unit, n } = req.query;
    const userId = req.query.userId; // optional
    if (unit === "week") {
      const data = await getWeeklyBarData(n, { userId });
      return res.send(responseGenerator(200, data, ""));
    }
    if (unit === "month") {
      const data = await getMonthlyBarData(n, { userId });
      return res.send(responseGenerator(200, data, ""));
    }
    if (unit === "year") {
      const data = await getYearlyBarData(n, { userId });
      return res.send(responseGenerator(200, data, ""));
    }
  } catch (error) {
    res
      .status(500)
      .send(
        responseGenerator(500, [], error.message || "something went wrong")
      );
  }
});

router.get("/totalCustomersData", async (req, res) => {
  try {
    // example query: ?unit=days&n=7
    const unit = req.query.unit || "days";
    const n = Math.max(1, Math.min(365, parseInt(req.query.n, 10) || 7)); // sensible bounds
    const chart = await getCustomersChartData(unit, n, {
      label: "Visitors",
      backgroundColor: "#42A5F5",
    });
    res.send(responseGenerator(200, chart, ""));
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send(responseGenerator(500, [], err.message || "something went wrong"));
  }
});

router.get("/getTotalCostPerCustomer", async (req, res) => {
  try {
    const data = await getCustomerTotals();
    res.send(responseGenerator(200, data, ""));
  } catch (error) {
    res
      .status(500)
      .send(responseGenerator(500, [], err.message || "something went wrong"));
  }
});

module.exports = router;
