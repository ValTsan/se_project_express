const bcrypt = require("bcrypt");
const User = require("../models/user");
const {
  DEFAULT,
  BAD_REQUEST,
  NOT_FOUND,
  DUPLICATE,
} = require("../utils/errors");
const user = require("../models/user");

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
  // console.log(req);
  // console.log(req.body);

  const { name, avatar, email, password } = req.body;

  if (!name || !email || !password || !avatar) {
    return res.status(BAD_REQUEST).json({ message: "All fields are required" });
  }
  return User.findOne({ email })
    .select("+password")
    .then((user) => {
      if (user) {
        const error = new Error();
        error.code = 110000;
        throw error;
      }

      return bcrypt
        .hash(password, 10)
        .then((hashedPassword) =>
          User.create({ name, avatar, email, password: hashedPassword })
        );
    })
    .then((user) =>
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      })
    )

    .catch((err) => {
      console.error(err);

      if (err.code === 11000) {
        return res.status(DUPLICATE).json({ message: "Email already exists" });
      }

      if (err.name === "ValidationError") {
        return res.status(BAD_REQUEST).json({ message: "Bad Request" });
      }
      return res.status(DEFAULT).json({ message: "Internal Server Error" });
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
