const http = require('http');

const data = JSON.stringify({
  fileId: '1STilwMVlvwvkOTSXPNiB4s1uTCZskgAL',
  sheetName: 'Brenda Caballero',
  campusId: 'MM-Montemorelos',
  colMap: {
    prospecto: '1',
    celular: '2',
    correo: '3',
    carrera: '5',
    comentario: '11'
  }
});

const req = http.request({
  hostname: 'localhost',
  port: 3001,
  path: '/api/sync-external',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log("Status Code:", res.statusCode);
    console.log("Response:", body);
  });
});

req.on('error', (e) => {
  console.error("Request Error:", e.message);
});

req.write(data);
req.end();
