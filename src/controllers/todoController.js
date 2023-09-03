const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

const Todo = require("../models/todoModel");
const Comment = require("../models/commentModel");
const Attachment = require("../models/attachmentModel");
const catchAsync = require("../utils/catchAsync");
const existsAsync = require("../utils/existsAsync");
const AppError = require("../utils/appError");
const ApiFeatures = require("../utils/apiFeatures");

exports.getAllTodos = catchAsync(async (req, res, next) => {
  const queryObj = { ...req.query };
  const excludedFields = ["page", "sort", "limit", "fields"];
  excludedFields.forEach((el) => delete queryObj[el]);

  let query = Todo.find({ ...queryObj, createdBy: req.user.id });

  const features = new ApiFeatures(query, req.query)
    .sort()
    .limitFields()
    .paginate();

  const todos = await features.query;

  return res.status(200).json({
    status: "success",
    data: {
      todos,
    },
  });
});

exports.createTodo = catchAsync(async (req, res, next) => {
  const newTodo = await Todo.create({
    ...req.body,
    createdBy: req.user.id,
  });

  return res.status(201).json({
    status: "success",
    data: {
      todo: newTodo,
    },
  });
});

exports.getTodo = catchAsync(async (req, res, next) => {
  const todo = await Todo.findOne({
    _id: req.params.id,
    createdBy: req.user.id,
  });

  if (!todo) {
    return next(
      new AppError(`Todo with id "${req.params.id}" was not found.`, 404)
    );
  }

  return res.status(200).json({
    status: "success",
    data: {
      todo: todo,
    },
  });
});

exports.updateTodo = catchAsync(async (req, res, next) => {
  const todo = await Todo.findOneAndUpdate(
    {
      _id: req.params.id,
      createdBy: req.user.id,
    },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!todo) {
    return next(new AppError("No todo found with that ID", 404));
  }

  return res.status(200).json({
    status: "success",
    data: {
      todo,
    },
  });
});

exports.deleteTodo = catchAsync(async (req, res, next) => {
  const todo = await Todo.findOneAndDelete({
    _id: req.params.id,
    createdBy: req.user.id,
  });

  if (!todo) {
    return next(new AppError("No todo found with that ID", 404));
  }

  // To delete linked comments
  await Comment.deleteMany({
    todoId: todo.id,
  });

  const attachments = await Attachment.find({
    todoId: req.params.id,
  });

  // Delete every attachment linked to Todo
  attachments.forEach(async (at) => {
    const imagePath = path.join(
      __dirname,
      "./../../public/img/todos",
      `${at.filename}`
    );

    // Delete attachment image from file system if it exist
    if (await existsAsync(imagePath)) {
      await promisify(fs.unlink)(imagePath);
    }
  });

  await Attachment.deleteMany({
    todoId: req.params.id,
  });

  return res.status(204).json({
    status: "success",
    data: null,
  });
});
