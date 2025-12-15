const http = require('http');

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Test Server Working');
});

server.listen(3000, '127.0.0.1', () => {
  console.log('Test server running at http://127.0.0.1:3000/');
});
