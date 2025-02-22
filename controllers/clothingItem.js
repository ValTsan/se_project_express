const ClothingItem = require("../models/clothingItem");

const BadRequestError = require("../errors/BadRequestError");
const NotFoundError = require("../errors/NotFoundError");
const ForbiddenError = require("../errors/ForbiddenError");

//POST /items
const createItem = (req, res, next, err) => {
  console.log("Received user ID:", req.user._id);

  const { name, weather, imageUrl } = req.body;
  const owner = req.user._id;

  ClothingItem.create({ name, weather, imageUrl, owner })
    .then((item) => {
      console.log(item);
      res.status(200).json(item);
    })
    .catch((error) => {
      console.error(err);
      if (error.name === "ValidationError") {
        return next(new BadRequestError("Validation error"));
      }
      return next(err);
    });
};

//GET /items
const getItems = (req, res, next) => {
  const { itemId } = req.params;
  console.log(itemId);

  ClothingItem.find({})
    .then((items) => res.status(200).json(items))
    .catch((err) => {
      console.error(err);
      console.log(err.name);
      if (err.name === "DocumentNotFoundError") {
        return next(new NotFoundError("Item not found"));
      }
      return next(err);
    });
};

// DELETE /items/:itemId
const deleteItem = (req, res, next) => {
  const { itemId } = req.params;
  console.log(itemId);

  ClothingItem.findById(itemId)
    .orFail()
    .then((item) => {
      if (req.user._id !== item.owner.toString()) {
        const error = new Error();
        error.name = "ForbiddenError";
        throw error;
      }
      return ClothingItem.findByIdAndDelete(itemId);
    })
    .then((items) => res.status(200).send({ items }))
    .catch((err) => {
      console.error(err);

      if (err.name === "DocumentNotFoundError") {
        return next(new NotFoundError("Item not found"));
      }
      if (err.name === "CastError") {
        return next(new BadRequestError("Validation error"));
      }

      if (err.name === "ForbiddenError") {
        return next(new ForbiddenError("Forbidden action"));
      }
      return next(err);
    });
};

//LIKE Item
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
        return next(new NotFoundError("item not found"));
      }
      if (err.name === "CastError") {
        return next(new BadRequestError("Validation error"));
      }
      return next(err);
    });
};

//UNLIKE/DELETE Like
const deleteLike = (req, res, next) => {
  ClothingItem.findByIdAndUpdate(
    req.params.itemId,
    { $pull: { likes: req.user._id } },
    { new: true }
  )
    .orFail()
    .then((items) => res.status(200).send(items))
    .catch((err) => {
      if (err.name === "DocumentNotFoundError") {
        return next(new NotFoundError("item not found"));
      }
      if (err.name === "CastError") {
        return next(new BadRequestError("Validation error"));
      }
      return next(err);
    });
};

module.exports = { getItems, createItem, deleteItem, likeItem, deleteLike };
