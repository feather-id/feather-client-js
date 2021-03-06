const testUtils = require("./testUtils.js");
const utils = require("../src/gateway/utils.js");
const { Gateway } = require("../src/gateway");
const gateway = Gateway(testUtils.getFeatherApiKey(), {
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

describe("gateway constructor", function() {
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
  status: "requires_verification",
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

describe("gateway.credentials.create", function() {
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
    expect(gateway.credentials.create(data)).to.be.rejectedWith(
      `expected param 'email' to be of type 'string'`
    );

    var data = {
      type: "email|password",
      email: true,
      password: "p4ssw0rd"
    };
    expect(gateway.credentials.create(data)).to.be.rejectedWith(
      `expected param 'email' to be of type 'string'`
    );

    var data = {
      type: "email|password",
      email: {},
      password: "p4ssw0rd"
    };
    expect(gateway.credentials.create(data)).to.be.rejectedWith(
      `expected param 'email' to be of type 'string'`
    );

    var data = {
      type: "email|password",
      email: "foo@bar.com",
      password: 123
    };
    expect(gateway.credentials.create(data)).to.be.rejectedWith(
      `expected param 'password' to be of type 'string'`
    );

    var data = {
      type: "email|password",
      email: "foo@bar.com",
      password: true
    };
    expect(gateway.credentials.create(data)).to.be.rejectedWith(
      `expected param 'password' to be of type 'string'`
    );

    var data = {
      type: "email|password",
      email: "foo@bar.com",
      password: {}
    };
    expect(gateway.credentials.create(data)).to.be.rejectedWith(
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
    return expect(gateway.credentials.create(data)).to.eventually.deep.equal(
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
    return expect(gateway.credentials.create(data)).to.be.rejectedWith("boom");
  });
});

describe("gateway.credentials.update", function() {
  beforeEach(function() {
    nock.disableNetConnect();
  });

  afterEach(function() {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  it("should reject invalid input", function() {
    var data = { verification_code: "foo" };
    expect(gateway.credentials.update(123, data)).to.be.rejectedWith(
      `expected param 'id' to be of type 'string'`
    );

    expect(gateway.credentials.update(true, data)).to.be.rejectedWith(
      `expected param 'id' to be of type 'string'`
    );

    expect(gateway.credentials.update({}, data)).to.be.rejectedWith(
      `expected param 'id' to be of type 'string'`
    );

    var data = { verificationCode: 123 };
    expect(gateway.credentials.update("CRD_foo", data)).to.be.rejectedWith(
      `expected param 'verificationCode' to be of type 'string'`
    );

    var data = { verificationCode: true };
    expect(gateway.credentials.update("CRD_foo", data)).to.be.rejectedWith(
      `expected param 'verificationCode' to be of type 'string'`
    );

    var data = { verificationCode: {} };
    expect(gateway.credentials.update("CRD_foo", data)).to.be.rejectedWith(
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
      gateway.credentials.update("CRD_foo", data)
    ).to.eventually.deep.equal(utils.snakeToCamelCase(sampleCredentialValid));
  });

  it("should reject a gateway error", function() {
    const scope = nock("http://localhost:8080")
      .post("/v1/credentials/CRD_foo")
      .replyWithError("boom");
    const data = { verificationCode: "foo" };
    return expect(
      gateway.credentials.update("CRD_foo", data)
    ).to.be.rejectedWith("boom");
  });
});

// * * * * * Passwords * * * * * ///

const samplePassword = {
  object: "password",
  created_at: "2020-01-01T15:44:00.939855294Z"
};

describe("gateway.passwords.create", function() {
  beforeEach(function() {
    nock.disableNetConnect();
  });

  afterEach(function() {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  it("should reject invalid input", function() {
    expect(gateway.passwords.create(true, "foo")).to.be.rejectedWith(
      `expected param 'password' to be of type 'string'`
    );

    expect(gateway.passwords.create(123, "foo")).to.be.rejectedWith(
      `expected param 'password' to be of type 'string'`
    );

    expect(gateway.passwords.create({}, "foo")).to.be.rejectedWith(
      `expected param 'password' to be of type 'string'`
    );

    expect(gateway.passwords.create(null, "foo")).to.be.rejectedWith(
      `expected param 'password' to be of type 'string'`
    );
  });

  it("should create a password", function() {
    const scope = nock("http://localhost:8080", {
      reqHeaders: {
        Authorization: "Basic dGVzdF9sYUNaR1lmYURSZU5td2tsWnNmSXJUc0ZhNW5WaDk6",
        "Content-Type": "application/x-www-form-urlencoded"
      }
    })
      .post("/v1/passwords", "password=n3w_p4ssw0rd&credential_token=foo")
      .times(1)
      .reply(200, samplePassword);
    return expect(
      gateway.passwords.create("n3w_p4ssw0rd", "foo")
    ).to.eventually.deep.equal(utils.snakeToCamelCase(samplePassword));
  });

  it("should reject a gateway error", function() {
    const scope = nock("http://localhost:8080")
      .post("/v1/passwords")
      .replyWithError("boom");
    return expect(
      gateway.passwords.create("n3w_p4ssw0rd", "foo")
    ).to.be.rejectedWith("boom");
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

describe("gateway.users.create", function() {
  beforeEach(function() {
    nock.disableNetConnect();
  });

  afterEach(function() {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  it("should reject invalid input", function() {
    expect(gateway.users.create(true)).to.be.rejectedWith(
      `expected param 'credentialToken' to be of type 'string'`
    );

    expect(gateway.users.create(123)).to.be.rejectedWith(
      `expected param 'credentialToken' to be of type 'string'`
    );

    expect(gateway.users.create({})).to.be.rejectedWith(
      `expected param 'credentialToken' to be of type 'string'`
    );
  });

  it("should create an anonymous user", function() {
    const scope = nock("http://localhost:8080", {
      reqHeaders: {
        Authorization: "Basic dGVzdF9sYUNaR1lmYURSZU5td2tsWnNmSXJUc0ZhNW5WaDk6",
        "Content-Type": "application/x-www-form-urlencoded"
      }
    })
      .post("/v1/users", {})
      .times(1)
      .reply(200, sampleUserAnonymous);
    return expect(gateway.users.create()).to.eventually.deep.equal(
      utils.snakeToCamelCase(sampleUserAnonymous)
    );
  });

  it("should create an authenticated user", function() {
    const scope = nock("http://localhost:8080", {
      reqHeaders: {
        Authorization: "Basic dGVzdF9sYUNaR1lmYURSZU5td2tsWnNmSXJUc0ZhNW5WaDk6",
        "Content-Type": "application/x-www-form-urlencoded"
      }
    })
      .post("/v1/users", "credential_token=foo")
      .times(1)
      .reply(200, sampleUserAuthenticated);
    return expect(gateway.users.create("foo")).to.eventually.deep.equal(
      utils.snakeToCamelCase(sampleUserAuthenticated)
    );
  });

  it("should reject a gateway error", function() {
    const scope = nock("http://localhost:8080")
      .post("/v1/users", {})
      .replyWithError("boom");
    return expect(gateway.users.create()).to.be.rejectedWith("boom");
  });
});

describe("gateway.users.retrieve", function() {
  beforeEach(function() {
    nock.disableNetConnect();
  });

  afterEach(function() {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  it("should reject invalid input", function() {
    expect(gateway.users.retrieve(true, "foo")).to.be.rejectedWith(
      `expected param 'id' to be of type 'string'`
    );

    expect(gateway.users.retrieve(123, "foo")).to.be.rejectedWith(
      `expected param 'id' to be of type 'string'`
    );

    expect(gateway.users.retrieve({}, "foo")).to.be.rejectedWith(
      `expected param 'id' to be of type 'string'`
    );

    expect(gateway.users.retrieve(null, "foo")).to.be.rejectedWith(
      `expected param 'id' to be of type 'string'`
    );

    expect(gateway.users.retrieve("foo", true)).to.be.rejectedWith(
      `expected param 'idToken' to be of type 'string'`
    );

    expect(gateway.users.retrieve("foo", 123)).to.be.rejectedWith(
      `expected param 'idToken' to be of type 'string'`
    );

    expect(gateway.users.retrieve("foo", {})).to.be.rejectedWith(
      `expected param 'idToken' to be of type 'string'`
    );

    expect(gateway.users.retrieve("foo", null)).to.be.rejectedWith(
      `expected param 'idToken' to be of type 'string'`
    );
  });

  it("should retrieve a user", function() {
    const scope = nock("http://localhost:8080", {
      reqHeaders: {
        Authorization: "Bearer foo",
        "Content-Type": "application/x-www-form-urlencoded"
      }
    })
      .get("/v1/users/USR_foo", {})
      .times(1)
      .reply(200, sampleUserAnonymous);
    return expect(
      gateway.users.retrieve("USR_foo", "foo")
    ).to.eventually.deep.equal(utils.snakeToCamelCase(sampleUserAnonymous));
  });

  it("should reject a gateway error", function() {
    const scope = nock("http://localhost:8080")
      .get("/v1/users/USR_foo", {})
      .replyWithError("boom");
    return expect(gateway.users.retrieve("USR_foo", "foo")).to.be.rejectedWith(
      "boom"
    );
  });
});

describe("gateway.users.update", function() {
  beforeEach(function() {
    nock.disableNetConnect();
  });

  afterEach(function() {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  it("should reject invalid input", function() {
    expect(gateway.users.update(true, {}, "foo")).to.be.rejectedWith(
      `expected param 'id' to be of type 'string'`
    );

    expect(gateway.users.update(123, {}, "foo")).to.be.rejectedWith(
      `expected param 'id' to be of type 'string'`
    );

    expect(gateway.users.update({}, {}, "foo")).to.be.rejectedWith(
      `expected param 'id' to be of type 'string'`
    );

    expect(gateway.users.update(null, {}, "foo")).to.be.rejectedWith(
      `expected param 'id' to be of type 'string'`
    );

    var data = { metadata: true };
    expect(gateway.users.update("USR_foo", data, "foo")).to.be.rejectedWith(
      `expected param 'metadata' to be of type 'object'`
    );
    var data = { metadata: 123 };
    expect(gateway.users.update("USR_foo", data, "foo")).to.be.rejectedWith(
      `expected param 'metadata' to be of type 'object'`
    );

    var data = { metadata: "foo" };
    expect(gateway.users.update("USR_foo", data, "foo")).to.be.rejectedWith(
      `expected param 'metadata' to be of type 'object'`
    );

    expect(gateway.users.update("USR_foo", {}, true)).to.be.rejectedWith(
      `expected param 'idToken' to be of type 'string'`
    );

    expect(gateway.users.update("USR_foo", {}, 123)).to.be.rejectedWith(
      `expected param 'idToken' to be of type 'string'`
    );

    expect(gateway.users.update("USR_foo", {}, {})).to.be.rejectedWith(
      `expected param 'idToken' to be of type 'string'`
    );

    expect(gateway.users.update("USR_foo", {}, null)).to.be.rejectedWith(
      `expected param 'idToken' to be of type 'string'`
    );
  });

  it("should update a user", function() {
    const scope = nock("http://localhost:8080", {
      reqHeaders: {
        Authorization: "Bearer foo",
        "Content-Type": "application/x-www-form-urlencoded"
      }
    })
      .post("/v1/users/USR_foo", "metadata%5BhighScore%5D=101")
      .times(1)
      .reply(200, sampleUserAuthenticated);
    const data = {
      metadata: { highScore: 101 }
    };
    return expect(
      gateway.users.update("USR_foo", data, "foo")
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
    return expect(
      gateway.users.update("USR_foo", data, "foo")
    ).to.be.rejectedWith("boom");
  });
});

describe("gateway.users.updateEmail", function() {
  beforeEach(function() {
    nock.disableNetConnect();
  });

  afterEach(function() {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  it("should reject invalid input", function() {
    expect(
      gateway.users.updateEmail(true, "foo@bar.com", "foo", "bar")
    ).to.be.rejectedWith(`expected param 'id' to be of type 'string'`);

    expect(
      gateway.users.updateEmail(123, "foo@bar.com", "foo", "bar")
    ).to.be.rejectedWith(`expected param 'id' to be of type 'string'`);

    expect(
      gateway.users.updateEmail({}, "foo@bar.com", "foo", "bar")
    ).to.be.rejectedWith(`expected param 'id' to be of type 'string'`);

    expect(
      gateway.users.updateEmail(null, "foo@bar.com", "foo", "bar")
    ).to.be.rejectedWith(`expected param 'id' to be of type 'string'`);
  });

  it("should update a user's email", function() {
    const scope = nock("http://localhost:8080", {
      reqHeaders: {
        Authorization: "Bearer bar",
        "Content-Type": "application/x-www-form-urlencoded"
      }
    })
      .post(
        "/v1/users/USR_foo/email",
        "new_email=foo%40bar.com&credential_token=foo"
      )
      .times(1)
      .reply(200, sampleUserAuthenticated);
    return expect(
      gateway.users.updateEmail("USR_foo", "foo@bar.com", "foo", "bar")
    ).to.eventually.deep.equal(utils.snakeToCamelCase(sampleUserAuthenticated));
  });

  it("should reject a gateway error", function() {
    const scope = nock("http://localhost:8080")
      .post("/v1/users/USR_foo/email")
      .replyWithError("boom");
    return expect(
      gateway.users.updateEmail("USR_foo", "foo@bar.com", "foo", "bar")
    ).to.be.rejectedWith("boom");
  });
});

describe("gateway.users.refreshTokens", function() {
  beforeEach(function() {
    nock.disableNetConnect();
  });

  afterEach(function() {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  it("should reject invalid input", function() {
    expect(gateway.users.refreshTokens(true, "foo")).to.be.rejectedWith(
      `expected param 'id' to be of type 'string'`
    );

    expect(gateway.users.refreshTokens(123, "foo")).to.be.rejectedWith(
      `expected param 'id' to be of type 'string'`
    );

    expect(gateway.users.refreshTokens({}, "foo")).to.be.rejectedWith(
      `expected param 'id' to be of type 'string'`
    );

    expect(gateway.users.refreshTokens("foo", 123)).to.be.rejectedWith(
      `expected param 'refreshToken' to be of type 'string'`
    );
  });

  it("should refresh a user's tokens", function() {
    const scope = nock("http://localhost:8080", {
      reqHeaders: {
        Authorization: "Basic dGVzdF9sYUNaR1lmYURSZU5td2tsWnNmSXJUc0ZhNW5WaDk6",
        "Content-Type": "application/x-www-form-urlencoded"
      }
    })
      .post("/v1/users/USR_foo/tokens", "refresh_token=foo")
      .times(1)
      .reply(200, sampleUserAuthenticated);
    return expect(
      gateway.users.refreshTokens("USR_foo", "foo")
    ).to.eventually.deep.equal(utils.snakeToCamelCase(sampleUserAuthenticated));
  });

  it("should reject a gateway error", function() {
    const scope = nock("http://localhost:8080")
      .post("/v1/users/USR_foo/tokens", "refresh_token=foo")
      .replyWithError("boom");
    return expect(
      gateway.users.refreshTokens("USR_foo", "foo")
    ).to.be.rejectedWith("boom");
  });
});

describe("gateway.users.revokeTokens", function() {
  beforeEach(function() {
    nock.disableNetConnect();
  });

  afterEach(function() {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  it("should reject invalid input", function() {
    expect(gateway.users.revokeTokens(true, "foo")).to.be.rejectedWith(
      `expected param 'id' to be of type 'string'`
    );

    expect(gateway.users.revokeTokens(123, "foo")).to.be.rejectedWith(
      `expected param 'id' to be of type 'string'`
    );

    expect(gateway.users.revokeTokens({}, "foo")).to.be.rejectedWith(
      `expected param 'id' to be of type 'string'`
    );

    expect(gateway.users.revokeTokens("foo", 123)).to.be.rejectedWith(
      `expected param 'refreshToken' to be of type 'string'`
    );
  });

  it("should revoke a user's tokens", function() {
    const scope = nock("http://localhost:8080", {
      reqHeaders: {
        Authorization: "Basic dGVzdF9sYUNaR1lmYURSZU5td2tsWnNmSXJUc0ZhNW5WaDk6",
        "Content-Type": "application/x-www-form-urlencoded"
      }
    })
      .delete("/v1/users/USR_foo/tokens?refresh_token=foo")
      .times(1)
      .reply(200, sampleUserAuthenticated);
    return expect(
      gateway.users.revokeTokens("USR_foo", "foo")
    ).to.eventually.deep.equal(utils.snakeToCamelCase(sampleUserAuthenticated));
  });

  it("should reject a gateway error", function() {
    const scope = nock("http://localhost:8080")
      .delete("/v1/users/USR_foo/tokens?refresh_token=foo")
      .replyWithError("boom");
    return expect(
      gateway.users.revokeTokens("USR_foo", "foo")
    ).to.be.rejectedWith("boom");
  });
});

// * * * * * Gateway * * * * * //

describe("_gateway", function() {
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
    return expect(gateway.users.retrieve("USR_foo", "foo")).to.be.rejectedWith(
      "invalid json response body at http://localhost:8080/v1/users/USR_foo reason: Unexpected token ! in JSON at position 0"
    );
  });
});
