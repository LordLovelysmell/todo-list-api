const Todo = require("../models/todoModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

module.exports = catchAsync(async (req, res, next) => {
  const todoId = req.params.todoId;
  const todo = await Todo.findById(todoId);

  // Check if todo with todoId exists and user created it by himself
  if (!todo || !todo.createdBy.equals(req.user.id)) {
    return next(
      new AppError(
        `Todo with id "${todoId}" was not found or you might not have access to it.`,
        404
      )
    );
  }

  req.todo = todo;

  next();
});
