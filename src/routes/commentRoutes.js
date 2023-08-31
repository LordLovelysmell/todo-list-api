const express = require("express");
const commentController = require("../controllers/commentController");

const router = express.Router({ mergeParams: true });

router.use(commentController.verifyingMiddleware);

router
  .post("/", commentController.createComment)
  .get("/", commentController.getCommentsForTodo);

router
  .get("/:commentId", commentController.getCommentById)
  .patch("/:commentId", commentController.updateComment)
  .delete("/:commentId", commentController.deleteComment);

module.exports = router;
