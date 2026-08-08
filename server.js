const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DB_FILE = path.join(__dirname, 'notes.json');

app.use(express.json());
app.use(express.static('public'));

function getNotes() {
    try {
        const data = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

function saveNotes(notes) {
    fs.writeFileSync(DB_FILE, JSON.stringify(notes, null, 2));
}

// 1. GET - Retrieve all notes
app.get('/notes', (req, res) => {
    res.json(getNotes());
});

// 2. POST - Create a new note
app.post('/notes', (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Text required' });

    const notes = getNotes();
    const newNote = { 
        id: Date.now().toString(), 
        text: text,
        isEdited: false // Starts as false
    };
    notes.push(newNote);
    
    saveNotes(notes);
    res.status(201).json(newNote);
});

// 3. PUT - Update (Edit) an existing note
app.put('/notes/:id', (req, res) => {
    const noteId = req.params.id;
    const { text } = req.body;
    let notes = getNotes();
    
    const noteIndex = notes.findIndex(note => note.id === noteId);
    
    if (noteIndex !== -1) {
        notes[noteIndex].text = text; // Update the text
        notes[noteIndex].isEdited = true; // Mark it as edited!
        saveNotes(notes);
        res.json({ message: 'Note updated successfully' });
    } else {
        res.status(404).json({ error: 'Note not found' });
    }
});

// 4. DELETE - Remove a note
app.delete('/notes/:id', (req, res) => {
    const noteId = req.params.id;
    let notes = getNotes();
    
    const updatedNotes = notes.filter(note => note.id !== noteId);
    saveNotes(updatedNotes);
    
    res.json({ message: 'Note deleted successfully' });
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});