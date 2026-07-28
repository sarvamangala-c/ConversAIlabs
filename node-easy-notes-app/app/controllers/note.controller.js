// In-memory data store (no MongoDB required)
let notes = [];
let nextId = 1;

// Create and Save a new Note
exports.create = (req, res) => {
    if (!req.body.content) {
        return res.status(400).send({ message: "Note content can not be empty" });
    }

    const note = {
        _id: String(nextId++),
        title: req.body.title || "Untitled Note",
        content: req.body.content,
        tags: req.body.tags || [],
        createdAt: new Date(),
        updatedAt: new Date()
    };

    notes.push(note);
    res.send(note);
};

// Retrieve all notes (with optional tag filter)
exports.findAll = (req, res) => {
    let result = notes;

    if (req.query.tags) {
        const filterTags = Array.isArray(req.query.tags)
            ? req.query.tags
            : req.query.tags.split(',');
        result = notes.filter(n => n.tags.some(t => filterTags.includes(t)));
    }

    res.send(result);
};

// Find a single note by ID
exports.findOne = (req, res) => {
    const note = notes.find(n => n._id === req.params.noteId);
    if (!note) {
        return res.status(404).send({ message: "Note not found with id " + req.params.noteId });
    }
    res.send(note);
};

// Update a note by ID
exports.update = (req, res) => {
    if (!req.body.content) {
        return res.status(400).send({ message: "Note content can not be empty" });
    }

    const index = notes.findIndex(n => n._id === req.params.noteId);
    if (index === -1) {
        return res.status(404).send({ message: "Note not found with id " + req.params.noteId });
    }

    notes[index] = {
        ...notes[index],
        title: req.body.title || "Untitled Note",
        content: req.body.content,
        tags: req.body.tags || [],
        updatedAt: new Date()
    };

    res.send(notes[index]);
};

// Delete a note by ID
exports.delete = (req, res) => {
    const index = notes.findIndex(n => n._id === req.params.noteId);
    if (index === -1) {
        return res.status(404).send({ message: "Note not found with id " + req.params.noteId });
    }

    notes.splice(index, 1);
    res.send({ message: "Note deleted successfully!" });
};

// Search notes by title, content, or tags
exports.search = (req, res) => {
    const searchTerm = req.query.q;

    if (!searchTerm) {
        return res.status(400).send({ message: "Please provide a search term using the 'q' parameter" });
    }

    const regex = new RegExp(searchTerm, 'i');
    const result = notes.filter(n =>
        regex.test(n.title) ||
        regex.test(n.content) ||
        n.tags.some(t => regex.test(t))
    );

    res.send(result);
};