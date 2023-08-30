const Comment = require("../models/commentModel");
const Todo = require("../models/todoModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.createComment = catchAsync(async (req, res, next) => {
  const comment = await Comment.create({
    todoId: req.params.todoId,
    text: req.body.text,
  });

  return res.status(201).json({
    status: "success",
    data: {
      comment,
    },
  });
});

exports.getCommentsForTodo = catchAsync(async (req, res, next) => {
  const comments = await Comment.find({
    todoId: req.params.todoId,
  });

  return res.status(200).json({
    status: "success",
    data: {
      comments,
    },
  });
});

exports.getCommentById = catchAsync(async (req, res, next) => {
  const comment = await Comment.findById(req.params.commentId);

  if (!comment) {
    return next(new AppError("No comment found with that ID", 404));
  }

  return res.status(200).json({
    status: "success",
    data: {
      comment,
    },
  });
});

exports.updateComment = catchAsync(async (req, res, next) => {
  const comment = await Comment.findOneAndUpdate(
    {
      _id: req.params.commentId,
    },
    {
      text: req.body.text,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!comment) {
    return next(new AppError("No comment found with that ID", 404));
  }

  return res.status(200).json({
    status: "success",
    data: {
      comment,
    },
  });
});

exports.deleteComment = catchAsync(async (req, res, next) => {
  const comment = await Comment.findOneAndDelete({
    _id: req.params.commentId,
  });

  if (!comment) {
    return next(new AppError("No comment found with that ID", 404));
  }

  return res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.verifyingMiddleware = catchAsync(async (req, res, next) => {
  const todoId = req.params.todoId;
  const todo = await Todo.findById(todoId);

  // Check if todo with todoId exists and user created it by himself
  if (!todo || !todo.createdBy.equals(req.user.id)) {
    return next(new AppError(`Todo with id "${todoId}" was not found.`, 404));
  }

  req.todo = todo;

  next();
});
