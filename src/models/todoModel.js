const mongoose = require("mongoose");

const TodoSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required."],
    },
    description: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      default: "Backlog",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Todo", TodoSchema);
