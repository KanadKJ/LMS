const express = require("express");
const router = express.Router();
const recordsModel = require("../Models/Records/RecordsModel.js");
const handleNewUserOnAddingRecord = require("../Middlewares/handleNewUserOnaddingRecord.js");

//add new record

router.post("/addRecord", handleNewUserOnAddingRecord, async (req, res) => {
  const {
    name,
    mobile,
    serviceType,
    serviceStatus,
    indivisualCost,
    totalCost,
    address,
    userId,
    newuser,
  } = req.body;

  const uid = newuser ? req?.userDetails?._id : userId;
  const records = new recordsModel({
    name: name,
    mobile: mobile,
    serviceStatus: serviceStatus,
    serviceType: serviceType,
    indivisualCost: indivisualCost,
    totalCost: totalCost,
    address: address,
    userId: uid,
    newuser: newuser,
  });
  try {
    await records.save();
    res.send({
      statusCode: 200,
      value: ["Record added successfully"],
      errors: [],
    });
  } catch (err) {
    res.status(500).send({
      statusCode: 500,
      value: [],
      errors: [err.message],
    });
  }
});

//get all records

router.get("/getAllRecords", async (req, res) => {
  try {
    const result = await recordsModel.find({}).sort({ createdAt: -1 });
    res.send({
      statusCode: 200,
      value: result,
      errors: [],
    });
  } catch (err) {
    res.status(500).send({
      statusCode: 500,
      value: [],
      errors: [err.message],
    });
  }
});

// update a single record

router.patch("/updateRecord", async (req, res) => {
  const { id } = req.body;
  try {
    const result = await recordsModel.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!result) {
      res.status(404).send({
        statusCode: 404,
        value: [],
        errors: ["Record not found"],
      });
    }
    res.send({
      statusCode: 200,
      value: [result],
      errors: [],
    });
  } catch (err) {
    res.status(500).send({
      statusCode: 500,
      value: [],
      errors: [err.message],
    });
  }
});

//delete a records

router.delete("/deleteRecord", async (req, res) => {
  const { id } = req.body;
  try {
    const result = await recordsModel.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).send({
        statusCode: 404,
        value: [],
        errors: ["Record not found"],
      });
    }
    return res.send({
      statusCode: 200,
      value: [result],
      errors: [],
    });
  } catch (err) {
    res.status(500).send({
      statusCode: 500,
      value: [],
      errors: [err.message],
    });
  }
});

module.exports = router;
