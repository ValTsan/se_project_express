const ClothingItem = require("../models/clothingItems");
const { BadRequestError } = require("../utils/BadRequestError");
const { ForbiddenError } = require("../utils/ForbiddenError");
const { NotFoundError } = require("../utils/NotFoundError");
const { UnauthorizedError } = require("../utils/UnauthorizedError");

// POST /items
const createItem = (req, res, next) => {
  console.log("Received user ID:", req.user._id);

  const { name, weather, imageUrl } = req.body;
  const owner = req.user._id;

  ClothingItem.create({ name, weather, imageUrl, owner })
    .then((item) => {
      console.log(item);
      res.send(item);
    })
    .catch((error) => {
      console.error(error.name);

      if (error.name === "ValidationError") {
        next(new BadRequestError("Invalid data provided"));
      }
      return next(error);
    });
};

// GET /items
const getItems = (req, res, next) => {
  const { itemId } = req.params;
  console.log(itemId);

  ClothingItem.find({})
    .then((items) => res.send(items))
    .catch((err) => next(err));
};

// DELETE /items/:itemId
const deleteItem = (req, res, next) => {
  const { itemId } = req.params;
  // console.log("deleting Clothing Items");

  if (!req.user) {
    next(new UnauthorizedError("Authentication required"));
    return;
  }

  return ClothingItem.findById(itemId)
    .orFail()
    .then((item) => {
      if (item.owner.toString() !== req.user._id.toString()) {
        return next(
          new ForbiddenError("You are not authorized to delete this item")
        );
      }
      return ClothingItem.findByIdAndDelete(itemId).then((deletedItem) =>
        res.send(deletedItem)
      );
    })
    .catch((err) => {
      console.error("Item deletion error", err);

      if (err.name === "CastError") {
        next(new BadRequestError("Invalid data provided"));
      }
      if (err.name === "DocumentNotFoundError") {
        next(new NotFoundError("Id provided was not found"));
      }
      if (err.name === "UnauthorizedError") {
        next(new UnauthorizedError("Authentication required"));
      }
      return next(err);
    });
};

// LIKE Item
const likeItem = (req, res, next) => {
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
        return next(new NotFoundError("Item not found"));
      }
      if (err.name === "CastError") {
        return next(new BadRequestError("Validation error"));
      }
      return next(err);
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
        return next(new NotFoundError("Item Not Found"));
      }
      if (err.name === "CastError") {
        return next(new BadRequestError("Validation error"));
      }
      return next(err);
    });
};

module.exports = { getItems, createItem, deleteItem, likeItem, deleteLike };
