# AI Coding Agent

A Python-based AI coding agent that explores an existing Node.js codebase and implements product requirements with minimal human guidance.

**Assignment request handled:**
> "Improve the application so users can better organise and search their notes."

**GitHub:** https://github.com/sarvamangala-c/ConversAIlabs

---

## What was built

The agent targeted [node-easy-notes-app](https://github.com/callicoder/node-easy-notes-app) — a Node.js / Express / MongoDB REST API — and delivered:

| Feature | Endpoints |
|---------|-----------|
| Tags on every note | `POST /notes` / `PUT /notes/:id` accept `tags: []` |
| Filter notes by tag | `GET /notes?tags=work,planning` |
| Full-text search | `GET /notes/search?q=<term>` — matches title, content, tags |
| Tag statistics | `GET /notes/stats` — total count + per-tag breakdown |
| Quick count | `GET /notes/count` |
| Pin / unpin notes | `PATCH /notes/:id/pin` · `PATCH /notes/:id/unpin` |
| List pinned notes | `GET /notes/pinned` |

All original CRUD endpoints (`GET /notes`, `GET /notes/:id`, `POST /notes`, `PUT /notes/:id`, `DELETE /notes/:id`) are fully preserved.

A no-MongoDB memory mode is included for zero-dependency local running:

```bash
cd node-easy-notes-app
node server.memory.js        # starts on http://localhost:3000
node demo-existing-api.js    # live walkthrough of all endpoints
node demo-pin-feature.js     # end-to-end pin/unpin verification
```

---

## Architecture

```
ConversAIlabs/
├── ai_coding_agent.py              # Python agent (entry point)
├── README_AGENT.md                 # This file
└── node-easy-notes-app/            # Target Node.js application
    ├── server.js                   # MongoDB entry point
    ├── server.memory.js            # Memory-mode entry point (no DB needed)
    ├── app/
    │   ├── models/
    │   │   └── note.model.js           # Mongoose schema (tags field added)
    │   ├── controllers/
    │   │   ├── note.controller.js      # MongoDB controller
    │   │   └── note.controller.memory.js  # Memory controller (all features)
    │   ├── routes/
    │   │   ├── note.routes.js          # MongoDB routes
    │   │   └── note.routes.memory.js   # Memory routes (all endpoints)
    │   └── utils/
    │       └── memory-store.js         # In-memory data store
    ├── demo-existing-api.js        # Demo: all pre-existing endpoints
    ├── demo-pin-feature.js         # Demo: new pin feature end-to-end
    ├── test-stats.js               # Stats endpoint test
    └── test-count.js               # Count endpoint test
```

### Technology stack

| Layer | Choice |
|-------|--------|
| Agent language | Python 3.11+ |
| Target app runtime | Node.js + Express.js |
| Target app database | MongoDB + Mongoose (memory mode available) |
| Agent dependencies | Python standard library only (`pathlib`, `json`, `re`, `os`) |

---

## Agent workflow

The agent runs in four sequential phases:

### 1. Repository exploration — `explore_repository()`

```
repo root
  → _get_directory_structure()   build full file tree with pathlib
  → _identify_key_files()        match patterns: package.json, *model*, *controller*, *route*, *config*
  → _read_key_files()            read every identified file into memory
  → _analyze_project()           parse package.json → detect Node.js / Express / MongoDB / MVC
```

The exploration is fully automatic — no file paths are hard-coded. The agent discovers them by scanning for framework-specific naming conventions.

### 2. Planning — `create_execution_plan(user_request)`

The agent parses the free-text request for intent keywords (`organise`, `search`, `tag`, `categor`, `pin`, etc.) and maps them to a concrete step list. Each step records:

- `action` — what to do in plain English
- `file` — which file to modify
- `reason` — why this change satisfies the requirement

Example plan generated for the assignment request:

```
Step 1  Add tags field to Note model                  app/models/note.model.js
Step 2  Update controller create/update for tags      app/controllers/note.controller.js
Step 3  Add tag filtering to findAll                  app/controllers/note.controller.js
Step 4  Implement full-text search                    app/controllers/note.controller.js
Step 5  Add search endpoint to routes                 app/routes/note.routes.js
```

### 3. Code modification — `modify_codebase()`

Each step calls a dedicated private method that:
1. Reads the target file
2. Locates the exact code section using string pattern matching
3. Replaces it with the enhanced version
4. Returns `{ file, change, status: 'success' | 'skipped' }` — skipped if the pattern was already present (idempotent)

Methods added this session:

| Method | What it does |
|--------|-------------|
| `_modify_note_model()` | Adds `tags: [String]` to Mongoose schema |
| `_update_controller_for_tags()` | Passes `tags` through create / update |
| `_add_tag_filtering()` | Adds `?tags=` query param to `findAll` |
| `_add_search_functionality()` | Adds `exports.search` with regex match |
| `_add_search_route()` | Wires `GET /notes/search` |
| `_add_pin_functionality()` | Adds `pin`, `unpin`, `pinned` handlers + `findPinned()` |

### 4. Summary — `summarize_changes()`

Returns a structured report covering exploration data, execution plan, every change made, files modified, and total change count. Printed to stdout on completion.

---

## How the repository is explored

```python
# 1. Walk entire tree, skip hidden dirs
for item in path.iterdir():
    if item.name.startswith('.'): continue
    structure[relative_path] = "file" | "directory"

# 2. Identify key files by name pattern
patterns = ['package.json', 'server.js', 'app.js', 'README.md', ...]
mvc_keywords = ['model', 'controller', 'route', 'config']

# 3. Read all identified files into a dict
contents[file_path] = open(full_path).read()

# 4. Detect tech stack from package.json
dependencies = package_json.get('dependencies', {})
if 'express'   in dependencies: framework = 'Express.js'
if 'mongoose'  in dependencies: database  = 'MongoDB'
```

No LLM call is needed for exploration — the structure is deterministic and rule-based, which makes it fast and reproducible.

---

## Running the agent

```bash
# Prerequisites: Python 3.11+, repo cloned at ./node-easy-notes-app
cd ConversAIlabs
python ai_coding_agent.py
```

Expected output:

```
[AGENT] ============================================================
[AGENT] AI CODING AGENT - STARTING EXECUTION
[AGENT] ============================================================
[AGENT] Starting repository exploration...
[AGENT] Exploration complete. Found N key files.
[AGENT] Creating execution plan for request: Improve the application...
[AGENT] Created execution plan with 5 steps
[AGENT] Starting codebase modifications...
[AGENT] Step 1: Add tags field to Note model for categorization
...
[AGENT] Completed 5 modifications

============================================================
EXECUTION SUMMARY
============================================================
Project Type : Node.js
Framework    : Express.js
Architecture : REST API
Database     : MongoDB

Files Modified : app/models/note.model.js, app/controllers/note.controller.js, app/routes/note.routes.js
Total Changes  : 5

Changes Made:
  - app/models/note.model.js: Added tags field to Note schema (success)
  - app/controllers/note.controller.js: Updated create/update for tags (success)
  - app/controllers/note.controller.js: Added tag filtering to findAll (success)
  - app/controllers/note.controller.js: Added search method (success)
  - app/routes/note.routes.js: Added GET /notes/search route (success)
```

---

## API reference

### Notes CRUD (unchanged)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/notes` | Create note. Body: `{ title, content, tags[] }` |
| `GET` | `/notes` | List all notes. Query: `?tags=tag1,tag2` |
| `GET` | `/notes/:id` | Get single note |
| `PUT` | `/notes/:id` | Update note |
| `DELETE` | `/notes/:id` | Delete note |

### Organisation & search (added by agent)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/notes/search?q=term` | Search title, content, tags (case-insensitive) |
| `GET` | `/notes/stats` | Total count + tag breakdown |
| `GET` | `/notes/count` | `{ count: N }` |
| `GET` | `/notes/pinned` | All pinned notes |
| `PATCH` | `/notes/:id/pin` | Pin a note |
| `PATCH` | `/notes/:id/unpin` | Unpin a note |

### Example requests

```bash
# Create a tagged note
curl -X POST http://localhost:3000/notes \
  -H "Content-Type: application/json" \
  -d '{"title":"Sprint planning","content":"Define Q3 milestones","tags":["work","planning"]}'

# Filter by tag
curl "http://localhost:3000/notes?tags=work"

# Search across all fields
curl "http://localhost:3000/notes/search?q=milestone"

# Pin a note
curl -X PATCH http://localhost:3000/notes/1/pin

# List pinned notes
curl http://localhost:3000/notes/pinned
```

---

## Assumptions and trade-offs

| Decision | Rationale |
|----------|-----------|
| Tags over categories | Arrays of strings give more flexibility; no schema migration needed |
| MongoDB regex search | Sufficient for small-medium datasets; avoids adding a search engine dependency |
| String pattern matching for code edits | Deterministic, no external LLM call required, safe to re-run (idempotent) |
| Memory-mode server | Allows full feature demonstration with zero external dependencies |
| No AST-based modification | Overkill for additive changes to a small, consistent codebase |
| Rule-based planning | Predictable output; LLM integration is a straightforward future upgrade |

### Known limitations

- String matching will miss code that uses a different formatting style
- Search uses regex on every document — add a MongoDB text index for production scale
- Memory mode resets on server restart (by design for demo purposes)
- Agent plan keywords are English-only

### Future enhancements

- Integrate OpenAI / Anthropic API for free-form request understanding
- Use an AST (e.g. `acorn`) for language-aware code modification
- Add MongoDB text indexes and weighted scoring to search
- Auto-generate OpenAPI / Swagger docs from routes
- Add pagination to `GET /notes`
- Write Jest unit tests alongside each modification

---

## Generalisation to new tasks

The agent handled the original request and then — live in the same session — was extended to add an entirely new feature (pin/unpin) without any changes to the agent's core loop. The pattern is:

1. Add a new intent keyword to `create_execution_plan()`
2. Add a corresponding `_add_<feature>()` private method
3. The rest of the workflow (explore → plan → modify → summarise) is unchanged

This demonstrates the architecture generalises cleanly to new product requests on the same codebase.
