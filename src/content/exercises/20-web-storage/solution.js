// Lesson 20 - A todo list that remembers (solution).
// Persistence with a safe fallback: in the sandboxed preview iframe
// (opaque origin) localStorage can throw, so every access is guarded
// and an in-memory store keeps the app working either way.

const STORAGE_KEY = 'todo-list.v1';
const memoryStore = {}; // fallback storage when localStorage throws

let tasks = []; // the single source of truth

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------

// Guarded readers/writers: nothing in this file ever lets a storage
// error reach the user.
function storageGet() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Storage read failed, using memory:', error.message);
    return memoryStore[STORAGE_KEY] ?? null;
  }
}

function storageSet(value) {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch (error) {
    console.warn('Storage write failed, using memory:', error.message);
    memoryStore[STORAGE_KEY] = value;
  }
}

// Saved data is outside our control, so it is parsed defensively and
// shape-checked before it is trusted.
function loadTasks() {
  const raw = storageGet();
  if (raw === null) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw);
    const looksRight =
      Array.isArray(parsed) &&
      parsed.every((task) => typeof task.text === 'string' && typeof task.done === 'boolean');
    if (looksRight) {
      return parsed;
    }
    console.warn('Saved data had an unexpected shape - starting fresh.');
  } catch (error) {
    console.warn('Saved data was not valid JSON - starting fresh.');
  }
  return [];
}

function save() {
  storageSet(JSON.stringify(tasks));
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

const form = document.querySelector('#add-task');
const input = document.querySelector('#task-input');
const list = document.querySelector('#task-list');

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (text === '') {
    return;
  }
  tasks.push({ id: Date.now(), text: text, done: false });
  input.value = '';
  render();
  save(); // save after every mutation: screen and storage never drift
});

list.addEventListener('change', (event) => {
  if (event.target.type !== 'checkbox') {
    return;
  }
  const id = Number(event.target.closest('li').dataset.id);
  const task = tasks.find((t) => t.id === id);
  if (task) {
    task.done = event.target.checked;
    render();
    save();
  }
});

list.addEventListener('click', (event) => {
  if (!event.target.classList.contains('delete')) {
    return;
  }
  const id = Number(event.target.closest('li').dataset.id);
  tasks = tasks.filter((t) => t.id !== id);
  render();
  save();
});

// ---------------------------------------------------------------------------
// Startup: load first, render second.
// ---------------------------------------------------------------------------

tasks = loadTasks();
render();

// ---------------------------------------------------------------------------
// Rendering - unchanged from the starter.
// ---------------------------------------------------------------------------

function render() {
  list.replaceChildren();

  for (const task of tasks) {
    const item = document.createElement('li');
    item.dataset.id = String(task.id);
    if (task.done) {
      item.classList.add('done');
    }

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.done;
    checkbox.setAttribute('aria-label', 'Mark done: ' + task.text);

    const label = document.createElement('span');
    label.className = 'text';
    label.textContent = task.text; // textContent, never innerHTML: user input

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'delete';
    remove.textContent = 'Delete';

    item.append(checkbox, label, remove);
    list.append(item);
  }

  reportStorageMode();
}

function reportStorageMode() {
  const status = document.querySelector('#status');
  let persistent = false;
  try {
    localStorage.setItem(STORAGE_KEY + '.probe', '1');
    localStorage.removeItem(STORAGE_KEY + '.probe');
    persistent = true;
  } catch (error) {
    persistent = false;
  }
  status.hidden = false;
  status.textContent = persistent
    ? 'Saving to localStorage - your tasks survive reloads.'
    : 'localStorage is unavailable here - tasks last until reload.';
}
