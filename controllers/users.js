const User = require("../models/user");

const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send(users))
    .catch((err) => {
      console.err(err);
      return res.status(500).send({ message: err.message });
    });
};

module.exports = { getUsers };
