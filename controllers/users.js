const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { JWT_SECRET } = require("../utils/config");
const {
  DEFAULT,
  BAD_REQUEST,
  NOT_FOUND,
  DUPLICATE,
  UNAUTHORIZED,
} = require("../utils/errors");

// PATCH /:updateUsers
const updateUserProfile = (req, res) => {
  const userId = req.user._id;
  const { name, avatar } = req.body;
  console.log(userId);

  if (!name || !avatar) {
    return res
      .status(BAD_REQUEST)
      .json({ message: "Both name and avatar are required" });
  }

  return User.findByIdAndUpdate(
    userId,
    { name, avatar },
    { new: true, runValidators: true }
  )
    .then((updatedUser) => {
      if (!updatedUser) {
        return res.status(NOT_FOUND).json({ message: "User not found" });
      }
      return res.status(200).json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
      });
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        return res
          .status(BAD_REQUEST)
          .json({ message: "Invalid data provided" });
      }
      return res
        .status(DEFAULT)
        .json({ message: "Error message from userGetUser" });
    });
};

// POST /users
const createUser = (req, res) => {
  console.log(req);
  console.log(req.body);

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

      if (err.name === "ValidationError") {
        return res.status(BAD_REQUEST).json({ message: "Bad Request" });
      }
      if (err.code === 110000) {
        return res.status(DUPLICATE).json({ message: "Email already exists" });
      }
      return res.status(DEFAULT).json({ message: "Internal Server Error" });
    });
};

// GET /:userId
const getCurrentUser = (req, res) => {
  const userId = req.user._id;

  User.findById(userId)
    .orFail()
    .then((user) => res.status(200).json(user))
    .catch((err) => {
      console.error(err);
      if (err.name === "DocumentNotFoundError") {
        return res.status(NOT_FOUND).json({ message: "User not Found" });
      }
      if (err.name === "CastError") {
        return res.status(BAD_REQUEST).json({ message: "Bad Request" });
      }
      return res.status(DEFAULT).json({ message: "Internal Server Error" });
    });
};

// POST /:login
const login = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(BAD_REQUEST)
      .json({ message: "Email and password are required" });
  }
  return User.findUserByCredentials({ email, password })
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });
      return res.status(200).json({ token });
    })
    .catch((err) => {
      if (err.message === "Incorrect username or password") {
        return res
          .status(UNAUTHORIZED)
          .json({ message: "Incorrect username or password" });
      }
      return res.status(DEFAULT).send({ message: "Internal server error" });
    });
};

module.exports = { updateUserProfile, createUser, getCurrentUser, login };
