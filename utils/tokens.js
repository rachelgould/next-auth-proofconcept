const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');
const util = require('util');
jwt.verify = util.promisify(jwt.verify);
jwt.sign = util.promisify(jwt.sign);

export async function verifySetToken(token) {
  const [ header, payload, signature ] = token.split('.');
  if (!header || !payload || !signature) {
    return false;
  }
  try {
    const header = decodeTokenHeader(token);
    const jsonWebKey = getJsonWebKeyWithKID(header.kid);
    const decodedToken = await verifyJsonWebTokenSignature(token, jsonWebKey);
    return verifyClaims(decodedToken) ? decodedToken : false;
  } catch (e) {
    console.log("error decoding the token: ", e);
    return false;
  }
}

export async function transformToClientToken(authenticatedToken) {
  try {
    const newToken = {
      cognitoUser: authenticatedToken['cognito:username'],
      email: authenticatedToken.email,
      fName: authenticatedToken['given_name'],
      lName: authenticatedToken['family_name']
    };
    return jwt.sign(newToken, process.env.CUSTOM_KEY);
  } catch (e) {
    console.log("error signing the token: ", e);
    throw e;
  }
}

export async function decodeClientToken(token) {
  try {
    return jwt.verify(token, process.env.CUSTOM_KEY);
  } catch (e) {
    console.log("error decoding the token: ", e);
    throw e;
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

async function verifyJsonWebTokenSignature(token, jsonWebKey) {
  const pem = jwkToPem(jsonWebKey);
  return jwt.verify(token, pem, { algorithms: ['RS256'] });
}

function verifyClaims(token) {
  const currUnixTime = Math.round(new Date().getTime()/1000);

  return (token.exp - currUnixTime > 0) && token.aud === process.env.CLIENT_ID && token.iss === `https://cognito-idp.${process.env.REGION_ID}.amazonaws.com/${process.env.POOL_ID}` && token.token_use === 'id';
}