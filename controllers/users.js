const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { JWT_SECRET } = require("../utils/config");
const { BadRequestError } = require("../utils/BadRequestError");
const { NotFoundError } = require("../utils/NotFoundError");
const { UnauthorizedError } = require("../utils/UnauthorizedError");
const { ConflictError } = require("../utils/ConflictError");

// PATCH /:updateUsers
const updateUserProfile = (req, res, next) => {
  const userId = req.user._id;
  const { name, avatar } = req.body;
  // console.log(userId);

  if (!name || !avatar) {
    return next(new BadRequestError("Both name and avatar are required"));
  }

  return User.findByIdAndUpdate(
    userId,
    { name, avatar },
    { new: true, runValidators: true }
  )
    .then((updatedUser) => {
      if (!updatedUser) {
        return next(new NotFoundError("User not found"));
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
        return next(new BadRequestError("Invalid data provided"));
      }
      return next(err);
    });
};

// POST /users
const createUser = (req, res, next) => {
  // console.log(req);
  // console.log(req.body);

  const { name, avatar, email, password } = req.body;

  if (!name || !email || !password || !avatar) {
    return next(new BadRequestError("All fields are required"));
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
        return next(new BadRequestError("Invalid data provided"));
      }
      if (err.code === 110000) {
        return next(new ConflictError("Email already exists"));
      }
      return next(err);
    });
};

// GET /:userId
const getCurrentUser = (req, res, next) => {
  const userId = req.user._id;

  User.findById(userId)
    .orFail()
    .then((user) => res.status(200).json(user))
    .catch((err) => {
      console.error(err);
      if (err.name === "DocumentNotFoundError") {
        return next(new NotFoundError("User not found"));
      }
      if (err.name === "CastError") {
        return next(new BadRequestError("Invalid user ID"));
      }
      return next(err);
    });
};

// POST /:login
const login = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new BadRequestError("Email and password are required"));
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
        return next(new UnauthorizedError("Incorrect username or password"));
      }
      return next(err);
    });
};

module.exports = { updateUserProfile, createUser, getCurrentUser, login };
