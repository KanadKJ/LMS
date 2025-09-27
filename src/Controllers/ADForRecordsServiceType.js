const RecordsModel = require("../Models/Records/RecordsModel.js");
async function getAllServiceStatusCounts() {
  const [doc] = await RecordsModel.aggregate([
    {
      $group: {
        _id: null,
        New: { $sum: { $cond: [{ $eq: ["$serviceStatus", "New"] }, 1, 0] } },
        Pending: {
          $sum: { $cond: [{ $eq: ["$serviceStatus", "Pending"] }, 1, 0] },
        },
        Processing: {
          $sum: { $cond: [{ $eq: ["$serviceStatus", "Processing"] }, 1, 0] },
        },
        Completed: {
          $sum: { $cond: [{ $eq: ["$serviceStatus", "Completed"] }, 1, 0] },
        },
        Delivered: {
          $sum: { $cond: [{ $eq: ["$serviceStatus", "Delivered"] }, 1, 0] },
        },
        Cancelled: {
          $sum: { $cond: [{ $eq: ["$serviceStatus", "Cancelled"] }, 1, 0] },
        },
        total: { $sum: 1 },
      },
    },
    { $project: { _id: 0 } },
  ]);

  return (
    doc || {
      New: 0,
      Pending: 0,
      Processing: 0,
      Completed: 0,
      Delivered: 0,
      Cancelled: 0,
      total: 0,
    }
  );
}
module.exports = getAllServiceStatusCounts;
