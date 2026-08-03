/**
 * LIVE DEMO — New PIN NOTES feature
 * Proves the code change Kiro just made is working end-to-end.
 *
 * New endpoints added this session:
 *   PATCH /notes/:id/pin    → pin a note
 *   PATCH /notes/:id/unpin  → unpin a note
 *   GET   /notes/pinned     → list only pinned notes
 *
 * Also verifies: new notes now include pinned:false by default.
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

function banner(msg) {
    console.log('\n' + '═'.repeat(58));
    console.log('  ' + msg);
    console.log('═'.repeat(58));
}

function pass(msg) { console.log('  ✅  ' + msg); }
function fail(msg) { console.log('  ❌  ' + msg); process.exitCode = 1; }
function info(msg) { console.log('       ' + msg); }

async function run() {
    banner('SETUP — Create 4 notes');
    const notes = [];
    const seeds = [
        { title: 'Project Alpha Kickoff',    content: 'Initial meeting notes for Project Alpha', tags: ['work', 'planning'] },
        { title: 'Weekly Shopping List',      content: 'Milk, eggs, bread, butter, coffee',        tags: ['personal', 'errands'] },
        { title: 'Bug Fix: Login Timeout',    content: 'Users get logged out after 10 min — investigate session TTL', tags: ['work', 'dev', 'bugs'] },
        { title: 'Holiday Gift Ideas',        content: 'Books, headphones, coffee subscription',    tags: ['personal'] },
    ];
    for (const seed of seeds) {
        const r = await req('POST', '/notes', seed);
        notes.push(r.body);
        info(`Created #${r.body._id} "${r.body.title}" | pinned: ${r.body.pinned}`);
    }

    // ── Verify default pinned=false ──────────────────────────
    banner('CHECK 1 — New notes default to pinned: false');
    const allDefault = notes.every(n => n.pinned === false);
    allDefault
        ? pass('All 4 new notes have pinned: false (default confirmed)')
        : fail('Some notes did not default to pinned: false');

    // ── GET /notes/pinned — should be empty ──────────────────
    banner('CHECK 2 — GET /notes/pinned (expect empty)');
    const emptyPinned = await req('GET', '/notes/pinned');
    info(`Status: ${emptyPinned.status} | Count: ${emptyPinned.body.length}`);
    emptyPinned.body.length === 0
        ? pass('Pinned list is empty before any pins — correct')
        : fail('Expected 0 pinned notes');

    // ── Pin notes #1 and #3 ──────────────────────────────────
    banner(`PIN — PATCH /notes/${notes[0]._id}/pin  &  /notes/${notes[2]._id}/pin`);
    const pin1 = await req('PATCH', `/notes/${notes[0]._id}/pin`);
    info(`PATCH /notes/${notes[0]._id}/pin  → status: ${pin1.status} | pinned: ${pin1.body.pinned}`);
    pin1.body.pinned === true
        ? pass(`"${pin1.body.title}" is now pinned`)
        : fail('Pin did not set pinned: true');

    const pin3 = await req('PATCH', `/notes/${notes[2]._id}/pin`);
    info(`PATCH /notes/${notes[2]._id}/pin  → status: ${pin3.status} | pinned: ${pin3.body.pinned}`);
    pin3.body.pinned === true
        ? pass(`"${pin3.body.title}" is now pinned`)
        : fail('Pin did not set pinned: true');

    // ── GET /notes/pinned — should have 2 ───────────────────
    banner('CHECK 3 — GET /notes/pinned (expect 2)');
    const pinned2 = await req('GET', '/notes/pinned');
    info(`Status: ${pinned2.status} | Count: ${pinned2.body.length}`);
    pinned2.body.forEach(n => info(`  → #${n._id} "${n.title}" | pinned: ${n.pinned}`));
    pinned2.body.length === 2
        ? pass('Exactly 2 pinned notes returned')
        : fail(`Expected 2 pinned notes, got ${pinned2.body.length}`);

    // ── Unpin note #1 ────────────────────────────────────────
    banner(`UNPIN — PATCH /notes/${notes[0]._id}/unpin`);
    const unpin1 = await req('PATCH', `/notes/${notes[0]._id}/unpin`);
    info(`Status: ${unpin1.status} | pinned: ${unpin1.body.pinned}`);
    unpin1.body.pinned === false
        ? pass(`"${unpin1.body.title}" successfully unpinned`)
        : fail('Unpin did not set pinned: false');

    // ── GET /notes/pinned — should be back to 1 ─────────────
    banner('CHECK 4 — GET /notes/pinned after unpin (expect 1)');
    const pinned1 = await req('GET', '/notes/pinned');
    info(`Status: ${pinned1.status} | Count: ${pinned1.body.length}`);
    pinned1.body.forEach(n => info(`  → #${n._id} "${n.title}" | pinned: ${n.pinned}`));
    pinned1.body.length === 1
        ? pass('Exactly 1 pinned note after unpin — correct')
        : fail(`Expected 1 pinned note, got ${pinned1.body.length}`);

    // ── Confirm existing features still work ─────────────────
    banner('CHECK 5 — Existing features unaffected (regression check)');
    const allNotes = await req('GET', '/notes');
    info(`GET /notes → ${allNotes.status} | count: ${allNotes.body.length}`);
    allNotes.status === 200
        ? pass('GET /notes still works')
        : fail('GET /notes broken');

    const search = await req('GET', '/notes/search?q=login');
    info(`GET /notes/search?q=login → ${search.status} | results: ${search.body.length}`);
    search.status === 200 && search.body.length > 0
        ? pass('Search still works — found "Bug Fix: Login Timeout"')
        : fail('Search broken');

    const stats = await req('GET', '/notes/stats');
    info(`GET /notes/stats → ${stats.status} | totalNotes: ${stats.body.totalNotes}`);
    stats.status === 200
        ? pass('Stats endpoint still works')
        : fail('Stats broken');

    banner('🎉  PIN FEATURE DEMO COMPLETE');
    console.log('');
    console.log('  Files changed this session:');
    console.log('    app/utils/memory-store.js             — pinned field + findPinned()');
    console.log('    app/controllers/note.controller.memory.js — pin / unpin / pinned handlers');
    console.log('    app/routes/note.routes.memory.js      — 3 new routes wired up');
    console.log('');
}

run().catch(console.error);
