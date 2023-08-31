const mongoose = require("mongoose");
const assert = require("chai").assert;
const sinon = require("sinon");

const commentController = require("../controllers/commentController");
const Comment = require("../models/commentModel");

describe("Comment Controller", () => {
  afterEach(async () => {
    await mongoose.disconnect();
    delete mongoose.connection.models["Comment"];
    delete mongoose.connection.models["Todo"];
  });
  describe("createComment", () => {
    it("should create a comment", async () => {
      const createStub = sinon
        .stub(Comment, "create")
        .resolves({ text: "Test comment" });
      const req = {
        params: { todoId: "todoId" },
        body: { text: "Test comment" },
      };
      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };
      const next = sinon.spy();
      await commentController.createComment(req, res, next);
      assert.isTrue(
        createStub.calledOnce,
        "Expected single comment creation call"
      );
      assert.isTrue(res.status.calledWith(201), "Expected status code 201");
      assert.isTrue(
        res.json.calledWith(
          sinon.match({
            status: "success",
            data: { comment: { text: "Test comment" } },
          })
        ),
        "Expected JSend notation"
      );
      assert.isFalse(next.called, "Next should not be called");
      createStub.reset();
    });
  });

  describe("getCommentsForTodo", () => {
    it("should get comments for a todo", async () => {
      const findStub = sinon
        .stub(Comment, "find")
        .resolves([{ text: "Comment 1" }, { text: "Comment 2" }]);

      const req = { params: { id: "todoId" } };
      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };
      const next = sinon.spy();

      await commentController.getCommentsForTodo(req, res, next);

      assert.isTrue(findStub.calledOnce);
      assert.isTrue(res.status.calledWith(200), "Expected status code 200");
      assert.isTrue(
        res.json.calledWith(
          sinon.match({
            status: "success",
            data: { comments: [{ text: "Comment 1" }, { text: "Comment 2" }] },
          })
        ),
        "Expected JSend notation"
      );
      assert.isFalse(next.called, "Next should not be called");
      findStub.restore();
    });
  });
});
