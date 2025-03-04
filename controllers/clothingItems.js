const ClothingItem = require("../models/clothingItems");
const {
  DEFAULT,
  BAD_REQUEST,
  NOT_FOUND,
  FORBIDDEN_ERROR,
} = require("../utils/errors");

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
      return res.status(DEFAULT).json({ message: "Internal server error" });
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
      return res.status(DEFAULT).json({ message: "Internal Server Error" });
    });
};

// DELETE /items/:itemId
// const deleteItem = (req, res) => {
//   const { itemId } = req.params;
//   console.log("Deleting item:", itemId);

//   ClothingItem.findById(itemId)
//     .orFail()
//     .then((item) => {
//       const ownerId = item.owner.toString();
//       if (ownerId !== req.user._id) {
//         throw new Error("You are not allowed to delete this item");
//       }
//       return ClothingItem.findByIdAndDelete(itemId);
//     })
//     .then((deletedItem) => {
//       res
//         .status(200)
//         .json({ message: "Item deleted successfully", deletedItem });
//     })
//     .catch((err) => {
//       console.error(err);

//       if (err.name === "DocumentNotFoundError") {
//         return res.status(NOT_FOUND).json({ message: "Item not found" });
//       }
//       if (err.name === "CastError") {
//         return res.status(BAD_REQUEST).json({ message: "Validation error" });
//       }
//       return res.status(DEFAULT).json({ message: "Internal Server Error" });
//     });
// };

const deleteItem = (req, res) => {
  const { itemId } = req.params;
  ClothingItem.findById(itemId)
    .orFail()
    .then((item) => {
      const ownerId = item.owner.toString();
      if (ownerId !== req.user._id) {
        throw new Error("Forbidden");
      }
      return ClothingItem.findByIdAndDelete(itemId);
    })

    .then(() => res.status(OK).send({ message: "Item deleted" })) // keep inside then block the response in case everything is successful / correct
    .catch((err) => {
      if (err.name === "DocumentNotFoundError") {
        return res.status(NOT_FOUND).send({ message: "Item not found" });
      }
      if (err.message === "Forbidden") {
        return res
          .status(FORBIDDEN)
          .send({ message: "You are not authorized to delete this item" });
      }

      if (err.name === "CastError") {
        return res.status(BAD_REQUEST).send({ message: "Invalid ID format" });
      }
      return res.status(DEFAULT).send({ message: "Server error occurred" });
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
      return res.status(DEFAULT).json({ message: "Internal Server Error" });
    });
};

// UNLIKE/DELETE Like
const deleteLike = (req, res) => {
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
      return res.status(DEFAULT).json({ message: "Internal Server Error" });
    });
};

module.exports = { getItems, createItem, deleteItem, likeItem, deleteLike };
