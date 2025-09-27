const express = require("express");
const connectDb = require("./src/config/DB/db");
require("dotenv").config();
const recordsRoute = require("./src/Routes/Records.js");
const categoriesRoute = require("./src/Routes/Categories.js");
const analyticsRoute = require("./src/Routes/Analytics.js");
const userManagementRoute = require("./src/Routes/UserManagement.js");
const invoicehistoryRoute = require("./src/Routes/InvoiceHistory.js");
const settingsRoute = require("./src/Routes/Settings.js");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());
app.use("/records", recordsRoute); // http://localhost:5050/records/addRecord
app.use("/categories", categoriesRoute); // http://localhost:5050/categories/getAllRecords
app.use("/analytics", analyticsRoute); // http://localhost:5050/analytics/getAllRecordsByDate
app.use("/um", userManagementRoute); // http://localhost:5050/um/addUser
app.use("/invoicehistory", invoicehistoryRoute); // http://localhost:5050/um/addUser
app.use("/settings", settingsRoute); // http://localhost:5050/settings/getSettings

connectDb()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log("app running on 5050");
    });
  })
  .catch((e) => {
    console.log(e);
  });

// "127.0.0.1:27017"
