const express = require("express");
const commentController = require("../controllers/commentController"); // Подставьте путь к контроллеру для комментариев

const router = express.Router({ mergeParams: true });

router.use(commentController.verifyingMiddleware);

// Эндпоинты для комментариев в контексте задачи
router.post("/", commentController.createComment);
router.get("/", commentController.getCommentsForTodo);
router.get("/:commentId", commentController.getCommentById);
router.patch("/:commentId", commentController.updateComment);
router.delete("/:commentId", commentController.deleteComment);

module.exports = router;
