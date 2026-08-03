const http = require('http');

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'localhost', port: 3000, path, method,
      headers: body ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } : {}
    };
    const req = http.request(options, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(d) }));
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function run() {
  console.log('--- Step 1: Check server root ---');
  const root = await request('GET', '/');
  console.log('GET /  ->', root.status, root.body.message);

  console.log('\n--- Step 2: Create 2 notes ---');
  const n1 = await request('POST', '/notes', { title: 'Kiro Demo Note', content: 'Created by Kiro live demo', tags: ['kiro', 'demo'] });
  console.log('POST /notes ->', n1.status, '| id:', n1.body._id, '| title:', n1.body.title);
  const n2 = await request('POST', '/notes', { title: 'Second Note', content: 'Another note for the demo', tags: ['demo'] });
  console.log('POST /notes ->', n2.status, '| id:', n2.body._id, '| title:', n2.body.title);

  console.log('\n--- Step 3: List all notes ---');
  const all = await request('GET', '/notes');
  console.log('GET /notes ->', all.status, '| notes:', all.body.map(n => n.title).join(', '));

  console.log('\n--- Step 4: NEW /notes/count endpoint (added by Kiro this session) ---');
  const count = await request('GET', '/notes/count');
  console.log('GET /notes/count ->', count.status, '|', JSON.stringify(count.body));

  console.log('\n--- Step 5: Update a note ---');
  const updated = await request('PUT', '/notes/' + n1.body._id, { title: 'Kiro Demo Note (updated)', content: 'Updated by Kiro!', tags: ['kiro', 'demo', 'updated'] });
  console.log('PUT /notes/' + n1.body._id, '->', updated.status, '| title:', updated.body.title);

  console.log('\n--- Step 6: Delete second note ---');
  const deleted = await request('DELETE', '/notes/' + n2.body._id);
  console.log('DELETE /notes/' + n2.body._id, '->', deleted.status, '|', deleted.body.message);

  console.log('\n--- Step 7: Final count after delete ---');
  const finalCount = await request('GET', '/notes/count');
  console.log('GET /notes/count ->', finalCount.status, '|', JSON.stringify(finalCount.body));
}

run().catch(console.error);
