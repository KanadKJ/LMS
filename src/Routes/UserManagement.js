const responseGenerator = require("../../src/config/Constants/Response.js");
const express = require("express");
const router = express.Router();
const users = require("../Models/UserManagement/UserManagement.js");
router.post("/addUser", async (req, res) => {
  const { mobile, name, address } = req.body;
  try {
    const userExist = await users.exists({ mobile: mobile });
    if (userExist) {
      return res
        .status(500)
        .send(responseGenerator(500, [], "User Already exists"));
    }

    const userDetails = new users({
      name: name,
      mobile: mobile,
      address: address,
    });
    const newUserdata = await userDetails.save();
    return res.send(responseGenerator(200, newUserdata, ""));
  } catch (error) {
    res.status(500).send(responseGenerator(500, [], "something went worng!"));
  }
});

router.get("/getAllUsers", async (req, res) => {
  try {
    const data = await users.find({}).sort({ createdAt: -1 });
    res.send(responseGenerator(200, data, ""));
  } catch (error) {
    res.status(500).send(responseGenerator(500, [], "Something went wrong"));
  }
});

router.patch("/updateUser", async (req, res) => {
  const { id } = req.body;
  try {
    const value = await users.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!value) {
      return res
        .status(409)
        .send(responseGenerator(409, [], "user dont exists"));
    }

    return res.send(responseGenerator(200, value, ""));
  } catch (error) {
    res.status(500).send(responseGenerator());
  }
});

router.delete("/deleteUser", async (req, res) => {});

module.exports = router;
