const router = require("express").Router();
const auth = require("../middlewares/auth");
const { updateUserProfile, getCurrentUser } = require("../controllers/users");
const { validateUpdateUser } = require("../middlewares/validation");

router.get("/me", auth, getCurrentUser);
router.patch("/me", auth, validateUpdateUser, updateUserProfile);

module.exports = router;
