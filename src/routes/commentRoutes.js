const express = require("express");
const commentController = require("../controllers/commentController");
const accessVerifyingMiddleware = require("../middleware/accessVerifyingMiddleware");

const router = express.Router({ mergeParams: true });

router.use(accessVerifyingMiddleware);

router
  .post("/", commentController.createComment)
  .get("/", commentController.getCommentsForTodo);

router
  .get("/:commentId", commentController.getCommentById)
  .patch("/:commentId", commentController.updateComment)
  .delete("/:commentId", commentController.deleteComment);

module.exports = router;
