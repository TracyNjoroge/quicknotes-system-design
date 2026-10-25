const API_URL = "https://jsonplaceholder.typicode.com/posts";

const loadButton = document.getElementById("load-btn");
const statusMessage = document.getElementById("status");
const notesList = document.getElementById("notes-list");
const noteForm = document.getElementById("note-form");
const titleInput = document.getElementById("title-input");
const bodyInput = document.getElementById("body-input");
const submitButton = document.getElementById("submit-btn");

// Send a request to the API and handle unsuccessful responses.
async function request(url, options = {}) {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  // DELETE requests may return an empty response.
  if (response.status === 204) {
    return null;
  }

  return response.json();
}

// Create and return a note element with a Delete button.
function displayNote(note) {
  const listItem = document.createElement("li");
  listItem.dataset.noteId = note.id;

  const title = document.createElement("h3");
  title.textContent = note.title;

  const body = document.createElement("p");
  body.textContent = note.body || "";

  const deleteButton = document.createElement("button");
  deleteButton.textContent = "Delete";
  deleteButton.type = "button";

  deleteButton.addEventListener("click", () => {
    deleteNote(note.id, listItem, deleteButton);
  });

  listItem.appendChild(title);
  listItem.appendChild(body);
  listItem.appendChild(deleteButton);

  return listItem;
}

// GET: Load the first 10 notes.
async function loadNotes() {
  loadButton.disabled = true;
  statusMessage.textContent = "Loading notes...";
  notesList.replaceChildren();

  try {
    const notes = await request(`${API_URL}?_limit=10`);

    if (notes.length === 0) {
      statusMessage.textContent = "No notes found.";
      return;
    }

    notes.forEach((note) => {
      notesList.appendChild(displayNote(note));
    });

    statusMessage.textContent =
      `Loaded ${notes.length} notes from the server.`;
  } catch (error) {
    statusMessage.textContent =
      "Sorry, we couldn't load the notes. Please try again.";

    console.error("Error loading notes:", error);
  } finally {
    loadButton.disabled = false;
  }
}

// POST: Create a new note.
async function createNote(event) {
  event.preventDefault();

  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();

  if (!title) {
    statusMessage.textContent = "Please enter a note title.";
    titleInput.focus();
    return;
  }

  if (title.length > 100) {
    statusMessage.textContent =
      "The title cannot exceed 100 characters.";

    titleInput.focus();
    return;
  }

  submitButton.disabled = true;
  statusMessage.textContent = "Creating note...";

  try {
    const newNote = await request(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: title,
        body: body,
        userId: 1
      })
    });

    // JSONPlaceholder simulates POST requests but does not
    // permanently save new notes. We add the returned note
    // to the page so the user can see and interact with it.
    notesList.prepend(displayNote(newNote));

    statusMessage.textContent =
      `Note created (status 201, id ${newNote.id}).`;

    noteForm.reset();
  } catch (error) {
    statusMessage.textContent =
      "Sorry, we couldn't create the note. Please try again.";

    console.error("Error creating note:", error);
  } finally {
    submitButton.disabled = false;
  }
}

// DELETE: Remove a note from the list.
async function deleteNote(noteId, listItem, deleteButton) {
  deleteButton.disabled = true;
  statusMessage.textContent = "Deleting note...";

  try {
    await request(`${API_URL}/${noteId}`, {
      method: "DELETE"
    });

    // JSONPlaceholder simulates DELETE requests and does not
    // permanently change its stored data. Remove the note from
    // the current page after the simulated request succeeds.
    listItem.remove();

    statusMessage.textContent =
      `Note ${noteId} deleted successfully.`;
  } catch (error) {
    statusMessage.textContent =
      "Sorry, we couldn't delete the note. Please try again.";

    console.error("Error deleting note:", error);
  } finally {
    deleteButton.disabled = false;
  }
}

// Connect the buttons and form to their functions.
loadButton.addEventListener("click", loadNotes);
noteForm.addEventListener("submit", createNote);