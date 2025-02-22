const router = require("express").Router();

const userRouter = require("./users");
const itemRouter = require("./clothingItems.js");
const { NOT_FOUND } = require("../utils/errors");

// Route definitions
router.use("/users", userRouter);
router.use("/items", itemRouter);

// Handle non-existent routes with a `404 Not Found` error
router.use((req, res) => {
  res.status(NOT_FOUND).send("Requested resource not found");
});

module.exports = router;
