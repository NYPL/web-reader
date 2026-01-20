const express = require('express');
const fetch = require('node-fetch');
const app = express();
const port = process.env.PORT | 3001;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.get('/', async (req, res) => {
  // read query parameters
  const requestUrl = req.query['requestUrl'];

  console.log(`Proxying request to: ${requestUrl}`);

  // make request to IEX API and forward response
  try {
    // allow a 30s timeout
    const response = await fetch(requestUrl, { timeout: 300000 });
    res.status(response.status);
    response.body.pipe(res);
  } catch (e) {
    const msg = `Request error at ${requestUrl}: ${e.message}`;
    console.error(e);
    res.status(500).send(msg);
  }
});

app.listen(port, () =>
  console.log(`CORS Proxy Listening on: http://localhost:${port}`)
);
