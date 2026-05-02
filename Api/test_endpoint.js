const http = require('http');

function testEndpoint(path, body) {
  return new Promise((resolve) => {
    const d = JSON.stringify(body);
    const req = http.request({
      hostname: 'localhost', port: 3000, path, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(d) }
    }, res => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(b) }));
    });
    req.on('error', e => resolve({ error: e.message }));
    req.write(d);
    req.end();
  });
}

async function main() {
  console.log('--- /api/auth/forgot-password testi ---');
  const r = await testEndpoint('/api/auth/forgot-password', { email: 'test@test.com' });
  console.log('Status:', r.status);
  console.log('Response:', JSON.stringify(r.body || r, null, 2));
}

main();
