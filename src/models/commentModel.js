const mongoose = require("mongoose");

const commentSchema = mongoose.Schema(
  {
    text: String,
    todoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Todo",
    },
  },
  { timestamps: true }
);

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
