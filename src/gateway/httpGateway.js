const querystring = require("querystring");
const utils = require("./utils");
const fetch = require("node-fetch");
const {
  FeatherError,
  FeatherErrorType,
  FeatherErrorCode
} = require("../errors");

const DEFAULT_PROTOCOL = "https";
const DEFAULT_HOST = "api.feather.id";
const DEFAULT_PORT = "443";
const DEFAULT_BASE_PATH = "/v1";

function HttpGateway(apiKey, config = {}) {
  if (!(this instanceof HttpGateway)) {
    return new HttpGateway(apiKey, config);
  }

  this._api = {
    basicAuth: "Basic " + Buffer.from(apiKey + ":").toString("base64"),
    host: config.host || DEFAULT_HOST,
    port: config.port || DEFAULT_PORT,
    protocol: config.protocol || DEFAULT_PROTOCOL,
    basePath: config.basePath || DEFAULT_BASE_PATH
  };
}

function handleApiResult(res, resolve, reject) {
  if (res.object === "error") {
    reject(res);
  } else {
    resolve(res);
  }
}

HttpGateway.prototype = {
  sendRequest(method, path, data, headers) {
    const that = this;
    return new Promise(function(resolve, reject) {
      // Build request data
      headers = {
        ...headers,
        "Content-Type": "application/x-www-form-urlencoded"
      };
      if (!headers.Authorization) {
        headers.Authorization = that._api.basicAuth;
      }
      var query = "";
      if (data) {
        data = utils.camelToSnakeCase(data);
        switch (method) {
          case "DELETE":
          case "GET":
            query =
              "?" +
              Object.entries(data)
                .map(([key, value]) => `${key}=${value}`)
                .join("&");

            break;

          case "POST":
            var flattenedData = {};
            for (let [key, value] of Object.entries(data)) {
              switch (typeof value) {
                case "object":
                  if (value) {
                    for (let [oKey, oValue] of Object.entries(value)) {
                      flattenedData[`${key}[${oKey}]`] = oValue;
                    }
                    break;
                  }
                default:
                  flattenedData[key] = value;
              }
            }
            data = querystring.stringify(flattenedData);
            headers["Content-Length"] = Buffer.byteLength(data);
            break;
        }
      }
      var options = {
        method,
        headers
      };
      if (method === "POST" && data) {
        options.body = data;
      }
      const url =
        that._api.protocol +
        "://" +
        that._api.host +
        ":" +
        that._api.port +
        that._api.basePath +
        path +
        query;

      // Execute request
      fetch(url, options)
        .then(res => res.json())
        .then(res => utils.snakeToCamelCase(res))
        .then(res => handleApiResult(res, resolve, reject))
        .catch(err => reject(err));
    });
  }
};

module.exports = HttpGateway;
