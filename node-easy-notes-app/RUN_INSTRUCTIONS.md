# Run Instructions

## Quick Start (Without MongoDB)

For demonstration and testing, you can run the application without MongoDB using in-memory storage:

```bash
# Start the server in memory mode
node server.memory.js

# In another terminal, test the features
node test-features.js
```

The server will start on port 3000 and all data will be stored in memory (data is lost when server stops).

## Standard Start (With MongoDB)

To run with MongoDB (requires MongoDB installation):

```bash
# Install dependencies
npm install

# Start MongoDB service
# On Windows: net start MongoDB
# On Mac/Linux: sudo service mongod start

# Start the server
node server.js
```

## API Endpoints

### Create a Note
```bash
POST /notes
Content-Type: application/json

{
  "title": "Meeting Notes",
  "content": "Discussion about project roadmap",
  "tags": ["work", "meetings", "planning"]
}
```

### Get All Notes (with optional tag filtering)
```bash
GET /notes                    # Get all notes
GET /notes?tags=work         # Filter by single tag
GET /notes?tags=work,meetings # Filter by multiple tags
```

### Search Notes
```bash
GET /notes/search?q=roadmap   # Search for "roadmap" in title, content, or tags
```

### Get Single Note
```bash
GET /notes/:noteId
```

### Update Note
```bash
PUT /notes/:noteId
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content",
  "tags": ["work", "updated"]
}
```

### Delete Note
```bash
DELETE /notes/:noteId
```

## Testing

Run the automated test suite:
```bash
node test-features.js
```

This will create sample notes and test all the new organization and search features.