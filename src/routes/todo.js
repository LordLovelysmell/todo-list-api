const express = require("express");
const router = express.Router();
const authenticateAccessToken = require("../middleware/authenticateAccessToken");
const Todo = require("../models/Todo");

router.all("*", authenticateAccessToken);

router.get("/", async (req, res) => {
  const todos = await Todo.find();

  return res.status(200).json({
    status: "success",
    data: {
      todos,
    },
  });
});

router.post("/", async (req, res) => {
  const { title, description, status } = req.body;

  const todo = new Todo({
    title,
    description,
    status,
  });

  return res.status(201).json({
    status: "success",
    data: {
      todo,
    },
  });
});

module.exports = router;
