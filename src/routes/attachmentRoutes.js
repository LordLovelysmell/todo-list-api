const express = require("express");
const attachmentController = require("../controllers/attachmentController");
const accessVerifyingMiddleware = require("../middleware/accessVerifyingMiddleware");

const router = express.Router({ mergeParams: true });

router
  .post(
    "/",
    attachmentController.uploadTodoImage,
    accessVerifyingMiddleware,
    attachmentController.createAttachment
  )
  .get(
    "/",
    accessVerifyingMiddleware,
    attachmentController.getAttachmentsForTodo
  );

router
  .get(
    "/:id",
    accessVerifyingMiddleware,
    attachmentController.getAttachmentById
  )
  .delete(
    "/:id",
    accessVerifyingMiddleware,
    attachmentController.deleteAttachment
  );

module.exports = router;
