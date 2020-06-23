const testUtils = require("../testUtils");
const utils = require("../src/client/utils.js");
const { Feather } = require("../src/client/feather");
const feather = Feather(testUtils.getFeatherApiKey(), {
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
      Feather(true);
    }).to.throw(`expected 'apiKey' to be of type 'string'`);

    expect(() => {
      Feather(123);
    }).to.throw(`expected 'apiKey' to be of type 'string'`);

    expect(() => {
      Feather({});
    }).to.throw(`expected 'apiKey' to be of type 'string'`);

    expect(() => {
      Feather(null);
    }).to.throw(`expected 'apiKey' to be of type 'string'`);

    expect(() => {
      Feather("test_123");
    }).to.not.throw();
  });

  it("should throw error if config is not an object", () => {
    expect(() => {
      Feather(testUtils.getFeatherApiKey(), true);
    }).to.throw(`expected 'config' to be of type 'object'`);

    expect(() => {
      Feather(testUtils.getFeatherApiKey(), 123);
    }).to.throw(`expected 'config' to be of type 'object'`);

    expect(() => {
      Feather(testUtils.getFeatherApiKey(), "test_123");
    }).to.throw(`expected 'config' to be of type 'object'`);

    expect(() => {
      Feather(testUtils.getFeatherApiKey(), null);
    }).to.not.throw();

    expect(() => {
      Feather(testUtils.getFeatherApiKey(), {});
    }).to.not.throw();
  });

  it("should only accept a config with allowed properties", () => {
    expect(() => {
      Feather(testUtils.getFeatherApiKey(), {
        foo: "bar",
        baz: "qux"
      });
    }).to.throw(
      `'config' contained the following unknown attributes: foo, baz`
    );

    expect(() => {
      Feather(testUtils.getFeatherApiKey(), {
        host: "foo.feather.id",
        port: 321
      });
    }).to.not.throw();
  });

  it("should only accept a valid protocol", () => {
    expect(() => {
      Feather(testUtils.getFeatherApiKey(), {
        protocol: "foo"
      });
    }).to.throw(`expected 'protocol' to be one of either: 'http' or 'https'`);

    expect(() => {
      Feather(testUtils.getFeatherApiKey(), {
        protocol: "http"
      });
    }).to.not.throw();
  });

  it("should create a gateway", () => {
    expect(() => {
      return Feather(testUtils.getFeatherApiKey(), {})._gateway;
    }).to.not.be.null;
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
  });

  afterEach(function() {
    nock.cleanAll();
    nock.enableNetConnect();
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
        "Content-Type": "application/x-www-form-urlencoded"
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
  });

  afterEach(function() {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  it("should reject invalid input", function() {
    expect(feather.sessions.revoke(123, "foo")).to.be.rejectedWith(
      `expected param 'id' to be of type 'string'`
    );

    expect(feather.sessions.revoke(true, "foo")).to.be.rejectedWith(
      `expected param 'id' to be of type 'string'`
    );

    expect(feather.sessions.revoke({}, "foo")).to.be.rejectedWith(
      `expected param 'id' to be of type 'string'`
    );

    var data = { sessionToken: 123 };
    expect(feather.sessions.revoke("SES_foo", data)).to.be.rejectedWith(
      `expected param 'sessionToken' to be of type 'string'`
    );

    var data = { sessionToken: true };
    expect(feather.sessions.revoke("SES_foo", data)).to.be.rejectedWith(
      `expected param 'sessionToken' to be of type 'string'`
    );

    var data = { sessionToken: {} };
    expect(feather.sessions.revoke("SES_foo", data)).to.be.rejectedWith(
      `expected param 'sessionToken' to be of type 'string'`
    );

    var data = { sessionToken: null };
    expect(feather.sessions.revoke("SES_foo", data)).to.be.rejectedWith(
      `required param not provided: 'sessionToken'`
    );
  });

  it("should revoke a session", function() {
    const scope = nock("http://localhost:8080", {
      reqHeaders: {
        Authorization: "Basic dGVzdF9sYUNaR1lmYURSZU5td2tsWnNmSXJUc0ZhNW5WaDk6",
        "Content-Type": "application/x-www-form-urlencoded"
      }
    })
      .post("/v1/sessions/SES_foo/revoke", "session_token=foo")
      .times(1)
      .reply(200, sampleSession);
    const data = { sessionToken: "foo" };
    return expect(
      feather.sessions.revoke("SES_foo", data)
    ).to.eventually.deep.equal(utils.snakeToCamelCase(sampleSession));
  });

  it("should reject a gateway error", function() {
    const scope = nock("http://localhost:8080")
      .post("/v1/sessions/SES_foo/revoke", "session_token=foo")
      .replyWithError("boom");
    const data = { sessionToken: "foo" };
    return expect(feather.sessions.revoke("SES_foo", data)).to.be.rejectedWith(
      "boom"
    );
  });
});

describe("feather.sessions.upgrade", function() {
  beforeEach(function() {
    nock.disableNetConnect();
  });

  afterEach(function() {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  it("should reject invalid input", function() {
    expect(feather.sessions.upgrade(123, "foo")).to.be.rejectedWith(
      `expected param 'id' to be of type 'string'`
    );

    expect(feather.sessions.upgrade(true, "foo")).to.be.rejectedWith(
      `expected param 'id' to be of type 'string'`
    );

    expect(feather.sessions.upgrade({}, "foo")).to.be.rejectedWith(
      `expected param 'id' to be of type 'string'`
    );

    var data = { credentialToken: 123 };
    expect(feather.sessions.upgrade("SES_foo", data)).to.be.rejectedWith(
      `expected param 'credentialToken' to be of type 'string'`
    );

    var data = { credentialToken: true };
    expect(feather.sessions.upgrade("SES_foo", data)).to.be.rejectedWith(
      `expected param 'credentialToken' to be of type 'string'`
    );

    var data = { credentialToken: {} };
    expect(feather.sessions.upgrade("SES_foo", data)).to.be.rejectedWith(
      `expected param 'credentialToken' to be of type 'string'`
    );

    var data = { credentialToken: null };
    expect(feather.sessions.upgrade("SES_foo", data)).to.be.rejectedWith(
      `required param not provided: 'credentialToken'`
    );

    expect(feather.sessions.upgrade("SES_foo", null)).to.be.rejectedWith(
      `required request data not provided`
    );

    expect(feather.sessions.upgrade("SES_foo", 123)).to.be.rejectedWith(
      `expected param 'data' to be of type 'object'`
    );
  });

  it("should upgrade a session", function() {
    const scope = nock("http://localhost:8080", {
      reqHeaders: {
        Authorization: "Basic dGVzdF9sYUNaR1lmYURSZU5td2tsWnNmSXJUc0ZhNW5WaDk6",
        "Content-Type": "application/x-www-form-urlencoded"
      }
    })
      .post("/v1/sessions/SES_foo/upgrade", "credential_token=foo")
      .times(1)
      .reply(200, sampleSession);
    const data = { credentialToken: "foo" };
    return expect(
      feather.sessions.upgrade("SES_foo", data)
    ).to.eventually.deep.equal(utils.snakeToCamelCase(sampleSession));
  });

  it("should reject a gateway error", function() {
    const scope = nock("http://localhost:8080")
      .post("/v1/sessions/SES_foo/upgrade", "credential_token=foo")
      .replyWithError("boom");
    const data = { credentialToken: "foo" };
    return expect(feather.sessions.upgrade("SES_foo", data)).to.be.rejectedWith(
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
    var data = { sessionToken: "foo" };
    expect(feather.sessions.validate(data)).to.be.rejectedWith(
      "The session token is invalid"
    );

    var data = { sessionToken: 123 };
    expect(feather.sessions.validate(data)).to.be.rejectedWith(
      `expected param 'sessionToken' to be of type 'string'`
    );

    var data = { sessionToken: true };
    expect(feather.sessions.validate(data)).to.be.rejectedWith(
      `expected param 'sessionToken' to be of type 'string'`
    );

    var data = { sessionToken: {} };
    expect(feather.sessions.validate(data)).to.be.rejectedWith(
      `expected param 'sessionToken' to be of type 'string'`
    );

    var data = { sessionToken: null };
    expect(feather.sessions.validate(data)).to.be.rejectedWith(
      `required param not provided: 'sessionToken'`
    );
  });

  it("should reject a gateway error", function() {
    const scope = nock("http://localhost:8080")
      .get("/v1/publicKeys/0")
      .replyWithError("boom");
    const data = {
      sessionToken: testUtils.getSampleSessionTokens()["validButStale"]
    };
    return expect(feather.sessions.validate(data)).to.be.rejectedWith("boom");
  });

  it("should parse a valid token", function() {
    const sessionToken = testUtils.getSampleSessionTokens()["validButStale"];
    const scope = testUtils
      .getPublicKeyNock()
      .post(
        "/v1/sessions/SES_10836cb6-994d-40f6-950c-3617be17b7c3/validate",
        "session_token=" + sessionToken
      )
      .times(1)
      .reply(200, sampleSession);
    const data = { sessionToken };
    return feather.sessions.validate(data).then(res => {
      expect(res).to.deep.equal(utils.snakeToCamelCase(sampleSession));
      expect(scope.isDone()).to.equal(true);
    });
  });

  it("should reject an invalid signature algorithm", function() {
    const scope = testUtils.getPublicKeyNock();
    const data = {
      sessionToken: testUtils.getSampleSessionTokens()["invalidAlg"]
    };
    return expect(feather.sessions.validate(data)).to.be.rejectedWith(
      "The session token is invalid"
    );
  });

  it("should reject an invalid signature", function() {
    const scope = testUtils.getPublicKeyNock();
    const data = {
      sessionToken: testUtils.getSampleSessionTokens()["invalidSignature"]
    };
    return expect(feather.sessions.validate(data)).to.be.rejectedWith(
      "The session token is invalid"
    );
  });

  it("should reject a modified token", function() {
    const scope = testUtils.getPublicKeyNock();
    const data = {
      sessionToken: testUtils.getSampleSessionTokens()["modified"]
    };
    return expect(feather.sessions.validate(data)).to.be.rejectedWith(
      "The session token is invalid"
    );
  });

  it("should reject a missing key id", function() {
    const scope = testUtils.getPublicKeyNock();
    const data = {
      sessionToken: testUtils.getSampleSessionTokens()["missingKeyId"]
    };
    return expect(feather.sessions.validate(data)).to.be.rejectedWith(
      "The session token is invalid"
    );
  });

  it("should reject an invalid issuer", function() {
    const scope = testUtils.getPublicKeyNock();
    const data = {
      sessionToken: testUtils.getSampleSessionTokens()["invalidIssuer"]
    };
    return expect(feather.sessions.validate(data)).to.be.rejectedWith(
      "The session token is invalid"
    );
  });

  it("should reject an invalid subject", function() {
    const scope = testUtils.getPublicKeyNock();
    const data = {
      sessionToken: testUtils.getSampleSessionTokens()["invalidSubject"]
    };
    return expect(feather.sessions.validate(data)).to.be.rejectedWith(
      "The session token is invalid"
    );
  });

  it("should reject an invalid audience", function() {
    const scope = testUtils.getPublicKeyNock();
    const data = {
      sessionToken: testUtils.getSampleSessionTokens()["invalidAudience"]
    };
    return expect(feather.sessions.validate(data)).to.be.rejectedWith(
      "The session token is invalid"
    );
  });

  it("should reject an invalid session id", function() {
    const scope = testUtils.getPublicKeyNock();
    const data = {
      sessionToken: testUtils.getSampleSessionTokens()["invalidSessionId"]
    };
    return expect(feather.sessions.validate(data)).to.be.rejectedWith(
      "The session token is invalid"
    );
  });

  it("should reject a gateway error", function() {
    const sessionToken = testUtils.getSampleSessionTokens()["validButStale"];
    const scope = testUtils
      .getPublicKeyNock()
      .post(
        "/v1/sessions/SES_10836cb6-994d-40f6-950c-3617be17b7c3/validate",
        "session_token=" + sessionToken
      )
      .replyWithError("boom");
    const data = { sessionToken };
    return expect(feather.sessions.validate(data)).to.be.rejectedWith("boom");
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
  });

  afterEach(function() {
    nock.cleanAll();
    nock.enableNetConnect();
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
        "Content-Type": "application/x-www-form-urlencoded"
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
  });

  afterEach(function() {
    nock.cleanAll();
    nock.enableNetConnect();
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

    var data = { username: true };
    expect(feather.users.update("USR_foo", data)).to.be.rejectedWith(
      `expected param 'username' to be of type 'string'`
    );

    var data = { username: 123 };
    expect(feather.users.update("USR_foo", data)).to.be.rejectedWith(
      `expected param 'username' to be of type 'string'`
    );

    var data = { username: {} };
    expect(feather.users.update("USR_foo", data)).to.be.rejectedWith(
      `expected param 'username' to be of type 'string'`
    );

    var data = { email: true };
    expect(feather.users.update("USR_foo", data)).to.be.rejectedWith(
      `expected param 'email' to be of type 'string'`
    );
    var data = { email: 123 };
    expect(feather.users.update("USR_foo", data)).to.be.rejectedWith(
      `expected param 'email' to be of type 'string'`
    );
    var data = { email: {} };
    expect(feather.users.update("USR_foo", data)).to.be.rejectedWith(
      `expected param 'email' to be of type 'string'`
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
        "Content-Type": "application/x-www-form-urlencoded"
      }
    })
      .post(
        "/v1/users/USR_foo",
        "username=foo&email=foo%40bar.com&metadata%5BhighScore%5D=101"
      )
      .times(1)
      .reply(200, sampleUserAuthenticated);
    const data = {
      username: "foo",
      email: "foo@bar.com",
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

describe("feather.users.updatePassword", function() {
  beforeEach(function() {
    nock.disableNetConnect();
  });

  afterEach(function() {
    nock.cleanAll();
    nock.enableNetConnect();
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
        "Content-Type": "application/x-www-form-urlencoded"
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
  });

  afterEach(function() {
    nock.cleanAll();
    nock.enableNetConnect();
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
