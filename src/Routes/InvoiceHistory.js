const express = require("express");
const router = express.Router();
const invoiceHistory = require("../Models/InvoiceHistory/InvoiceHistoryModel");
const responseGenerator = require("../config/Constants/Response");
router.get("/allInvoice", async (req, res) => {
  try {
    const result = await invoiceHistory.find({}).sort({ createdAt: -1 });
    if (!result) {
      return res
        .status(404)
        .send(responseGenerator(404, [], "No records found"));
    }

    res.send(responseGenerator(200, result, ""));
  } catch (error) {
    return res.status(500).send(responseGenerator(500));
  }
});

router.post("/addInvoice", async (req, res) => {
  const {
    invoiceId,
    serviceType,
    totalCost,
    address,
    indivisualCost,
    mobile,
    name,
    serviceStatus,
  } = req.body;
  try {
    const result = await new invoiceHistory({
      invoiceId: invoiceId,
      address: address,
      indivisualCost: indivisualCost,
      mobile: mobile,
      name: name,
      serviceStatus: serviceStatus,
      serviceType: serviceType,
      totalCost: totalCost,
    });
    const data = await result.save();
    res.send(responseGenerator(200, data, ""));
  } catch (error) {
    console.log(error);

    return res.status(500).send(responseGenerator(500));
  }
});
module.exports = router;
