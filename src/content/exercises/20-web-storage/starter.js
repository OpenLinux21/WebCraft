// Lesson 20 - A todo list that remembers.
// The interface and rendering are done; your job is persistence with
// a safe fallback. In this sandboxed preview iframe localStorage may
// be unavailable (opaque origin), so every access must be guarded.

const STORAGE_KEY = 'todo-list.v1';
const memoryStore = {}; // fallback storage when localStorage throws

let tasks = []; // the single source of truth

// ---------------------------------------------------------------------------
// Persistence - implement this section.
// ---------------------------------------------------------------------------

// TODO 1: write storageGet() and storageSet(value) helpers.
// Each wraps localStorage.getItem / localStorage.setItem in try/catch.
// On failure, storageGet returns null and storageSet writes into
// memoryStore[STORAGE_KEY] instead. Nothing should ever throw.

// TODO 2: write loadTasks() that:
//   - reads the raw string via storageGet()
//   - returns [] when there is nothing saved
//   - JSON.parse()s it inside try/catch (a malformed string rejects the data)
//   - shape-checks the result: an array whose items have "text" and "done"
//   - returns [] for anything suspicious

// TODO 3: write save() that stores JSON.stringify(tasks) via storageSet().

// ---------------------------------------------------------------------------
// Events - wire them up.
// ---------------------------------------------------------------------------

// TODO 4: on the form's "submit" event: preventDefault(), ignore empty
// input, push { id: Date.now(), text: trimmedInput, done: false },
// clear the input, then render() and save().

// TODO 5: listen on the #task-list for "change" events. When a checkbox
// toggles, find the task by its id (event.target.closest("li").dataset.id)
// and flip its "done" property, then render() and save().

// TODO 6: listen on the #task-list for "click" events. When a .delete
// button is clicked, remove the matching task from the array, then
// render() and save().

// ---------------------------------------------------------------------------
// Startup - load first, render second.
// ---------------------------------------------------------------------------

// TODO 7: on startup, fill tasks from loadTasks() before the first
// render() call at the bottom of this file.

// ---------------------------------------------------------------------------
// Rendering - already implemented, no changes needed.
// ---------------------------------------------------------------------------

function render() {
  const list = document.querySelector('#task-list');
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

// Shows whether persistence is live or only in memory. In the sandboxed
// preview you will usually see the memory message - that is expected.
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

render();
