// const { JWKS: { KeyStore, asKeyStore } } = require('jose')

// const ks = asKeyStore(process.env.JWKS)

export default async function auth(req, res) {
  try {
    console.log("req.url: ", req.url)
    console.log("req.query: ", req.query)
    console.log("req.cookies: ", req.cookies)
    console.log(req.body)
    res.writeHead(302, {
      'Location': '/'
    });
    res.end();
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).end(error.message);
  }
}