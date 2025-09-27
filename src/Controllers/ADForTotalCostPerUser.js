const Record = require("../Models/Records/RecordsModel"); // adjust path

async function getCustomerTotals() {
  return await Record.aggregate([
    {
      $group: {
        _id: { userId: "$userId", name: "$name", mobile: "$mobile" },
        totalSpent: { $sum: "$totalCost" },
        recordsCount: { $count: {} },
      },
    },
    {
      $project: {
        _id: 0,
        userId: "$_id.userId",
        name: "$_id.name",
        mobile: "$_id.mobile",
        totalSpent: 1,
        recordsCount: 1,
      },
    },
    { $sort: { totalSpent: -1 } },
  ]);
}

module.exports = getCustomerTotals;
