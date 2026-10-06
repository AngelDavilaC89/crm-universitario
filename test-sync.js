const http = require('http');

const data = JSON.stringify({
  fileId: '1roghd1regvcNS2T06cO31vG_vQ4fUKtt',
  sheetName: '',
  campusId: 'EC-Eloy Cavazos',
  colMap: {
    prospecto: '1',
    celular: '2',
    correo: '3',
    carrera: '5',
    comentario: '10'
  }
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/sync-external',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let responseBody = '';
  res.on('data', (chunk) => responseBody += chunk);
  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    console.log('Response:', responseBody);
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.write(data);
req.end();
