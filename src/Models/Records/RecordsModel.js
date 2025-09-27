const mongoose = require("mongoose");
const { Schema } = mongoose;
const AutoIncrement = require("mongoose-sequence")(mongoose);
const recordsSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      required: true,
      index: true,
    },

    serviceType: {
      type: Array,

      required: true,
    },
    serviceStatus: {
      type: String,
      enum: {
        values: [
          "New",
          "Pending",
          "Processing",
          "Completed",
          "Delivered",
          "Cancelled",
        ],
        message: "Wrong status type",
      },
      required: true,
    },

    indivisualCost: {
      type: Array,
      required: true,
    },

    totalCost: {
      type: Number,
      required: true,
    },
    address: {
      type: String,
      required: false,
    },
    userId: {
      type: String,
      required: true,
    },
    newuser: {
      type: Boolean,
      require: true,
    },
    recordNumber: {
      type: Number,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);
recordsSchema.plugin(AutoIncrement, {
  id: "records_seq",
  inc_field: "recordNumber", // <-- string!
  start_seq: 1,
});
module.exports = mongoose.model("records", recordsSchema);
