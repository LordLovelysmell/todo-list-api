const chai = require("chai");
const expect = chai.expect;
const sinon = require("sinon");
const catchAsync = require("./../utils/catchAsync");

describe("catchAsync utils middleware", () => {
  it("should call the next middleware with an error when fn throws an error", async () => {
    const fakeError = new Error("Test Error");
    const fakeFn = async () => {
      throw fakeError;
    };
    const fakeReq = {};
    const fakeRes = {};
    const fakeNext = sinon.spy();

    const middleware = catchAsync(fakeFn);
    await middleware(fakeReq, fakeRes, fakeNext);

    expect(fakeNext.calledOnce, "Expect next called once").to.be.true;
    expect(
      fakeNext.calledWith(fakeError),
      "Expect next called with the same error"
    ).to.be.true;
  });
});
