const User = require("../models/user");
const { StatusCodes } = require("http-status-codes");

//GET /users
const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.status(StatusCodes.OK).json(users))
    .catch((err) => {
      console.error(err);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: err.message });
    });
};

//POST /users
const createUser = (req, res) => {
  const { name, avatar } = req.body;

  User.create({ name, avatar })
    .then((user) => res.status(StatusCodes.CREATED).json(user))
    .catch((err) => {
      console.error(err);
      return res.status(StatusCodes.BAD_REQUEST).json({ message: err.message });
    });
};

//GET /:userId
const getUser = (req, res) => {
  const { userId } = req.params;

  User.findById(userId)
    .then((user) => {
      if (!user) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: "User not found" });
      }
      res.status(StatusCodes.OK).json(user);
    })

    .catch((err) => {
      console.error("Database error:", err);
      if (err.name === "CastError") {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "Invalid user ID format" });
      }
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Server error" });
    });
};

module.exports = { getUsers, createUser, getUser };
