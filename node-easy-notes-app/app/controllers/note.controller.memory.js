const memoryStore = require('../utils/memory-store');

// Create and Save a new Note
exports.create = (req, res) => {
    // Validate request
    if(!req.body.content) {
        return res.status(400).send({
            message: "Note content can not be empty"
        });
    }

    // Create a Note
    const note = new Promise((resolve, reject) => {
        memoryStore.create({
            title: req.body.title || "Untitled Note", 
            content: req.body.content,
            tags: req.body.tags || []
        }).then(resolve).catch(reject);
    });

    note.then(data => {
        res.send(data);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while creating the Note."
        });
    });
};

// Retrieve and return all notes from the database.
exports.findAll = (req, res) => {
    const query = {};
    
    // Filter by tags if provided
    if (req.query.tags) {
        const tags = Array.isArray(req.query.tags) ? req.query.tags : req.query.tags.split(',');
        query.tags = { $in: tags };
    }
    
    memoryStore.findAll(query)
    .then(notes => {
        res.send(notes);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving notes."
        });
    });
};

// Find a single note with a noteId
exports.findOne = (req, res) => {
    memoryStore.findById(req.params.noteId)
    .then(note => {
        if(!note) {
            return res.status(404).send({
                message: "Note not found with id " + req.params.noteId
            });            
        }
        res.send(note);
    }).catch(err => {
        return res.status(500).send({
            message: "Error retrieving note with id " + req.params.noteId
        });
    });
};

// Update a note identified by the noteId in the request
exports.update = (req, res) => {
    // Validate Request
    if(!req.body.content) {
        return res.status(400).send({
            message: "Note content can not be empty"
        });
    }

    // Find note and update it with the request body
    memoryStore.findByIdAndUpdate(req.params.noteId, {
        title: req.body.title || "Untitled Note",
        content: req.body.content,
        tags: req.body.tags || []
    })
    .then(note => {
        if(!note) {
            return res.status(404).send({
                message: "Note not found with id " + req.params.noteId
            });
        }
        res.send(note);
    }).catch(err => {
        return res.status(500).send({
            message: "Error updating note with id " + req.params.noteId
        });
    });
};

// Delete a note with the specified noteId in the request
exports.delete = (req, res) => {
    memoryStore.findByIdAndRemove(req.params.noteId)
    .then(note => {
        if(!note) {
            return res.status(404).send({
                message: "Note not found with id " + req.params.noteId
            });
        }
        res.send({message: "Note deleted successfully!"});
    }).catch(err => {
        return res.status(500).send({
            message: "Could not delete note with id " + req.params.noteId
        });
    });
};

// Pin a note
exports.pin = (req, res) => {
    memoryStore.findByIdAndUpdate(req.params.noteId, { pinned: true })
    .then(note => {
        if (!note) {
            return res.status(404).send({ message: "Note not found with id " + req.params.noteId });
        }
        res.send(note);
    }).catch(err => {
        res.status(500).send({ message: "Error pinning note with id " + req.params.noteId });
    });
};

// Unpin a note
exports.unpin = (req, res) => {
    memoryStore.findByIdAndUpdate(req.params.noteId, { pinned: false })
    .then(note => {
        if (!note) {
            return res.status(404).send({ message: "Note not found with id " + req.params.noteId });
        }
        res.send(note);
    }).catch(err => {
        res.status(500).send({ message: "Error unpinning note with id " + req.params.noteId });
    });
};

// Get all pinned notes
exports.pinned = (req, res) => {
    memoryStore.findPinned()
    .then(notes => {
        res.send(notes);
    }).catch(err => {
        res.status(500).send({ message: err.message || "Error retrieving pinned notes." });
    });
};

// Return a quick count of all notes
exports.count = (req, res) => {
    memoryStore.findAll()
    .then(notes => {
        res.send({ count: notes.length });
    }).catch(err => {
        res.status(500).send({ message: err.message || "Error counting notes." });
    });
};

// Return statistics about stored notes
exports.stats = (req, res) => {
    memoryStore.findAll()
    .then(notes => {
        const tagCounts = {};
        notes.forEach(note => {
            (note.tags || []).forEach(tag => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        });

        res.send({
            totalNotes: notes.length,
            tagBreakdown: tagCounts,
            generatedAt: new Date()
        });
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Error generating stats."
        });
    });
};

// Search notes by title, content, or tags
exports.search = (req, res) => {
    const searchTerm = req.query.q;
    
    if (!searchTerm) {
        return res.status(400).send({
            message: "Please provide a search term using the 'q' parameter"
        });
    }
    
    memoryStore.search(searchTerm)
    .then(notes => {
        res.send(notes);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while searching notes."
        });
    });
};