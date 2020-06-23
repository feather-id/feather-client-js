"use strict";

const querystring = require("querystring");
const utils = require("./utils");
const FeatherError = require("./errors/featherError");
const ErrorType = require("./errors/errorType");
const ErrorCode = require("./errors/errorCode");

const DEFAULT_PROTOCOL = "https";
const DEFAULT_HOST = "api.feather.id";
const DEFAULT_PORT = "443";
const DEFAULT_BASE_PATH = "/v1";

function Gateway(apiKey, config = {}) {
  if (!(this instanceof Gateway)) {
    return new Gateway(apiKey, config);
  }

  this._api = {
    auth: "Basic " + Buffer.from(apiKey + ":").toString("base64"),
    host: config.host || DEFAULT_HOST,
    port: config.port || DEFAULT_PORT,
    protocol: config.protocol || DEFAULT_PROTOCOL,
    basePath: config.basePath || DEFAULT_BASE_PATH
  };
}

Gateway.prototype = {
  sendRequest(method, path, data) {
    const that = this;
    return new Promise(function(resolve, reject) {
      // Build headers
      var headers = {
        Authorization: that._api.auth,
        "Content-Type": "application/x-www-form-urlencoded"
      };

      // Build request data
      var query = "";
      if (data) {
        data = utils.camelToSnakeCase(data);
        switch (method) {
          case "GET":
            query = "?";
            for (let [key, value] of Object.entries(data)) {
              query += key + "=" + value;
            }
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

      // Build request options
      var options = {
        host: that._api.host,
        path: that._api.basePath + path + query,
        port: that._api.port,
        method: method,
        headers
      };

      // Build production request
      const proto =
        that._api.protocol === "https" ? require("https") : require("http");
      var req = proto.request(options, function(res) {
        res.setEncoding("utf8");
        let body = [];
        res.on("data", function(chunk) {
          body.push(Buffer.from(chunk, "utf-8"));
        });
        res.on("end", function() {
          try {
            body = Buffer.concat(body).toString();
            resolve(utils.snakeToCamelCase(JSON.parse(body)));
            return;
          } catch (e) {
            reject(
              new FeatherError({
                type: ErrorType.API,
                message:
                  "The gateway received an unparsable response with status code " +
                  res.statusCode
              })
            );
            return;
          }
        });
      });

      // Handle errors
      req.on("error", err =>
        reject(
          new FeatherError({
            type: ErrorType.API_CONNECTION,
            message: err.message
          })
        )
      );

      // Post data
      if (method === "POST" && data) {
        req.write(data);
      }
      req.end();
    });
  }
};

module.exports = Gateway;
