const User = require("../models/user");

const getUsers = (req, res) => {
  User.find({})
    .then((users) => {
      throw Error("AHHHHH!!!");
      res.send(users);
    })
    .catch((err) => {
      console.err(err);
      return res.status(500).send({ message: err.message });
    });
};

module.exports = { getUsers };
