const router = require("express").Router();

const clothingItem = require("./clothingItems");
const NotFoundError = require("../errors/BadRequestError");
const userRouter = require("./users");

//Route definitions
router.use("/users", userRouter);
router.use("/items", clothingItem);

//Handle non-existent routes with a `404 Not Found` error
router.use((req, res) => {
  res.next(new NotFoundError("Requested resource not found"));
});

module.exports = router;
