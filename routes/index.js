const router = require("express").Router();

const userRouter = require("./users");
const clothingItem = require("./clothingItemssss");
const { createUser } = require("../controllers/users");
const { NOT_FOUND } = require("../utils/errors");

//User Sigin/Signup
router.post("/signup", createUser);

// Route definitions
router.use("/users", userRouter);
router.use("/items", clothingItem);

// Handle non-existent routes with a `404 Not Found` error
router.use((req, res) => {
  res.status(NOT_FOUND).json({ message: "Requested resource not found" });
});

module.exports = router;
