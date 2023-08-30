const multer = require("multer");

const Todo = require("../models/todoModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/image/todos");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `todo-${req.user.id}-${Date.now()}.${ext}`);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image. Please upload only images.", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadTodoImage = upload.single("image");

exports.getAllTodos = catchAsync(async (req, res, next) => {
  const queryObj = { ...req.query };
  const excludedFields = ["page", "sort", "limit", "fields"];
  excludedFields.forEach((el) => delete queryObj[el]);

  let query = Todo.find(queryObj);

  // Basic sorting
  query = query.sort("-createdAt");

  // Field limiting
  if (req.query.fields) {
    const fields = req.query.fields.split(",").join(" ");
    query = query.select(fields);
  } else {
    query = query.select("-__v");
  }

  // Pagination
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 100;
  const skip = (page - 1) * limit;

  query = query.skip(skip).limit(limit);

  if (req.query.page) {
    const numTodos = await Todo.countDocuments();
    if (skip >= numTodos) {
      next(new AppError("This page does not exist."));
    }
  }

  const todos = await query;

  return res.status(200).json({
    status: "success",
    data: {
      todos,
    },
  });
});

exports.createTodo = catchAsync(async (req, res, next) => {
  if (req.file) {
    req.body.image = req.file.filename;
  }

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
