const router = require("express").Router();
const userController = require("./userController");
const { authenticateToken } = require("./../middleware/authenticate");

router.post("/login", userController.login);
router.post("/signup", userController.signup);
router.delete("/delete-user", authenticateToken, userController.deleteUser);


module.exports = router;