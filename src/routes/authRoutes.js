const express = require("express");

const authController = require("../controllers/authController");

const router = express.Router();

// Create a new user
router.post("/sign-up", authController.signUp);

// Authentificate a user
router.post("/sign-in", authController.signIn);

// Refresh expired access token
router.post("/token/refresh", authController.refreshToken);

module.exports = router;
