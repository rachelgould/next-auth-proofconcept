const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');

export default function verifySetToken(token) {
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
        return false;
      } else {
        console.log(decodedToken);
        const verified = verifyClaims(decodedToken) 
        
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

function verifyClaims(token) {
  const currUnixTime = Math.round(new Date().getTime()/1000);

  return (token.exp - currUnixTime > 0) && token.aud === process.env.CLIENT_ID && token.iss === `https://cognito-idp.${process.env.REGION_ID}.amazonaws.com/${process.env.POOL_ID}` && token.token_use === 'id';
}