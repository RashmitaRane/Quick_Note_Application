const noteInput = document.getElementById('note-input');
const addBtn = document.getElementById('add-btn');
const notesContainer = document.getElementById('notes-container');

// Modal Elements
const editModal = document.getElementById('edit-modal');
const editNoteInput = document.getElementById('edit-note-input');
const saveEditBtn = document.getElementById('save-edit-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');

let currentEditId = null;
let currentEditText = '';

fetchNotes();
addBtn.addEventListener('click', createNote);

// READ
async function fetchNotes() {
    try {
        const response = await fetch('/notes');
        const notes = await response.json();
        renderNotes(notes);
    } catch (error) {
        console.error('Failed to fetch:', error);
    }
}

// CREATE
async function createNote() {
    const text = noteInput.value.trim();
    if (text === '') {
        alert('Please enter a note!');
        return;
    }

    try {
        const response = await fetch('/notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
        if (response.ok) {
            noteInput.value = ''; 
            fetchNotes();         
        }
    } catch (error) {
        console.error('Failed to create:', error);
    }
}

// --- MODAL LOGIC FOR UPDATING ---

// Open the popup box
function openEditModal(id, currentText) {
    currentEditId = id;
    currentEditText = currentText;
    editNoteInput.value = currentText; 
    editModal.classList.add('show');   
}

// Close the popup box
function closeEditModal() {
    editModal.classList.remove('show');
    currentEditId = null;
}

// Cancel button logic
cancelEditBtn.addEventListener('click', closeEditModal);

// Save button logic inside the popup
saveEditBtn.addEventListener('click', async () => {
    const newText = editNoteInput.value.trim();
    
    // If empty or unchanged, just close the box
    if (newText === '' || newText === currentEditText) {
        closeEditModal();
        return;
    }

    try {
        const response = await fetch(`/notes/${currentEditId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: newText })
        });

        if (response.ok) {
            closeEditModal(); 
            fetchNotes();     
        }
    } catch (error) {
        console.error('Failed to update:', error);
    }
});

// DELETE
async function deleteNote(id) {
    try {
        const response = await fetch(`/notes/${id}`, { method: 'DELETE' });
        if (response.ok) fetchNotes(); 
    } catch (error) {
        console.error('Failed to delete:', error);
    }
}

// RENDER HTML
function renderNotes(notes) {
    notesContainer.innerHTML = ''; 

    if (notes.length === 0) {
        notesContainer.innerHTML = '<p style="text-align: center; color: #6b7280;">No notes yet.</p>';
        return;
    }

    notes.reverse().forEach(note => {
        const noteElement = document.createElement('div');
        noteElement.className = 'note-card';

        const textContainer = document.createElement('div');
        textContainer.className = 'text-container';

        const textElement = document.createElement('span');
        textElement.className = 'note-text';
        textElement.textContent = note.text;
        textContainer.appendChild(textElement);

        // I have completely removed the (edited) label logic here!

        const buttonGroup = document.createElement('div');
        buttonGroup.className = 'button-group';

        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.className = 'edit-btn';
        editButton.onclick = () => openEditModal(note.id, note.text);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'delete-btn';
        deleteButton.onclick = () => deleteNote(note.id);

        buttonGroup.appendChild(editButton);
        buttonGroup.appendChild(deleteButton);

        noteElement.appendChild(textContainer);
        noteElement.appendChild(buttonGroup);
        notesContainer.appendChild(noteElement);
    });
}