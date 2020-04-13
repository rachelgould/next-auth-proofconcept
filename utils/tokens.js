const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');
const base64url = require('base64url');

export function verifyToken(token) {
  const [ header, payload, signature ] = token.split('.');
  if (!header || !payload || !signature) {
    return false;
  }
  try {
    const header = decodeTokenHeader(token);
    const jsonWebKey = getJsonWebKeyWithKID(header.kid);
    verifyJsonWebTokenSignature(token, jsonWebKey, (err, decodedToken) => {
      if (err) {
        console.error(err);
      } else {
        console.log(decodedToken);
      }
    })
  } catch (e) {
    console.log("error decoding the token: ", e);
  }
}

function decodeTokenHeader(token) {
  const [headerEncoded] = token.split('.');
  const buff = new Buffer(headerEncoded, 'base64');
  const text = buff.toString('ascii');
  return JSON.parse(text);
}

function getJsonWebKeyWithKID(kid) {
  for (let jwk of process.env.JWKS.keys) {
    if (jwk.kid === kid) {
      return jwk;
    }
  }
  return null
}

function verifyJsonWebTokenSignature(token, jsonWebKey, clbk) {
  const pem = jwkToPem(jsonWebKey);
  jwt.verify(token, pem, {algorithms: ['RS256']}, (err, decodedToken) => clbk(err, decodedToken))
}