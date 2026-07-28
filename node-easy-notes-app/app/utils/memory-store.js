// Simple in-memory storage for demonstration without MongoDB
class MemoryStore {
    constructor() {
        this.notes = [];
        this.idCounter = 1;
    }

    async create(noteData) {
        const note = {
            _id: this.idCounter.toString(),
            title: noteData.title || "Untitled Note",
            content: noteData.content,
            tags: noteData.tags || [],
            createdAt: new Date(),
            updatedAt: new Date()
        };
        this.idCounter++;
        this.notes.push(note);
        return note;
    }

    async findAll(query = {}) {
        let notes = [...this.notes];
        
        // Filter by tags if provided
        if (query.tags && query.tags.$in) {
            const tags = query.tags.$in;
            notes = notes.filter(note => 
                note.tags && note.tags.some(tag => tags.includes(tag))
            );
        }
        
        return notes;
    }

    async findById(id) {
        return this.notes.find(note => note._id === id);
    }

    async findByIdAndUpdate(id, updateData) {
        const index = this.notes.findIndex(note => note._id === id);
        if (index === -1) return null;
        
        this.notes[index] = {
            ...this.notes[index],
            title: updateData.title || this.notes[index].title,
            content: updateData.content || this.notes[index].content,
            tags: updateData.tags !== undefined ? updateData.tags : this.notes[index].tags,
            updatedAt: new Date()
        };
        
        return this.notes[index];
    }

    async findByIdAndRemove(id) {
        const index = this.notes.findIndex(note => note._id === id);
        if (index === -1) return null;
        
        const removed = this.notes.splice(index, 1)[0];
        return removed;
    }

    async search(searchTerm) {
        const term = searchTerm.toLowerCase();
        return this.notes.filter(note => 
            (note.title && note.title.toLowerCase().includes(term)) ||
            (note.content && note.content.toLowerCase().includes(term)) ||
            (note.tags && note.tags.some(tag => tag.toLowerCase().includes(term)))
        );
    }
}

module.exports = new MemoryStore();