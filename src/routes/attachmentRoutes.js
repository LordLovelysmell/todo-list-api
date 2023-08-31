const express = require("express");
const attachmentController = require("../controllers/attachmentController");

const router = express.Router({ mergeParams: true });

router
  .post(
    "/",
    attachmentController.uploadTodoImage,
    attachmentController.verifyingMiddleware,
    attachmentController.createAttachment
  )
  .get(
    "/",
    attachmentController.verifyingMiddleware,
    attachmentController.getAttachmentsForTodo
  );

router
  .get(
    "/:id",
    attachmentController.verifyingMiddleware,
    attachmentController.getAttachmentById
  )
  .delete(
    "/:id",
    attachmentController.verifyingMiddleware,
    attachmentController.deleteAttachment
  );

module.exports = router;
