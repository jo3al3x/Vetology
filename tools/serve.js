#!/usr/bin/env node
// Tiny static file server for local preview of the Vetology site.
//   node tools/serve.js  ->  http://localhost:8137
const http = require('http');
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const PORT = process.env.PORT || 8137;
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png' };
http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  const fp = path.join(root, p);
  if (!fp.startsWith(root)) { res.writeHead(403); return res.end('forbidden'); }
  fs.readFile(fp, (err, data) => {
    if (err) { res.writeHead(404); return res.end('not found'); }
    res.writeHead(200, { 'content-type': types[path.extname(fp)] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(PORT, () => console.log('Vetology preview on http://localhost:' + PORT));
