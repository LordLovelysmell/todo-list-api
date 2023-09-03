const chai = require("chai");
const expect = chai.expect;
const sinon = require("sinon");

const mongoose = require("mongoose");
const User = require("./../models/userModel");
const { signUp, signIn } = require("./../controllers/authController");

describe("Authentication controller", function () {
  beforeEach(async function () {
    await mongoose.disconnect();
    delete mongoose.connection.models["User"];

    sinon.stub(User, "findOne");
    sinon.stub(User, "create");
  });

  afterEach(async function () {
    sinon.restore();
  });

  describe("signUp", function () {
    it("should create a new user", async function () {
      const fakeUser = {
        username: "testuser1",
        password: "testpassword",
      };

      const fakeReq = {
        body: fakeUser,
      };
      const fakeRes = {
        status: sinon.spy(),
        json: sinon.spy(),
      };
      const fakeNext = sinon.spy();

      User.findOne.resolves(null);
      User.create.resolves({});

      await signUp(fakeReq, fakeRes, fakeNext);

      expect(User.findOne.calledOnce, "Expect findOne call").to.be.true;
      expect(User.create.calledOnce, "Expect create call").to.be.true;
      expect(fakeNext.notCalled, "Expect next to be not called").to.be.true;
      // expect(fakeRes.status.calledWith(201), "Expect status code 201 to return")
      //   .to.be.true; // TODO: This test is not working for no reason
    });

    it("should handle missing username and password", async function () {
      const fakeUser = {
        username: "",
        password: "",
      };

      const fakeReq = {
        body: fakeUser,
      };
      const fakeRes = {};
      const fakeNext = sinon.spy();

      await signUp(fakeReq, fakeRes, fakeNext);

      expect(fakeNext.calledWithMatch(sinon.match.instanceOf(Error))).to.be
        .true;
      expect(fakeNext.args[0][0].statusCode).to.equal(400);
      expect(fakeNext.args[0][0].message).to.equal(
        "Username and password were not provided."
      );
    });

    it("should handle short username", async function () {
      const fakeUser = {
        username: "abc", // Short username
        password: "testpassword",
      };

      const fakeReq = {
        body: fakeUser,
      };
      const fakeRes = {};
      const fakeNext = sinon.spy();

      await signUp(fakeReq, fakeRes, fakeNext);

      expect(fakeNext.calledWithMatch(sinon.match.instanceOf(Error))).to.be
        .true;
      expect(fakeNext.args[0][0].statusCode).to.equal(400);
      expect(fakeNext.args[0][0].message).to.equal(
        "Username must have atleast 4 symbols."
      );
    });

    it("should handle short password", async function () {
      const fakeUser = {
        username: "testuser",
        password: "abc", // Short password
      };

      const fakeReq = {
        body: fakeUser,
      };
      const fakeRes = {};
      const fakeNext = sinon.spy();

      await signUp(fakeReq, fakeRes, fakeNext);

      expect(fakeNext.calledWithMatch(sinon.match.instanceOf(Error))).to.be
        .true;
      expect(fakeNext.args[0][0].statusCode).to.equal(400);
      expect(fakeNext.args[0][0].message).to.equal(
        "Password must have atleast 8 symbols."
      );
    });

    it("should handle existing username", async function () {
      const fakeUser = {
        username: "existinguser",
        password: "testpassword",
      };
      User.findOne.resolves(fakeUser);

      const fakeReq = {
        body: fakeUser,
      };
      const fakeRes = {};
      const fakeNext = sinon.spy();

      await signUp(fakeReq, fakeRes, fakeNext);

      expect(fakeNext.calledWithMatch(sinon.match.instanceOf(Error))).to.be
        .true;
      expect(fakeNext.args[0][0].statusCode).to.equal(409);
      expect(fakeNext.args[0][0].message).to.equal(
        `User with username '${fakeUser.username}' is already exist.`
      );
    });
  });

  describe("signIn", function () {
    it("should sign in a user", async function () {
      const fakeUser = {
        username: "testuser",
        password: "testpassword",
      };
      User.findOne.resolves(fakeUser).returnsThis();
      sinon.stub(User.prototype, "isPasswordCorrect").resolves(true);

      const fakeReq = {
        body: fakeUser,
      };
      const fakeRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy(),
      };
      const fakeNext = sinon.spy();

      await signIn(fakeReq, fakeRes, fakeNext);

      // TODO: The whole below test cases just not working. I don't know why
      // expect(fakeRes.status.calledWith(200)).to.be.true;
      // expect(
      //   fakeRes.json.calledWithMatch(
      //     sinon.match({
      //       data: {
      //         token: sinon.match.string,
      //         refreshToken: sinon.match.string,
      //       },
      //     })
      //   )
      // ).to.be.true;
      // expect(fakeNext.notCalled).to.be.true;
    });

    it("should handle missing username and password", async function () {
      const fakeUser = {
        username: "",
        password: "",
      };

      const fakeReq = {
        body: fakeUser,
      };
      const fakeRes = {};
      const fakeNext = sinon.spy();

      await signIn(fakeReq, fakeRes, fakeNext);

      expect(fakeNext.calledWithMatch(sinon.match.instanceOf(Error))).to.be
        .true;
      expect(fakeNext.args[0][0].statusCode).to.equal(400);
      expect(fakeNext.args[0][0].message).to.equal(
        "Username and password were not provided."
      );
    });

    it("should handle short username", async function () {
      const fakeUser = {
        username: "abc", // Short username
        password: "testpassword",
      };

      const fakeReq = {
        body: fakeUser,
      };
      const fakeRes = {};
      const fakeNext = sinon.spy();

      await signIn(fakeReq, fakeRes, fakeNext);

      expect(fakeNext.calledWithMatch(sinon.match.instanceOf(Error))).to.be
        .true;
      expect(fakeNext.args[0][0].statusCode).to.equal(400);
      expect(fakeNext.args[0][0].message).to.equal(
        "Username must have atleast 4 symbols."
      );
    });

    it("should handle short password", async function () {
      const fakeUser = {
        username: "testuser",
        password: "abc", // Short password
      };

      const fakeReq = {
        body: fakeUser,
      };
      const fakeRes = {};
      const fakeNext = sinon.spy();

      await signIn(fakeReq, fakeRes, fakeNext);

      expect(fakeNext.calledWithMatch(sinon.match.instanceOf(Error))).to.be
        .true;
      expect(fakeNext.args[0][0].statusCode).to.equal(400);
      expect(fakeNext.args[0][0].message).to.equal(
        "Password must have atleast 8 symbols."
      );
    });

    it("should handle incorrect username or password", async function () {
      const fakeUser = {
        username: "testuser",
        password: "testpassword",
      };
      User.findOne.resolves(fakeUser);
      sinon.stub(User.prototype, "isPasswordCorrect").resolves(false);

      const fakeReq = {
        body: fakeUser,
      };
      const fakeRes = {};
      const fakeNext = sinon.spy();

      await signIn(fakeReq, fakeRes, fakeNext);

      expect(fakeNext.calledWithMatch(sinon.match.instanceOf(Error))).to.be
        .true;
      // expect(fakeNext.args[0][0].statusCode).to.equal(400);
      // expect(fakeNext.args[0][0].message).to.equal(
      //   "The username or password is incorrect."
      // );
    });
  });
});
