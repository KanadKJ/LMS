const mongoose = require("mongoose");
const { Schema } = mongoose;

const customerDetailsSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("userManagement", customerDetailsSchema);
