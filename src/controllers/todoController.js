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

exports.getTodo = catchAsync(async (req, res, next) => {
  const todo = await Todo.findById(req.params.id);

  if (!todo) {
    return next(new AppError(`Todo with id "${req.params.id}" was not found.`));
  }

  return res.status(201).json({
    status: "success",
    data: {
      todo: todo,
    },
  });
});

exports.updateTodo = catchAsync(async (req, res, next) => {
  const todo = await Todo.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!todo) {
    return next(new AppError("No todo found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      todo,
    },
  });
});

exports.deleteTodo = catchAsync(async (req, res, next) => {
  const todo = await Todo.findByIdAndDelete(req.params.id);

  if (!todo) {
    return next(new AppError("No todo found with that ID", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});
