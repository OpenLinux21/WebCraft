// Interactive task board — the capstone.
// Pattern: state -> render() -> save(); events mutate state, never the DOM directly.

const STORAGE_KEY = 'taskboard.tasks';

function storageGet(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null; // storage unavailable (private mode, sandboxed iframe)
  }
}

function storageSet(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Quota or unavailable storage: the board keeps working in memory.
  }
}

function loadTasks() {
  const raw = storageGet(STORAGE_KEY);
  if (raw === null) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) => item && typeof item.text === 'string' && typeof item.done === 'boolean',
    );
  } catch {
    return []; // malformed JSON: start fresh instead of crashing
  }
}

function saveTasks() {
  storageSet(STORAGE_KEY, JSON.stringify(tasks));
}

let tasks = loadTasks();

const list = document.getElementById('task-list');
const count = document.getElementById('task-count');
const form = document.getElementById('task-form');
const input = document.getElementById('task-input');

function render() {
  list.replaceChildren();
  for (const task of tasks) {
    const item = document.createElement('li');
    item.dataset.id = task.id;
    if (task.done) item.classList.add('done');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.done;
    const label = document.createElement('span');
    label.textContent = task.text;
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'delete';
    remove.textContent = 'Delete';

    item.append(checkbox, label, remove);
    list.append(item);
  }
  const doneCount = tasks.filter((task) => task.done).length;
  count.textContent = `Completed ${doneCount}/${tasks.length}`;
}

function save() {
  saveTasks();
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (text === '') return;
  tasks.push({ id: String(Date.now()), text, done: false });
  input.value = '';
  render();
  save();
});

// Event delegation: one listener per interaction type on the container.
list.addEventListener('change', (event) => {
  const item = event.target.closest('li');
  if (!item) return;
  const task = tasks.find((entry) => entry.id === item.dataset.id);
  if (!task) return;
  task.done = event.target.checked;
  render();
  save();
});

list.addEventListener('click', (event) => {
  const button = event.target.closest('button.delete');
  if (!button) return;
  const item = button.closest('li');
  tasks = tasks.filter((entry) => entry.id !== item.dataset.id);
  render();
  save();
});

render();
