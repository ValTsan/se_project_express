const { StatusCodes } = require("http-status-codes");
const User = require("../models/user");

//GET /users
const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.status(StatusCodes.OK).json(users))
    .catch((err) => {
      console.error(err);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal Server Error" });
    });
};

//POST /users
const createUser = (req, res) => {
  const { name, avatar } = req.body;

  User.create({ name, avatar })
    .then((user) => res.status(StatusCodes.CREATED).json(user))
    .catch((err) => {
      console.error(err);
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Bad Request" });
    });
};

//GET /:userId
const getUser = (req, res) => {
  const { userId } = req.params;
  User.findById(userId)
    .orFail()
    .then((user) => res.status(StatusCodes.OK).json(user))
    .catch((err) => {
      console.error(err);
      if (err.name === "DocumentNotFoundError") {
        return res.status(StatusCodes.NOT_FOUND).json({ message: "Not Found" });
      } else if (err.name === "CastError") {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "Invalid user ID format" });
      }
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal Server Error" });
    });
};

module.exports = { getUsers, createUser, getUser };
