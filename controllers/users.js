const User = require("../models/user");
const { DEFAULT, BAD_REQUEST, NOT_FOUND } = require("../utils/errors");

// GET /users
const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.status(200).json(users))
    .catch((err) => {
      console.error(err);
      return res.status(DEFAULT).json({ message: "Internal Server Error" });
    });
};

// POST /users
const createUser = (req, res) => {
  console.log(req);
  console.log(req.body);

  const { name, avatar } = req.body;

  User.create({ name, avatar })
    .then((user) => res.status(201).json(user))
    .catch((err) => {
      console.error(err);
      return res.status(BAD_REQUEST).json({ message: "Bad Request" });
    });
};

// GET /:userId
const getUser = (req, res) => {
  const { userid } = req.params;
  console.log("Received userId:", userid);

  User.findById(userid)
    .orFail()
    .then((user) => res.status(200).json(user))
    .catch((err) => {
      console.error(err);
      if (err.name === "DocumentNotFoundError") {
        return res.status(NOT_FOUND).json({ message: "Not Found" });
      }
      if (err.name === "CastError") {
        return res.status(BAD_REQUEST).json({ message: "Bad Request" });
      }
      return res.status(DEFAULT).json({ message: "Internal Server Error" });
    });
};

module.exports = { getUsers, createUser, getUser };
