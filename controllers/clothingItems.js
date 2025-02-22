const ClothingItem = require("../models/clothingItem");
const { DEFAULT, BAD_REQUEST, NOT_FOUND } = require("../utils/errors");

// POST /items
const createItem = (req, res) => {
  console.log("Received user ID:", req.user._id);

  const { name, weather, imageUrl } = req.body;
  const owner = req.user._id;

  ClothingItem.create({ name, weather, imageUrl, owner })
    .then((item) => {
      console.log(item);
      res.status(200).json(item);
    })
    .catch((error) => {
      console.error(error.name);
      if (error.name === "ValidationError") {
        return res.status(BAD_REQUEST).json({ message: "Validation error" });
      }
    });
};

// GET /items
const getItems = (req, res) => {
  const { itemId } = req.params;
  console.log(itemId);

  ClothingItem.find({})
    .then((items) => res.status(200).json(items))
    .catch((err) => {
      console.error(err);
      console.log(err.name);
      if (err.name === "DocumentNotFoundError") {
        return next(new NOT_FOUND("Item not found"));
      }
      return res.status(DEFAULT).json({ message: "Internal Server Error" });
    });
};

// DELETE /items/:itemId
const deleteItem = (req, res) => {
  const { itemId } = req.params;
  console.log("Deleting item:", itemId);

  ClothingItem.findById(itemId)
    .orFail()
    .then((item) => {
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      return ClothingItem.findByIdAndDelete(itemId);
    })
    .then((items) => res.status(200).send({ items }))
    .catch((err) => {
      console.error(err);

      if (err.name === "DocumentNotFoundError") {
        return res.status(NOT_FOUND).json({ message: "Item not found" });
      }
      if (err.name === "CastError") {
        return res.status(BAD_REQUEST).json({ message: "Validation error" });
      }
    });
};

// LIKE Item
const likeItem = (req, res) => {
  // http://localhost:3001/items/12d124d121212/likes
  ClothingItem.findByIdAndUpdate(
    req.params.itemId,
    { $addToSet: { likes: req.user._id } },
    { new: true }
  )
    .orFail()
    .then((items) => res.status(200).send(items))
    .catch((err) => {
      if (err.name === "DocumentNotFoundError") {
        return res.status(NOT_FOUND).json({ message: "Item not found" });
      }
      if (err.name === "CastError") {
        return res.status(BAD_REQUEST).json({ message: "Validation error" });
      }
    });
};

// UNLIKE/DELETE Like
const deleteLike = (req, res, next) => {
  ClothingItem.findByIdAndUpdate(
    req.params.itemId,
    { $pull: { likes: req.user._id } },
    { new: true }
  )
    .orFail()
    .then((items) => res.status(200).json(items))
    .catch((err) => {
      if (err.name === "DocumentNotFoundError") {
        return res.status(NOT_FOUND).json({ message: "item not found" });
      }
      if (err.name === "CastError") {
        return res.status(BAD_REQUEST).json({ message: "Validation error" });
      }
    });
};

module.exports = { getItems, createItem, deleteItem, likeItem, deleteLike };
