const { type } = require("express/lib/response");
const mongoose = require("mongoose");
const { Schema } = mongoose;

const categoriesSchema = new Schema(
  {
    categoryName: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("category", categoriesSchema);
