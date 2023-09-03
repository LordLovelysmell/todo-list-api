const chai = require("chai");
const expect = chai.expect;
const sinon = require("sinon");

const ApiFeatures = require("./../utils/apiFeatures");

describe("ApiFeatures", () => {
  let queryStub;
  let queryStringStub;

  beforeEach(() => {
    queryStub = {
      sort: sinon.stub().returnsThis(),
      select: sinon.stub().returnsThis(),
      skip: sinon.stub().returnsThis(),
      limit: sinon.stub().returnsThis(),
    };

    queryStringStub = {
      fields: "",
      page: "",
      limit: "",
    };
  });

  it("should sort the query by createdAt", () => {
    const apiFeatures = new ApiFeatures(queryStub, queryStringStub);
    apiFeatures.sort();

    expect(queryStub.sort.calledWith("-createdAt")).to.be.true;
  });

  it("should limit fields in the query", () => {
    queryStringStub.fields = "field1,field2";
    const apiFeatures = new ApiFeatures(queryStub, queryStringStub);
    apiFeatures.limitFields();

    expect(queryStub.select.calledWith("field1 field2")).to.be.true;
  });

  it("should select all fields except __v when fields are not specified", () => {
    const apiFeatures = new ApiFeatures(queryStub, queryStringStub);
    apiFeatures.limitFields();

    expect(queryStub.select.calledWith("-__v")).to.be.true;
  });

  it("should paginate the query with default values", () => {
    const apiFeatures = new ApiFeatures(queryStub, queryStringStub);
    apiFeatures.paginate();

    expect(queryStub.skip.calledWith(0)).to.be.true;
    expect(queryStub.limit.calledWith(100)).to.be.true;
  });

  it("should paginate the query with custom page and limit", () => {
    queryStringStub.page = "2";
    queryStringStub.limit = "20";
    const apiFeatures = new ApiFeatures(queryStub, queryStringStub);
    apiFeatures.paginate();

    expect(queryStub.skip.calledWith(20)).to.be.true;
    expect(queryStub.limit.calledWith(20)).to.be.true;
  });
});
