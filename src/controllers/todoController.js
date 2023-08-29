const Todo = require("../models/todoModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.getAllTodos = catchAsync(async (req, res, next) => {
  const todos = await Todo.find();

  return res.status(200).json({
    status: "success",
    data: {
      todos,
    },
  });
});

exports.createTodo = catchAsync(async (req, res, next) => {
  const newTodo = await Todo.create(req.body);

  return res.status(201).json({
    status: "success",
    data: {
      todo: newTodo,
    },
  });
});
