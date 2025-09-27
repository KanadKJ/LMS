const mongoose = require("mongoose");
const { Schema } = mongoose;

const settingsSchema = new Schema({
  outletName: {
    type: String,
    required: true,
  },
  tagline: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  esign: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("settings", settingsSchema);
