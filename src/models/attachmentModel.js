const mongoose = require("mongoose");

const attachmentSchema = mongoose.Schema(
  {
    filename: String,
    todoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Todo",
    },
  },
  { timestamps: true }
);

const Attachment = mongoose.model("Attachment", attachmentSchema);

module.exports = Attachment;
