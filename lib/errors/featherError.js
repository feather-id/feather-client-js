class FeatherError extends Error {
  constructor(raw = {}) {
    super(raw.message);
    this.object = "error";
    this.type = raw.type;
    this.code = raw.code;
    this.message = raw.message;
  }
}

module.exports = FeatherError;
