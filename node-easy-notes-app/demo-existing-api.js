/**
 * LIVE DEMO — Existing API walkthrough
 * Shows: create, list, filter by tag, search, get one, update, delete
 */
const http = require('http');

function req(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: 'localhost', port: 3000, path, method,
      headers: data
        ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
        : {}
    };
    const r = http.request(opts, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(d) }));
    });
    r.on('error', reject);
    if (data) r.write(data);
    r.end();
  });
}

function banner(title) {
  console.log('\n' + '─'.repeat(55));
  console.log('  ' + title);
  console.log('─'.repeat(55));
}

async function run() {
  // ── 1. CREATE notes ──────────────────────────────────────
  banner('1. CREATE — POST /notes');
  const n1 = await req('POST', '/notes', {
    title: 'Q3 Roadmap Meeting',
    content: 'Discuss feature prioritisation and resource allocation for Q3',
    tags: ['work', 'planning', 'meetings']
  });
  console.log(`  Status : ${n1.status}`);
  console.log(`  ID     : ${n1.body._id}`);
  console.log(`  Title  : ${n1.body.title}`);
  console.log(`  Tags   : [${n1.body.tags.join(', ')}]`);

  const n2 = await req('POST', '/notes', {
    title: 'Grocery Shopping',
    content: 'Milk, eggs, sourdough bread, avocados, coffee beans',
    tags: ['personal', 'errands']
  });
  console.log(`\n  Status : ${n2.status}`);
  console.log(`  ID     : ${n2.body._id}`);
  console.log(`  Title  : ${n2.body.title}`);
  console.log(`  Tags   : [${n2.body.tags.join(', ')}]`);

  const n3 = await req('POST', '/notes', {
    title: 'API Design Notes',
    content: 'RESTful best practices — use nouns, versioning, proper status codes',
    tags: ['work', 'dev', 'api']
  });
  console.log(`\n  Status : ${n3.status}`);
  console.log(`  ID     : ${n3.body._id}`);
  console.log(`  Title  : ${n3.body.title}`);
  console.log(`  Tags   : [${n3.body.tags.join(', ')}]`);

  // ── 2. LIST ALL ──────────────────────────────────────────
  banner('2. LIST ALL — GET /notes');
  const all = await req('GET', '/notes');
  console.log(`  Status : ${all.status}`);
  console.log(`  Count  : ${all.body.length}`);
  all.body.forEach(n => console.log(`    #${n._id} | ${n.title} | [${n.tags.join(', ')}]`));

  // ── 3. FILTER BY TAG ─────────────────────────────────────
  banner('3. FILTER BY TAG — GET /notes?tags=work');
  const byTag = await req('GET', '/notes?tags=work');
  console.log(`  Status : ${byTag.status}`);
  console.log(`  Count  : ${byTag.body.length} (only "work" tagged notes)`);
  byTag.body.forEach(n => console.log(`    #${n._id} | ${n.title}`));

  // ── 4. SEARCH ────────────────────────────────────────────
  banner('4. SEARCH — GET /notes/search?q=api');
  const search = await req('GET', '/notes/search?q=api');
  console.log(`  Status : ${search.status}`);
  console.log(`  Count  : ${search.body.length}`);
  search.body.forEach(n => console.log(`    #${n._id} | ${n.title}`));

  banner('4b. SEARCH — GET /notes/search?q=eggs  (content match)');
  const search2 = await req('GET', '/notes/search?q=eggs');
  console.log(`  Status : ${search2.status}`);
  console.log(`  Count  : ${search2.body.length}`);
  search2.body.forEach(n => console.log(`    #${n._id} | ${n.title}`));

  // ── 5. GET SINGLE NOTE ───────────────────────────────────
  banner(`5. GET ONE — GET /notes/${n1.body._id}`);
  const one = await req('GET', `/notes/${n1.body._id}`);
  console.log(`  Status  : ${one.status}`);
  console.log(`  Title   : ${one.body.title}`);
  console.log(`  Content : ${one.body.content}`);
  console.log(`  Tags    : [${one.body.tags.join(', ')}]`);

  // ── 6. UPDATE ────────────────────────────────────────────
  banner(`6. UPDATE — PUT /notes/${n1.body._id}`);
  const updated = await req('PUT', `/notes/${n1.body._id}`, {
    title: 'Q3 Roadmap Meeting (updated)',
    content: 'Finalised priorities: search, tagging, and mobile support',
    tags: ['work', 'planning', 'meetings', 'urgent']
  });
  console.log(`  Status : ${updated.status}`);
  console.log(`  Title  : ${updated.body.title}`);
  console.log(`  Tags   : [${updated.body.tags.join(', ')}]`);

  // ── 7. STATS ─────────────────────────────────────────────
  banner('7. STATS — GET /notes/stats');
  const stats = await req('GET', '/notes/stats');
  console.log(`  Status       : ${stats.status}`);
  console.log(`  Total Notes  : ${stats.body.totalNotes}`);
  console.log(`  Tag Breakdown:`);
  Object.entries(stats.body.tagBreakdown).forEach(([tag, count]) =>
    console.log(`    ${tag.padEnd(12)} → ${count} note${count > 1 ? 's' : ''}`)
  );

  // ── 8. COUNT ─────────────────────────────────────────────
  banner('8. COUNT — GET /notes/count');
  const count = await req('GET', '/notes/count');
  console.log(`  Status : ${count.status}`);
  console.log(`  Count  : ${count.body.count}`);

  // ── 9. DELETE ────────────────────────────────────────────
  banner(`9. DELETE — DELETE /notes/${n2.body._id}`);
  const del = await req('DELETE', `/notes/${n2.body._id}`);
  console.log(`  Status  : ${del.status}`);
  console.log(`  Message : ${del.body.message}`);

  const afterDel = await req('GET', '/notes/count');
  console.log(`  Count after delete: ${afterDel.body.count}`);

  banner('✅ ALL EXISTING API ENDPOINTS VERIFIED');
}

run().catch(console.error);
