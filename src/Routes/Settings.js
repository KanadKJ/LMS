const express = require("express");
const router = express.Router();
const settingsModel = require("../Models/Settings/Settings");
const responseGenerator = require("../config/Constants/Response");
router.get("/getSettings", async (req, res) => {
  try {
    const data = await settingsModel.find({});
    if (data.length === 0) {
      return res.status(200).send(responseGenerator(404, [], "Data not found"));
    }
    return res.send(responseGenerator(200, data, ""));
  } catch (error) {
    return res.status(500).send(responseGenerator(500, [], error.message));
  }
});
router.post("/addSettings", async (req, res) => {
  const { outletName, tagline, mobile, email, address, esign } = req.body;
  try {
    const result = new settingsModel({
      outletName: outletName,
      tagline: tagline,
      mobile: mobile,
      email: email,
      address: address,
      esign: esign,
    });
    await result.save();
    if (!result) {
      return responseGenerator(404, [], "Data not found");
    }
    return res.send(responseGenerator(200, result, ""));
  } catch (error) {
    return res.status(500).send(responseGenerator(500));
  }
});
router.patch("/updateSettings", async (req, res) => {
  const { outletName, tagline, mobile, email, address, esign, _id } = req.body;
  try {
    const data = await settingsModel.findByIdAndUpdate(
      _id,
      {
        outletName: outletName,
        tagline: tagline,
        mobile: mobile,
        email: email,
        address: address,
        esign: esign,
      },
      {
        new: true,
      }
    );
    if (!data) {
      return responseGenerator(404, [], "Data not found");
    }
    return res.send(responseGenerator(200, [data], ""));
  } catch (error) {
    return res.status(500).send(responseGenerator(500));
  }
});

module.exports = router;
