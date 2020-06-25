const testUtils = require("./testUtils.js");
const utils = require("../src/gateway/utils.js");
const { Gateway } = require("../src/gateway");
const feather = Gateway(testUtils.getFeatherApiKey(), {
  protocol: "http",
  host: "localhost",
  port: "8080"
});

const nock = require("nock");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = chai.expect;

// * * * * * Constructor * * * * * //

describe("feather constructor", function() {
  it("should only accept an api key of type string", function() {
    expect(() => {
      Gateway(true);
    }).to.throw(`expected 'apiKey' to be of type 'string'`);

    expect(() => {
      Gateway(123);
    }).to.throw(`expected 'apiKey' to be of type 'string'`);

    expect(() => {
      Gateway({});
    }).to.throw(`expected 'apiKey' to be of type 'string'`);

    expect(() => {
      Gateway(null);
    }).to.throw(`expected 'apiKey' to be of type 'string'`);

    expect(() => {
      Gateway("test_123");
    }).to.not.throw();
  });

  it("should throw error if config is not an object", () => {
    expect(() => {
      Gateway(testUtils.getFeatherApiKey(), true);
    }).to.throw(`expected 'config' to be of type 'object'`);

    expect(() => {
      Gateway(testUtils.getFeatherApiKey(), 123);
    }).to.throw(`expected 'config' to be of type 'object'`);

    expect(() => {
      Gateway(testUtils.getFeatherApiKey(), "test_123");
    }).to.throw(`expected 'config' to be of type 'object'`);

    expect(() => {
      Gateway(testUtils.getFeatherApiKey(), null);
    }).to.not.throw();

    expect(() => {
      Gateway(testUtils.getFeatherApiKey(), {});
    }).to.not.throw();
  });

  it("should only accept a config with allowed properties", () => {
    expect(() => {
      Gateway(testUtils.getFeatherApiKey(), {
        foo: "bar",
        baz: "qux"
      });
    }).to.throw(
      `'config' contained the following unknown attributes: foo, baz`
    );

    expect(() => {
      Gateway(testUtils.getFeatherApiKey(), {
        host: "foo.feather.id",
        port: 321
      });
    }).to.not.throw();
  });

  it("should only accept a valid protocol", () => {
    expect(() => {
      Gateway(testUtils.getFeatherApiKey(), {
        protocol: "foo"
      });
    }).to.throw(`expected 'protocol' to be one of either: 'http' or 'https'`);

    expect(() => {
      Gateway(testUtils.getFeatherApiKey(), {
        protocol: "http"
      });
    }).to.not.throw();
  });
});

// * * * * * Credentials * * * * * //

const sampleCredetialRequiresVerificationCode = {
  id: "CRD_fd881d84-537f-455c-a086-9508b917cd8c",
  object: "credential",
  created_at: "2020-01-01T15:44:00.939855294Z",
  expires_at: "2020-01-01T15:59:00.939855294Z",
  status: "requires_verification_code",
  token: null,
  type: "email"
};

const sampleCredentialValid = {
  id: "CRD_fd881d84-537f-455c-a086-9508b917cd8c",
  object: "credential",
  created_at: "2020-01-01T15:44:00.939855294Z",
  expires_at: "2020-01-01T15:59:00.939855294Z",
  status: "valid",
  token: "foo",
  type: "email"
};

describe("feather.credentials.create", function() {
  beforeEach(function() {
    nock.disableNetConnect();
  });

  afterEach(function() {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  it("should reject invalid input", function() {
    var data = { type: 123 };

    var data = {
      type: "email|password",
      email: 123,
      password: "p4ssw0rd"
    };
    expect(feather.credentials.create(data)).to.be.rejectedWith(
      `expected param 'email' to be of type 'string'`
    );

    var data = {
      type: "email|password",
      email: true,
      password: "p4ssw0rd"
    };
    expect(feather.credentials.create(data)).to.be.rejectedWith(
      `expected param 'email' to be of type 'string'`
    );

    var data = {
      type: "email|password",
      email: {},
      password: "p4ssw0rd"
    };
    expect(feather.credentials.create(data)).to.be.rejectedWith(
      `expected param 'email' to be of type 'string'`
    );

    var data = {
      type: "email|password",
      email: "foo@bar.com",
      password: 123
    };
    expect(feather.credentials.create(data)).to.be.rejectedWith(
      `expected param 'password' to be of type 'string'`
    );

    var data = {
      type: "email|password",
      email: "foo@bar.com",
      password: true
    };
    expect(feather.credentials.create(data)).to.be.rejectedWith(
      `expected param 'password' to be of type 'string'`
    );

    var data = {
      type: "email|password",
      email: "foo@bar.com",
      password: {}
    };
    expect(feather.credentials.create(data)).to.be.rejectedWith(
      `expected param 'password' to be of type 'string'`
    );
  });

  it("should create a credential", function() {
    const scope = nock("http://localhost:8080", {
      reqHeaders: {
        Authorization: "Basic dGVzdF9sYUNaR1lmYURSZU5td2tsWnNmSXJUc0ZhNW5WaDk6",
        "Content-Type": "application/x-www-form-urlencoded"
      }
    })
      .post(
        "/v1/credentials",
        "email=foo%40test.com&password=bar&scopes=upgrade_session"
      )
      .times(1)
      .reply(200, sampleCredentialValid);
    const data = {
      email: "foo@test.com",
      password: "bar",
      scopes: "upgrade_session"
    };
    return expect(feather.credentials.create(data)).to.eventually.deep.equal(
      utils.snakeToCamelCase(sampleCredentialValid)
    );
  });

  it("should reject a gateway error", function() {
    const scope = nock("http://localhost:8080")
      .post("/v1/credentials")
      .replyWithError("boom");
    const data = {
      email: "foo@test.com",
      password: "bar",
      scopes: "upgrade_session"
    };
    return expect(feather.credentials.create(data)).to.be.rejectedWith("boom");
  });
});

describe("feather.credentials.update", function() {
  beforeEach(function() {
    nock.disableNetConnect();
  });

  afterEach(function() {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  it("should reject invalid input", function() {
    var data = { verification_code: "foo" };
    expect(feather.credentials.update(123, data)).to.be.rejectedWith(
      `expected param 'id' to be of type 'string'`
    );

    expect(feather.credentials.update(true, data)).to.be.rejectedWith(
      `expected param 'id' to be of type 'string'`
    );

    expect(feather.credentials.update({}, data)).to.be.rejectedWith(
      `expected param 'id' to be of type 'string'`
    );

    var data = { verificationCode: 123 };
    expect(feather.credentials.update("CRD_foo", data)).to.be.rejectedWith(
      `expected param 'verificationCode' to be of type 'string'`
    );

    var data = { verificationCode: true };
    expect(feather.credentials.update("CRD_foo", data)).to.be.rejectedWith(
      `expected param 'verificationCode' to be of type 'string'`
    );

    var data = { verificationCode: {} };
    expect(feather.credentials.update("CRD_foo", data)).to.be.rejectedWith(
      `expected param 'verificationCode' to be of type 'string'`
    );
  });

  it("should update a credential", function() {
    const scope = nock("http://localhost:8080", {
      reqHeaders: {
        Authorization: "Basic dGVzdF9sYUNaR1lmYURSZU5td2tsWnNmSXJUc0ZhNW5WaDk6",
        "Content-Type": "application/x-www-form-urlencoded"
      }
    })
      .post("/v1/credentials/CRD_foo", "verification_code=foo")
      .times(1)
      .reply(200, sampleCredentialValid);
    const data = { verificationCode: "foo" };
    return expect(
      feather.credentials.update("CRD_foo", data)
    ).to.eventually.deep.equal(utils.snakeToCamelCase(sampleCredentialValid));
  });

  it("should reject a gateway error", function() {
    const scope = nock("http://localhost:8080")
      .post("/v1/credentials/CRD_foo")
      .replyWithError("boom");
    const data = { verificationCode: "foo" };
    return expect(
      feather.credentials.update("CRD_foo", data)
    ).to.be.rejectedWith("boom");
  });
});

// * * * * * Sessions * * * * * //

const sampleSession = {
  id: "SES_82d099a8-f06d-490d-b68b-8a4546842bf1",
  object: "session",
  status: "active",
  token: "foo",
  user_id: "USR_e4e9bc4c-19c8-4da9-9eb3-4553d4bd37a6",
  created_at: "2020-01-01T15:40:40.61536699Z",
  revoked_at: null
};

const sampleSessionRevoked = {
  id: "SES_82d099a8-f06d-490d-b68b-8a4546842bf1",
  object: "session",
  status: "revoked",
  token: "foo",
  user_id: "USR_e4e9bc4c-19c8-4da9-9eb3-4553d4bd37a6",
  created_at: "2020-01-01T15:40:40.61536699Z",
  revoked_at: "2020-01-01T16:40:40.61536699Z"
};

describe("feather.sessions.create", function() {
  beforeEach(function() {
    nock.disableNetConnect();
  });

  afterEach(function() {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  it("should reject invalid input", function() {
    var data = { credentialToken: 123 };
    expect(feather.sessions.create(data)).to.be.rejectedWith(
      `expected param 'credentialToken' to be of type 'string'`
    );

    var data = { credentialToken: true };
    expect(feather.sessions.create(data)).to.be.rejectedWith(
      `expected param 'credentialToken' to be of type 'string'`
    );

    var data = { credentialToken: {} };
    expect(feather.sessions.create(data)).to.be.rejectedWith(
      `expected param 'credentialToken' to be of type 'string'`
    );
  });

  it("should create an session with credential", function() {
    const scope = nock("http://localhost:8080", {
      reqHeaders: {
        Authorization: "Basic dGVzdF9sYUNaR1lmYURSZU5td2tsWnNmSXJUc0ZhNW5WaDk6",
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": 17
      }
    })
      .post("/v1/sessions", "credential_token=foo")
      .times(1)
      .reply(200, sampleSession);
    const data = { credentialToken: "foo" };
    return expect(feather.sessions.create(data)).to.eventually.deep.equal(
      utils.snakeToCamelCase(sampleSession)
    );
  });

  it("should create an session without credential", function() {
    const scope = nock("http://localhost:8080", {
      reqHeaders: {
        Authorization: "Basic dGVzdF9sYUNaR1lmYURSZU5td2tsWnNmSXJUc0ZhNW5WaDk6",
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": 17
      }
    })
      .post("/v1/sessions", "credential_token=")
      .times(1)
      .reply(200, sampleSession);
    const data = { credentialToken: null };
    return expect(feather.sessions.create(data)).to.eventually.deep.equal(
      utils.snakeToCamelCase(sampleSession)
    );
  });

  it("should reject a gateway error", function() {
    const scope = nock("http://localhost:8080")
      .post("/v1/sessions")
      .replyWithError("boom");
    const data = { credentialToken: null };
    return expect(feather.sessions.create(data)).to.be.rejectedWith("boom");
  });
});

describe("feather.sessions.retrieve", function() {
  beforeEach(function() {
    nock.disableNetConnect();
    feather.setXFeatherSessionHeader("foo.session.token");
  });

  afterEach(function() {
    nock.cleanAll();
    nock.enableNetConnect();
    feather.setXFeatherSessionHeader(null);
  });

  it("should reject invalid input", function() {
    expect(feather.sessions.retrieve(123)).to.be.rejectedWith(
      `expected param 'id' to be of type 'string'`
    );

    expect(feather.sessions.retrieve(true)).to.be.rejectedWith(
      `expected param 'id' to be of type 'string'`
    );

    expect(feather.sessions.retrieve({})).to.be.rejectedWith(
      `expected param 'id' to be of type 'string'`
    );

    expect(feather.sessions.retrieve(null)).to.be.rejectedWith(
      `expected param 'id' to be of type 'string'`
    );
  });

  it("should retrieve a session", function() {
    const scope = nock("http://localhost:8080", {
      reqHeaders: {
        Authorization: "Basic dGVzdF9sYUNaR1lmYURSZU5td2tsWnNmSXJUc0ZhNW5WaDk6",
        "Content-Type": "application/x-www-form-urlencoded",
        "x-feather-session": "foo.session.token"
      }
    })
      .get("/v1/sessions/SES_foo", {})
      .times(1)
      .reply(200, sampleSession);
    return expect(
      feather.sessions.retrieve("SES_foo")
    ).to.eventually.deep.equal(utils.snakeToCamelCase(sampleSession));
  });

  it("should reject a gateway error", function() {
    const scope = nock("http://localhost:8080")
      .get("/v1/sessions/SES_foo")
      .replyWithError("boom");
    return expect(feather.sessions.retrieve("SES_foo")).to.be.rejectedWith(
      "boom"
    );
  });
});

describe("feather.sessions.revoke", function() {
  beforeEach(function() {
    nock.disableNetConnect();
    feather.setXFeatherSessionHeader("foo.session.token");
  });

  afterEach(function() {
    nock.cleanAll();
    nock.enableNetConnect();
    feather.setXFeatherSessionHeader(null);
  });

  it("should reject invalid input", function() {
    expect(feather.sessions.revoke(123)).to.be.rejectedWith(
      `expected param 'id' to be of type 'string'`
    );

    expect(feather.sessions.revoke(true)).to.be.rejectedWith(
      `expected param 'id' to be of type 'string'`
    );

    expect(feather.sessions.revoke({})).to.be.rejectedWith(
      `expected param 'id' to be of type 'string'`
    );
  });

  it("should revoke a session", function() {
    const scope = nock("http://localhost:8080", {
      reqHeaders: {
        Authorization: "Basic dGVzdF9sYUNaR1lmYURSZU5td2tsWnNmSXJUc0ZhNW5WaDk6",
        "Content-Type": "application/x-www-form-urlencoded",
        "x-feather-session": "foo.session.token"
      }
    })
      .post("/v1/sessions/SES_foo/revoke")
      .times(1)
      .reply(200, sampleSession);
    return expect(feather.sessions.revoke("SES_foo")).to.eventually.deep.equal(
      utils.snakeToCamelCase(sampleSession)
    );
  });

  it("should reject a gateway error", function() {
    const scope = nock("http://localhost:8080")
      .post("/v1/sessions/SES_foo/revoke")
      .replyWithError("boom");
    return expect(feather.sessions.revoke("SES_foo")).to.be.rejectedWith(
      "boom"
    );
  });
});

describe("feather.sessions.update", function() {
  beforeEach(function() {
    nock.disableNetConnect();
    feather.setXFeatherSessionHeader("foo.session.token");
  });

  afterEach(function() {
    nock.cleanAll();
    nock.enableNetConnect();
    feather.setXFeatherSessionHeader(null);
  });

  it("should reject invalid input", function() {
    expect(feather.sessions.update(123, "foo")).to.be.rejectedWith(
      `expected param 'id' to be of type 'string'`
    );

    expect(feather.sessions.update(true, "foo")).to.be.rejectedWith(
      `expected param 'id' to be of type 'string'`
    );

    expect(feather.sessions.update({}, "foo")).to.be.rejectedWith(
      `expected param 'id' to be of type 'string'`
    );

    var data = { credentialToken: 123 };
    expect(feather.sessions.update("SES_foo", data)).to.be.rejectedWith(
      `expected param 'credentialToken' to be of type 'string'`
    );

    var data = { credentialToken: true };
    expect(feather.sessions.update("SES_foo", data)).to.be.rejectedWith(
      `expected param 'credentialToken' to be of type 'string'`
    );

    var data = { credentialToken: {} };
    expect(feather.sessions.update("SES_foo", data)).to.be.rejectedWith(
      `expected param 'credentialToken' to be of type 'string'`
    );

    var data = { credentialToken: null };
    expect(feather.sessions.update("SES_foo", data)).to.be.rejectedWith(
      `required param not provided: 'credentialToken'`
    );

    expect(feather.sessions.update("SES_foo", null)).to.be.rejectedWith(
      `required request data not provided`
    );

    expect(feather.sessions.update("SES_foo", 123)).to.be.rejectedWith(
      `expected param 'data' to be of type 'object'`
    );
  });

  it("should update a session", function() {
    const scope = nock("http://localhost:8080", {
      reqHeaders: {
        Authorization: "Basic dGVzdF9sYUNaR1lmYURSZU5td2tsWnNmSXJUc0ZhNW5WaDk6",
        "Content-Type": "application/x-www-form-urlencoded",
        "x-feather-session": "foo.session.token"
      }
    })
      .post("/v1/sessions/SES_foo", "credential_token=foo")
      .times(1)
      .reply(200, sampleSession);
    const data = { credentialToken: "foo" };
    return expect(
      feather.sessions.update("SES_foo", data)
    ).to.eventually.deep.equal(utils.snakeToCamelCase(sampleSession));
  });

  it("should reject a gateway error", function() {
    const scope = nock("http://localhost:8080")
      .post("/v1/sessions/SES_foo", "credential_token=foo")
      .replyWithError("boom");
    const data = { credentialToken: "foo" };
    return expect(feather.sessions.update("SES_foo", data)).to.be.rejectedWith(
      "boom"
    );
  });
});

describe("feather.sessions.validate", function() {
  beforeEach(function() {
    nock.disableNetConnect();
  });

  afterEach(function() {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  it("should reject invalid input", function() {
    expect(feather.sessions.validate("foo")).to.be.rejectedWith(
      "The session token is invalid"
    );

    expect(feather.sessions.validate(123)).to.be.rejectedWith(
      `expected param 'sessionToken' to be of type 'string'`
    );

    expect(feather.sessions.validate(true)).to.be.rejectedWith(
      `expected param 'sessionToken' to be of type 'string'`
    );

    expect(feather.sessions.validate({})).to.be.rejectedWith(
      `expected param 'sessionToken' to be of type 'string'`
    );

    expect(feather.sessions.validate(null)).to.be.rejectedWith(
      `expected param 'sessionToken' to be of type 'string'`
    );
  });

  it("should reject a gateway error", function() {
    const sessionToken = testUtils.getSampleSessionTokens()["validButStale"];
    const scope = nock("http://localhost:8080")
      .get("/v1/publicKeys/0")
      .replyWithError("boom");
    return expect(feather.sessions.validate(sessionToken)).to.be.rejectedWith(
      "boom"
    );
  });

  it("should reject an expired token", function() {
    const sessionToken = testUtils.getSampleSessionTokens()["validButStale"];
    const scope = testUtils.getPublicKeyNock();
    return expect(feather.sessions.validate(sessionToken)).to.be.rejectedWith(
      "The session token is expired"
    );
  });

  it("should reject an invalid signature algorithm", function() {
    const sessionToken = testUtils.getSampleSessionTokens()["invalidAlg"];
    const scope = testUtils.getPublicKeyNock();
    return expect(feather.sessions.validate(sessionToken)).to.be.rejectedWith(
      "The session token is invalid"
    );
  });

  it("should reject an invalid signature", function() {
    const sessionToken = testUtils.getSampleSessionTokens()["invalidSignature"];
    const scope = testUtils.getPublicKeyNock();
    return expect(feather.sessions.validate(sessionToken)).to.be.rejectedWith(
      "The session token is invalid"
    );
  });

  it("should reject a modified token", function() {
    const sessionToken = testUtils.getSampleSessionTokens()["modified"];
    const scope = testUtils.getPublicKeyNock();
    return expect(feather.sessions.validate(sessionToken)).to.be.rejectedWith(
      "The session token is invalid"
    );
  });

  it("should reject a missing key id", function() {
    const sessionToken = testUtils.getSampleSessionTokens()["missingKeyId"];
    const scope = testUtils.getPublicKeyNock();
    return expect(feather.sessions.validate(sessionToken)).to.be.rejectedWith(
      "The session token is invalid"
    );
  });

  it("should reject an invalid issuer", function() {
    const sessionToken = testUtils.getSampleSessionTokens()["invalidIssuer"];
    const scope = testUtils.getPublicKeyNock();
    return expect(feather.sessions.validate(sessionToken)).to.be.rejectedWith(
      "The session token is invalid"
    );
  });

  it("should reject an invalid subject", function() {
    const sessionToken = testUtils.getSampleSessionTokens()["invalidSubject"];
    const scope = testUtils.getPublicKeyNock();
    return expect(feather.sessions.validate(sessionToken)).to.be.rejectedWith(
      "The session token is invalid"
    );
  });

  it("should reject an invalid audience", function() {
    const sessionToken = testUtils.getSampleSessionTokens()["invalidAudience"];
    const scope = testUtils.getPublicKeyNock();
    return expect(feather.sessions.validate(sessionToken)).to.be.rejectedWith(
      "The session token is invalid"
    );
  });

  it("should reject an invalid session id", function() {
    const sessionToken = testUtils.getSampleSessionTokens()["invalidSessionId"];
    const scope = testUtils.getPublicKeyNock();
    return expect(feather.sessions.validate(sessionToken)).to.be.rejectedWith(
      "The session token is invalid"
    );
  });
});

// * * * * * Users * * * * * //

const sampleUserAnonymous = {
  id: "USR_e4e9bc4c-19c8-4da9-9eb3-4553d4bd37a6",
  object: "user",
  email: null,
  username: null,
  is_email_verified: false,
  is_anonymous: true,
  metadata: `{}`,
  created_at: "2020-05-13T19:41:45.566791Z",
  updated_at: "2020-05-13T19:41:45.566791Z"
};

const sampleUserAuthenticated = {
  id: "USR_e2969a70-bcde-4e63-a1b6-e479a0c20fb4",
  object: "user",
  email: "foo@bar.com",
  username: "foo",
  is_email_verified: false,
  is_anonymous: false,
  metadata: `{"highScore": "123"}`,
  created_at: "2020-05-13T19:41:45.566791Z",
  updated_at: "2020-05-13T19:41:45.566791Z"
};

describe("feather.users.retrieve", function() {
  beforeEach(function() {
    nock.disableNetConnect();
    feather.setXFeatherSessionHeader("foo.session.token");
  });

  afterEach(function() {
    nock.cleanAll();
    nock.enableNetConnect();
    feather.setXFeatherSessionHeader(null);
  });

  it("should reject invalid input", function() {
    expect(feather.users.retrieve(true)).to.be.rejectedWith(
      `expected param 'id' to be of type 'string'`
    );

    expect(feather.users.retrieve(123)).to.be.rejectedWith(
      `expected param 'id' to be of type 'string'`
    );

    expect(feather.users.retrieve({})).to.be.rejectedWith(
      `expected param 'id' to be of type 'string'`
    );

    expect(feather.users.retrieve(null)).to.be.rejectedWith(
      `expected param 'id' to be of type 'string'`
    );
  });

  it("should retrieve a user", function() {
    const scope = nock("http://localhost:8080", {
      reqHeaders: {
        Authorization: "Basic dGVzdF9sYUNaR1lmYURSZU5td2tsWnNmSXJUc0ZhNW5WaDk6",
        "Content-Type": "application/x-www-form-urlencoded",
        "x-feather-session": "foo.session.token"
      }
    })
      .get("/v1/users/USR_foo", {})
      .times(1)
      .reply(200, sampleUserAnonymous);
    return expect(feather.users.retrieve("USR_foo")).to.eventually.deep.equal(
      utils.snakeToCamelCase(sampleUserAnonymous)
    );
  });

  it("should reject a gateway error", function() {
    const scope = nock("http://localhost:8080")
      .get("/v1/users/USR_foo", {})
      .replyWithError("boom");
    return expect(feather.users.retrieve("USR_foo")).to.be.rejectedWith("boom");
  });
});

describe("feather.users.update", function() {
  beforeEach(function() {
    nock.disableNetConnect();
    feather.setXFeatherSessionHeader("foo.session.token");
  });

  afterEach(function() {
    nock.cleanAll();
    nock.enableNetConnect();
    feather.setXFeatherSessionHeader(null);
  });

  it("should reject invalid input", function() {
    var data = {};
    expect(feather.users.update(true, data)).to.be.rejectedWith(
      `expected param 'id' to be of type 'string'`
    );

    var data = {};
    expect(feather.users.update(123, data)).to.be.rejectedWith(
      `expected param 'id' to be of type 'string'`
    );

    var data = {};
    expect(feather.users.update({}, data)).to.be.rejectedWith(
      `expected param 'id' to be of type 'string'`
    );

    var data = {};
    expect(feather.users.update(null, data)).to.be.rejectedWith(
      `expected param 'id' to be of type 'string'`
    );

    var data = { metadata: true };
    expect(feather.users.update("USR_foo", data)).to.be.rejectedWith(
      `expected param 'metadata' to be of type 'object'`
    );
    var data = { metadata: 123 };
    expect(feather.users.update("USR_foo", data)).to.be.rejectedWith(
      `expected param 'metadata' to be of type 'object'`
    );
    var data = { metadata: "foo" };
    expect(feather.users.update("USR_foo", data)).to.be.rejectedWith(
      `expected param 'metadata' to be of type 'object'`
    );
  });

  it("should update a user", function() {
    const scope = nock("http://localhost:8080", {
      reqHeaders: {
        Authorization: "Basic dGVzdF9sYUNaR1lmYURSZU5td2tsWnNmSXJUc0ZhNW5WaDk6",
        "Content-Type": "application/x-www-form-urlencoded",
        "x-feather-session": "foo.session.token"
      }
    })
      .post("/v1/users/USR_foo", "metadata%5BhighScore%5D=101")
      .times(1)
      .reply(200, sampleUserAuthenticated);
    const data = {
      metadata: { highScore: 101 }
    };
    return expect(
      feather.users.update("USR_foo", data)
    ).to.eventually.deep.equal(utils.snakeToCamelCase(sampleUserAuthenticated));
  });

  it("should reject a gateway error", function() {
    const scope = nock("http://localhost:8080")
      .post("/v1/users/USR_foo")
      .replyWithError("boom");
    const data = {
      username: "foo",
      email: "foo@bar.com",
      metadata: { highScore: 101 }
    };
    return expect(feather.users.update("USR_foo", data)).to.be.rejectedWith(
      "boom"
    );
  });
});

describe("feather.users.updateEmail", function() {
  beforeEach(function() {
    nock.disableNetConnect();
    feather.setXFeatherSessionHeader("foo.session.token");
  });

  afterEach(function() {
    nock.cleanAll();
    nock.enableNetConnect();
    feather.setXFeatherSessionHeader(null);
  });

  it("should reject invalid input", function() {
    var data = {};
    expect(feather.users.updateEmail(true, data)).to.be.rejectedWith(
      `expected param 'id' to be of type 'string'`
    );

    var data = {};
    expect(feather.users.updateEmail(123, data)).to.be.rejectedWith(
      `expected param 'id' to be of type 'string'`
    );

    var data = {};
    expect(feather.users.updateEmail({}, data)).to.be.rejectedWith(
      `expected param 'id' to be of type 'string'`
    );

    var data = {};
    expect(feather.users.updateEmail(null, data)).to.be.rejectedWith(
      `expected param 'id' to be of type 'string'`
    );

    var data = { newEmail: "foo@bar.com" };
    expect(feather.users.updateEmail("USR_foo", data)).to.be.rejectedWith(
      `required param not provided: 'credentialToken'`
    );

    var data = { credentialToken: 123, newEmail: "foo@bar.com" };
    expect(feather.users.updateEmail("USR_foo", data)).to.be.rejectedWith(
      `expected param 'credentialToken' to be of type 'string'`
    );

    var data = { credentialToken: {}, newEmail: "foo@bar.com" };
    expect(feather.users.updateEmail("USR_foo", data)).to.be.rejectedWith(
      `expected param 'credentialToken' to be of type 'string'`
    );

    var data = { credentialToken: 123, newEmail: "n3w p4ssw0rd" };
    expect(feather.users.updateEmail("USR_foo", data)).to.be.rejectedWith(
      `expected param 'credentialToken' to be of type 'string'`
    );

    var data = { credentialToken: "foo" };
    expect(feather.users.updateEmail("USR_foo", data)).to.be.rejectedWith(
      `required param not provided: 'newEmail'`
    );

    var data = { credentialToken: "foo", newEmail: true };
    expect(feather.users.updateEmail("USR_foo", data)).to.be.rejectedWith(
      `expected param 'newEmail' to be of type 'string'`
    );

    var data = { credentialToken: "foo", newEmail: 123 };
    expect(feather.users.updateEmail("USR_foo", data)).to.be.rejectedWith(
      `expected param 'newEmail' to be of type 'string'`
    );

    var data = { credentialToken: "foo", newEmail: {} };
    expect(feather.users.updateEmail("USR_foo", data)).to.be.rejectedWith(
      `expected param 'newEmail' to be of type 'string'`
    );
  });

  it("should update a user's email", function() {
    const scope = nock("http://localhost:8080", {
      reqHeaders: {
        Authorization: "Basic dGVzdF9sYUNaR1lmYURSZU5td2tsWnNmSXJUc0ZhNW5WaDk6",
        "Content-Type": "application/x-www-form-urlencoded",
        "x-feather-session": "foo.session.token"
      }
    })
      .post(
        "/v1/users/USR_foo/email",
        "credential_token=foo&new_email=foo%40bar.com"
      )
      .times(1)
      .reply(200, sampleUserAuthenticated);
    const data = {
      credentialToken: "foo",
      newEmail: "foo@bar.com"
    };
    return expect(
      feather.users.updateEmail("USR_foo", data)
    ).to.eventually.deep.equal(utils.snakeToCamelCase(sampleUserAuthenticated));
  });

  it("should reject a gateway error", function() {
    const scope = nock("http://localhost:8080")
      .post("/v1/users/USR_foo/email")
      .replyWithError("boom");
    const data = {
      credentialToken: "foo",
      newEmail: "foo@bar.com"
    };
    return expect(
      feather.users.updateEmail("USR_foo", data)
    ).to.be.rejectedWith("boom");
  });
});

describe("feather.users.updatePassword", function() {
  beforeEach(function() {
    nock.disableNetConnect();
    feather.setXFeatherSessionHeader("foo.session.token");
  });

  afterEach(function() {
    nock.cleanAll();
    nock.enableNetConnect();
    feather.setXFeatherSessionHeader(null);
  });

  it("should reject invalid input", function() {
    var data = {};
    expect(feather.users.updatePassword(true, data)).to.be.rejectedWith(
      `expected param 'id' to be of type 'string'`
    );

    var data = {};
    expect(feather.users.updatePassword(123, data)).to.be.rejectedWith(
      `expected param 'id' to be of type 'string'`
    );

    var data = {};
    expect(feather.users.updatePassword({}, data)).to.be.rejectedWith(
      `expected param 'id' to be of type 'string'`
    );

    var data = {};
    expect(feather.users.updatePassword(null, data)).to.be.rejectedWith(
      `expected param 'id' to be of type 'string'`
    );

    var data = { newPassword: "n3w p4ssw0rd" };
    expect(feather.users.updatePassword("USR_foo", data)).to.be.rejectedWith(
      `required param not provided: 'credentialToken'`
    );

    var data = { credentialToken: 123, newPassword: "n3w p4ssw0rd" };
    expect(feather.users.updatePassword("USR_foo", data)).to.be.rejectedWith(
      `expected param 'credentialToken' to be of type 'string'`
    );

    var data = { credentialToken: {}, newPassword: "n3w p4ssw0rd" };
    expect(feather.users.updatePassword("USR_foo", data)).to.be.rejectedWith(
      `expected param 'credentialToken' to be of type 'string'`
    );

    var data = { credentialToken: 123, newPassword: "n3w p4ssw0rd" };
    expect(feather.users.updatePassword("USR_foo", data)).to.be.rejectedWith(
      `expected param 'credentialToken' to be of type 'string'`
    );

    var data = { credentialToken: "foo" };
    expect(feather.users.updatePassword("USR_foo", data)).to.be.rejectedWith(
      `required param not provided: 'newPassword'`
    );

    var data = { credentialToken: "foo", newPassword: true };
    expect(feather.users.updatePassword("USR_foo", data)).to.be.rejectedWith(
      `expected param 'newPassword' to be of type 'string'`
    );

    var data = { credentialToken: "foo", newPassword: 123 };
    expect(feather.users.updatePassword("USR_foo", data)).to.be.rejectedWith(
      `expected param 'newPassword' to be of type 'string'`
    );

    var data = { credentialToken: "foo", newPassword: {} };
    expect(feather.users.updatePassword("USR_foo", data)).to.be.rejectedWith(
      `expected param 'newPassword' to be of type 'string'`
    );
  });

  it("should update a user's password", function() {
    const scope = nock("http://localhost:8080", {
      reqHeaders: {
        Authorization: "Basic dGVzdF9sYUNaR1lmYURSZU5td2tsWnNmSXJUc0ZhNW5WaDk6",
        "Content-Type": "application/x-www-form-urlencoded",
        "x-feather-session": "foo.session.token"
      }
    })
      .post(
        "/v1/users/USR_foo/password",
        "credential_token=foo&new_password=n3w_p4ssw0rd"
      )
      .times(1)
      .reply(200, sampleUserAuthenticated);
    const data = {
      credentialToken: "foo",
      newPassword: "n3w_p4ssw0rd"
    };
    return expect(
      feather.users.updatePassword("USR_foo", data)
    ).to.eventually.deep.equal(utils.snakeToCamelCase(sampleUserAuthenticated));
  });

  it("should reject a gateway error", function() {
    const scope = nock("http://localhost:8080")
      .post("/v1/users/USR_foo/password")
      .replyWithError("boom");
    const data = {
      credentialToken: "foo",
      newPassword: "n3w_p4ssw0rd"
    };
    return expect(
      feather.users.updatePassword("USR_foo", data)
    ).to.be.rejectedWith("boom");
  });
});

// * * * * * Gateway * * * * * //

describe("feather._gateway", function() {
  beforeEach(function() {
    nock.disableNetConnect();
    feather.setXFeatherSessionHeader("foo.session.token");
  });

  afterEach(function() {
    nock.cleanAll();
    nock.enableNetConnect();
    feather.setXFeatherSessionHeader(null);
  });

  it("should reject unparsable response", function() {
    const scope = nock("http://localhost:8080")
      .get("/v1/users/USR_foo", {})
      .reply(200, "!@#$%^");
    return expect(feather.users.retrieve("USR_foo")).to.be.rejectedWith(
      "invalid json response body at http://localhost:8080/v1/users/USR_foo reason: Unexpected token ! in JSON at position 0"
    );
  });
});
