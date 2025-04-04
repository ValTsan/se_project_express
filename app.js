const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const mainRouter = require("./routes/index");
const { errorHandler } = require("./middlewares/error-handler");
const { errors } = require("celebrate");

const app = express();
const { PORT = 3001 } = process.env;

// Routes
app.use(cors());
app.use(express.json());
app.use("/", mainRouter);

// Database Connection & Server Start
mongoose
  .connect("mongodb://127.0.0.1:27017/wtwr_db")
  .then(() => {
    console.log("Connect to DB");
  })
  .catch(console.error);

// Celebrate Error Handler
app.use(errors());

// Centralized Error Handler
app.use(errorHandler);

// Port Connection
app.listen(PORT, () => {
  console.log(`App is running on port ${PORT}`);
});
