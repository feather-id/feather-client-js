const {
  FeatherError,
  FeatherErrorType,
  FeatherErrorCode
} = require("../errors");

const utils = {
  /**
   * Converts a string from PascalCase to camelCase
   */
  pascalToCamelCase: function(str) {
    return str[0].toLowerCase() + str.substring(1);
  },

  /**
   * Converts an object from camelCase to snake_case
   */
  camelToSnakeCase: function(x) {
    if (!x) {
      return x;
    }
    switch (typeof x) {
      case "object":
        if (Array.isArray(x)) {
          return x.map(xo => {
            if (typeof xo === "object") {
              return this.camelToSnakeCase(xo);
            } else {
              return xo;
            }
          });
        } else {
          var out = {};
          for (let [k, v] of Object.entries(x)) {
            k = this.camelToSnakeCase(k);
            if (typeof v === "object" && k !== "metadata") {
              v = this.camelToSnakeCase(v);
            }
            out[k] = v;
          }
          return out;
        }

      case "string":
        return x
          .replace(/[\w]([A-Z])/g, function(m) {
            return m[0] + "_" + m[1];
          })
          .toLowerCase();

      default:
        return x;
    }
  },

  /**
   * Converts an object from snake_case to camelCase
   */
  snakeToCamelCase: function(x) {
    if (!x) {
      return x;
    }
    switch (typeof x) {
      case "object":
        if (Array.isArray(x)) {
          return x.map(xo => {
            if (typeof xo === "object") {
              this.snakeToCamelCase(xo);
            } else {
              return xo;
            }
          });
        } else {
          var out = {};
          for (let [k, v] of Object.entries(x)) {
            k = this.snakeToCamelCase(k);
            if (typeof v === "object" && k !== "metadata") {
              v = this.snakeToCamelCase(v);
            }
            out[k] = v;
          }
          return out;
        }

      case "string":
        return x.replace(/([-_][a-z])/g, group =>
          group
            .toUpperCase()
            .replace("-", "")
            .replace("_", "")
        );

      default:
        return x;
    }
  },

  validateData: function(data, expects) {
    if (!data) {
      if (expects.isRequired) {
        throw new FeatherError({
          type: FeatherErrorType.VALIDATION,
          code: FeatherErrorCode.PARAMETER_MISSING,
          message: `required request data not provided`
        });
      } else {
        return;
      }
    }
    if (typeof data !== "object") {
      throw new FeatherError({
        type: FeatherErrorType.VALIDATION,
        code: FeatherErrorCode.PARAMETER_INVALID,
        message: `expected param 'data' to be of type 'object'`
      });
    }
    for (const [key, expectation] of Object.entries(expects.params)) {
      const value = data[key];
      if (!value) {
        if (expectation.isRequired) {
          throw new FeatherError({
            type: FeatherErrorType.VALIDATION,
            code: FeatherErrorCode.PARAMETER_MISSING,
            message: `required param not provided: '${key}'`
          });
        } else {
          continue;
        }
      }

      if (typeof value !== expectation.type) {
        throw new FeatherError({
          type: FeatherErrorType.VALIDATION,
          code: FeatherErrorCode.PARAMETER_INVALID,
          message: `expected param '${key}' to be of type '${expectation.type}'`
        });
      }
    }
  }
};

module.exports = utils;
