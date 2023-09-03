const chai = require("chai");
const expect = chai.expect;
const sinon = require("sinon");

const mongoose = require("mongoose");
const Todo = require("./../models/todoModel");
// const Attachment = require("./../models/attachmentModel");
const {
  createTodo,
  getTodo,
  updateTodo,
} = require("./../controllers/todoController");

describe("Todo handlers", () => {
  beforeEach(async () => {
    await mongoose.disconnect();
    delete mongoose.connection.models["Attachment"];
    delete mongoose.connection.models["Todo"];

    sinon.stub(Todo, "create");
    sinon.stub(Todo, "findOne");
    sinon.stub(Todo, "findOneAndUpdate");
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("createTodo", () => {
    it("should create a new todo", async () => {
      const fakeUser = {
        id: "fakeUserId",
      };
      const fakeTodo = {
        title: "Test Todo",
        createdBy: fakeUser.id,
      };
      Todo.create.resolves(fakeTodo);

      const fakeReq = {
        body: fakeTodo,
        user: fakeUser,
      };
      const fakeRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy(),
      };

      await createTodo(fakeReq, fakeRes, sinon.spy());

      expect(fakeRes.status.calledWith(201)).to.be.true;
      expect(fakeRes.json.calledWithMatch({ data: { todo: fakeTodo } })).to.be
        .true;
    });
  });

  describe("getTodo", () => {
    it("should retrieve a todo", async () => {
      const fakeUser = {
        id: "fakeUserId",
      };
      const fakeTodo = {
        _id: "fakeTodoId",
        title: "Test Todo",
        createdBy: fakeUser.id,
      };
      Todo.findOne.resolves(fakeTodo);

      const fakeReq = {
        params: {
          id: fakeTodo._id,
        },
        user: fakeUser,
      };
      const fakeRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy(),
      };
      const fakeNext = sinon.spy();

      await getTodo(fakeReq, fakeRes, fakeNext);

      expect(fakeRes.status.calledWith(200)).to.be.true;
      expect(fakeRes.json.calledWithMatch({ data: { todo: fakeTodo } })).to.be
        .true;
      expect(fakeNext.notCalled).to.be.true;
    });

    it("should handle not finding a todo", async () => {
      const fakeUser = {
        id: "fakeUserId",
      };
      const fakeTodoId = "nonExistentTodoId";
      Todo.findOne.resolves(null);

      const fakeReq = {
        params: {
          id: fakeTodoId,
        },
        user: fakeUser,
      };
      const fakeRes = {};
      const fakeNext = sinon.spy();

      await getTodo(fakeReq, fakeRes, fakeNext);

      expect(fakeNext.calledWithMatch(sinon.match.instanceOf(Error))).to.be
        .true;
      expect(fakeNext.args[0][0].statusCode).to.equal(404);
      expect(fakeNext.args[0][0].message).to.equal(
        `Todo with id "${fakeTodoId}" was not found.`
      );
    });
  });

  describe("updateTodo", () => {
    it("should update a todo", async () => {
      const fakeUser = {
        id: "fakeUserId",
      };
      const fakeTodoId = "fakeTodoId";
      const fakeUpdatedTodo = {
        _id: fakeTodoId,
        title: "Updated Todo",
        createdBy: fakeUser.id,
      };
      Todo.findOneAndUpdate.resolves(fakeUpdatedTodo);

      const fakeReq = {
        params: {
          id: fakeTodoId,
        },
        body: {
          title: "Updated Todo",
        },
        user: fakeUser,
      };
      const fakeRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy(),
      };
      const fakeNext = sinon.spy();

      await updateTodo(fakeReq, fakeRes, fakeNext);

      expect(fakeRes.status.calledWith(200)).to.be.true;
      expect(fakeRes.json.calledWithMatch({ data: { todo: fakeUpdatedTodo } }))
        .to.be.true;
      expect(fakeNext.notCalled).to.be.true;
    });

    it("should handle not finding a todo for update", async () => {
      const fakeUser = {
        id: "fakeUserId",
      };
      const fakeTodoId = "nonExistentTodoId";
      Todo.findOneAndUpdate.resolves(null);

      const fakeReq = {
        params: {
          id: fakeTodoId,
        },
        body: {
          title: "Updated Todo",
        },
        user: fakeUser,
      };
      const fakeRes = {};
      const fakeNext = sinon.spy();

      await updateTodo(fakeReq, fakeRes, fakeNext);

      expect(fakeNext.calledWithMatch(sinon.match.instanceOf(Error))).to.be
        .true;
      expect(fakeNext.args[0][0].statusCode).to.equal(404);
      expect(fakeNext.args[0][0].message).to.equal(
        "No todo found with that ID"
      );
    });
  });
});
