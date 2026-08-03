const http = require('http');

function post(data) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const options = {
      hostname: 'localhost', port: 3000, path: '/notes', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    };
    const req = http.request(options, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(JSON.parse(d)));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function get(path) {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:3000' + path, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(d) }));
    }).on('error', reject);
  });
}

async function run() {
  console.log('=== Seeding 3 notes ===');
  const n1 = await post({ title: 'Meeting Notes', content: 'Discuss Q3 roadmap with the team', tags: ['work', 'planning'] });
  console.log('Note 1 created:', n1._id, '-', n1.title);
  const n2 = await post({ title: 'Shopping List', content: 'Milk, eggs, bread, coffee', tags: ['personal', 'errands'] });
  console.log('Note 2 created:', n2._id, '-', n2.title);
  const n3 = await post({ title: 'API Ideas', content: 'Add stats endpoint and pagination', tags: ['work', 'dev'] });
  console.log('Note 3 created:', n3._id, '-', n3.title);

  console.log('\n=== GET /notes (all notes) ===');
  const all = await get('/notes');
  console.log('Status:', all.status, '| Count:', all.body.length);

  console.log('\n=== GET /notes/search?q=work ===');
  const search = await get('/notes/search?q=work');
  console.log('Status:', search.status, '| Results:', search.body.map(n => n.title).join(', '));

  console.log('\n=== GET /notes/stats  (NEW ENDPOINT) ===');
  const stats = await get('/notes/stats');
  console.log('Status:', stats.status);
  console.log(JSON.stringify(stats.body, null, 2));
}

run().catch(console.error);
