const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const { errors } = require("celebrate");
const mainRouter = require("./routes/index");
const { errorHandler } = require("./middlewares/error-handler");
const { requestLogger, errorLogger } = require("./middlewares/logger");

const app = express();
const { PORT = 3001 } = process.env;

// CORS Middleware
app.use(cors());

// Body Parser Middleware
app.use(express.json());

// Request Logger
app.use(requestLogger);

// Main Route
app.use("/", mainRouter);

// Database Connection & Server Start
mongoose
  .connect("mongodb://127.0.0.1:27017/wtwr_db")
  .then(() => {
    console.log("Connect to DB");
  })
  .catch(console.error);

// Server Crash Test Route (Remove in Production)
app.get("/crash-test", () => {
  setTimeout(() => {
    throw new Error("Server will crash now");
  }, 0);
});

// Error Logger
app.use(errorLogger);

// Celebrate Error Handler
app.use(errors());

// Centralized Error Handler
app.use(errorHandler);

// Port Connection
app.listen(PORT, () => {
  console.log(`App is running on port ${PORT}`);
});
