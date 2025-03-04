const router = require("express").Router();
const userRouter = require("./users");
const clothingItem = require("./clothingItemssss");
const { createUser, login } = require("../controllers/users");
const { NOT_FOUND } = require("../utils/errors");

// Public Routes (No Authentication Required)
router.post("/signin", login); // Login
router.post("/signup", createUser); // Sign up
router.use("/items", clothingItem);

// Protected Routes (Require Authentication)
router.use("/users", userRouter);

// 404 Handler (For Non-Existent Routes)
router.use((req, res) => {
  res.status(NOT_FOUND).json({ message: "Requested resource not found" });
});

module.exports = router;
