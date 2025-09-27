const mongoose = require("mongoose");
const { Schema } = mongoose;

const invoiceHistorySchema = new Schema(
  {
    invoiceId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      required: true,
    },

    serviceType: {
      type: Array,

      required: true,
    },
    serviceStatus: {
      type: String,
      validate(value) {
        if (
          ![
            "New",
            "Pending",
            "Processing",
            "Completed",
            "Delivered",
            "Cancelled",
          ].includes(value)
        ) {
          throw new Error("service status does not exist");
        }
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
      required: true,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("invoiceHistory", invoiceHistorySchema);
/**
 * 
 * 
 * {
    "_id": "68b874b990e8da255aa554d5",
    "name": "Test new user",
    "mobile": "5965478965",
    "serviceType": [
        "W&I"
    ],
    "serviceStatus": "New",
    "indivisualCost": [
        {
            "name": "W&I",
            "qtyInKg": 4,
            "lineTotal": 40,
            "priceOfservice": 10
        }
    ],
    "totalCost": 40,
    "address": "test place",
    "createdAt": "2025-09-03T17:02:49.049Z",
    "updatedAt": "2025-09-03T17:02:49.049Z",
    "__v": 0,
    "i": 0
}
 */
