const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { promisify } = require("util");

const Attachment = require("../models/attachmentModel");
const Todo = require("../models/todoModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const existsAsync = require("../utils/existsAsync");

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/img/todos");
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

exports.createAttachment = catchAsync(async (req, res, next) => {
  if (!req.file) {
    next(new AppError("Attachment was not provided.", 400));
  }

  const attachment = await Attachment.create({
    todoId: req.todo.id,
    filename: req.file.filename,
  });

  return res.status(201).json({
    status: "success",
    data: {
      attachment,
    },
  });
});

exports.getAttachmentsForTodo = catchAsync(async (req, res, next) => {
  const attachments = await Attachment.find({
    todoId: req.todo.id,
  });

  return res.status(200).json({
    status: "success",
    data: {
      attachments,
    },
  });
});

exports.getAttachmentById = catchAsync(async (req, res, next) => {
  const attachment = await Attachment.findById(req.params.id);

  if (!attachment) {
    return next(
      new AppError(`Attachment with id "${req.params.id}" was not found.`, 404)
    );
  }

  return res.status(200).json({
    status: "success",
    data: {
      attachment,
    },
  });
});

exports.deleteAttachment = catchAsync(async (req, res, next) => {
  const attachment = await Attachment.findOneAndDelete({
    _id: req.params.id,
  });

  if (!attachment) {
    return next(
      new AppError(`Attachment with id "${req.params.id}" was not found.`, 404)
    );
  }

  const imagePath = path.join(
    __dirname,
    "./../../public/img/todos",
    `${attachment.filename}`
  );

  // Delete attachment image from file system
  if (await existsAsync(imagePath)) {
    await promisify(fs.unlink)(imagePath);
  }

  return res.status(204).json({
    status: "success",
    data: null,
  });
});
