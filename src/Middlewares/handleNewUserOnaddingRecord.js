const responseGenerator = require("../config/Constants/Response");
const user = require("../Models/UserManagement/UserManagement.js");

const handleNewUserOnAddingRecord = async (req, res, next) => {
  const { newuser, name, mobile, address } = req.body;
  try {
    if (newuser) {
      const userExist = await user.exists({ mobile: mobile });
      if (userExist) {
        return res
          .status(500)
          .send(responseGenerator(500, [], "User Already exists"));
      }
      const data = await new user({
        name: name,
        mobile: mobile,
        address: address,
      });

      const userDetails = await data.save();
      if (!userDetails) {
        return res
          .status(409)
          .send(responseGenerator(409, [], "User Already exists"));
      }
      req.userDetails = userDetails;
      next();
    } else {
      return next();
    }
  } catch (error) {
    return res.status(500).send(responseGenerator(500));
  }
};

module.exports = handleNewUserOnAddingRecord;
