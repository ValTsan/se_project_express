const router = require("express").Router();

router.get("/users", () => console.log("GET users"));
router.get("/:userId", () => console.log("GET users/:userId"));
router.post("/", () => console.log("POST users"));

module.exports = router;
