const express = require("express");
const { signupValidation, loginValidation } = require("../validations/authValidation");
const validate = require("../middlewares/validate.middleware");
const { authMiddleware } = require("../middlewares/auth.Middleware");
const {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser
} = require("../controllers/auth.controller");

const router = express.Router();

router.post("/register", signupValidation, validate, registerUser);
router.post("/login", loginValidation, validate, loginUser);
router.get("/me", authMiddleware, getCurrentUser);
router.post("/logout", logoutUser);

module.exports = router;
