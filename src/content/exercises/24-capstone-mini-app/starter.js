// TODO: the interactive task board.
// 1. Model: an array of { id, text, done } objects — the single source of truth.
// 2. render(): rebuild #task-list and #task-count from the model. Use only
//    createElement + textContent (no innerHTML with user input!).
// 3. save()/loadTasks(): persist to localStorage inside try/catch, with a
//    defensive load (validate the parsed value, fall back to []).
// 4. Events: submit on the form adds a task; ONE change listener and ONE
//    click listener on #task-list (event delegation) toggle and delete tasks.
