const router = require("express").Router();
const userRouter = require("./users");
const clothingItem = require("./clothingItemssss");
const { createUser, login } = require("../controllers/users");
const { NotFoundError } = require("../utils/NotFoundError");

// Public Routes (No Authentication Required)
router.post("/signin", login); // Login
router.post("/signup", createUser); // Sign up
router.use("/items", clothingItem);

// Protected Routes (Require Authentication)
router.use("/users", userRouter);

// 404 Handler (For Non-Existent Routes)
router.use((req, res, next) => {
  next(new NotFoundError("Requested resource not found"));
});

module.exports = router;
