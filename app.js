const express = require("express");
const mongoose = require("mongoose");
const mainRouter = require("./routes/index");
const errorHandler = require("./middlewares/error-handler");

const app = express();
const { PORT = 3001 } = process.env;

// Middleware hardcoded user object
app.use((req, res, next) => {
  req.user = {
    _id: "67b967d41a9c58677cf18699",
  };
  next();
});

// Routes
app.use(express.json());
app.use("/", mainRouter);

// Error Handling
app.use(errorHandler);

// Database Connection & Server Start
mongoose
  .connect("mongodb://127.0.0.1:27017/wtwr_db")
  .then(() => {
    console.log("Connect to DB");
  })
  .catch(console.error);

// Port Connection
app.listen(PORT, () => {
  console.log(`App is running on port ${PORT}`);
});
