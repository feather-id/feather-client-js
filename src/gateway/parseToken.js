const jws = require("jws");
const {
  FeatherError,
  FeatherErrorType,
  FeatherErrorCode
} = require("../errors");

// TODO probably rename to something like validateIDToken
// TODO but is this even needed in the client library???

function parseToken(tokenString, getPublicKey) {
  return new Promise(function(resolve, reject) {
    const invalidTokenError = new FeatherError({
      type: FeatherErrorType.VALIDATION,
      code: FeatherErrorCode.TOKEN_INVALID,
      message: "The session token is invalid"
    });
    const expiredTokenError = new FeatherError({
      type: FeatherErrorType.VALIDATION,
      code: FeatherErrorCode.TOKEN_EXPIRED,
      message: "The session token is expired"
    });

    // Parse the token
    const parsedToken = jws.decode(tokenString);
    if (!parsedToken) {
      reject(invalidTokenError);
      return;
    }

    // Verify signature algorithm
    const rs256 = "RS256";
    if (parsedToken.header.alg != rs256) {
      reject(invalidTokenError);
      return;
    }

    // Get the key ID
    if (!parsedToken.header.kid) {
      reject(invalidTokenError);
      return;
    }

    // Check cache for the key
    getPublicKey(parsedToken.header.kid)
      .then(pubKey => {
        // Verify signature
        try {
          const isValid = jws.verify(tokenString, rs256, pubKey.pem);
          if (!isValid) {
            reject(invalidTokenError);
            return;
          }
        } catch (e) {
          reject(invalidTokenError);
          return;
        }

        // Verify claims
        if (parsedToken.payload.iss !== "feather.id") {
          reject(invalidTokenError);
          return;
        }
        if (parsedToken.payload.sub.substring(0, 4) !== "USR_") {
          reject(invalidTokenError);
          return;
        }
        if (parsedToken.payload.aud.substring(0, 4) !== "PRJ_") {
          reject(invalidTokenError);
          return;
        }

        // TODO Give buffer for clock skew?
        const now = Math.floor(Date.now() / 1000);
        if (now > parsedToken.payload.exp) {
          reject(expiredTokenError);
          return;
        }

        const user = {
          id: parsedToken.payload.sub,
          object: "user"
        };

        resolve(user);
      })
      .catch(err => reject(err));
  });
}

module.exports = parseToken;
