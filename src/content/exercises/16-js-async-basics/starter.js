// Lesson 16 starter: promises and timers
// Everything is offline: only setTimeout and Promise are used.

// TODO 1: return a Promise that resolves after ms milliseconds
function wait(ms) {
  return Promise.resolve(); // replace this line
}

// TODO 2: log 3, 2, 1 one second apart, then "Go!"
// hint: put "await wait(1000)" between the logs
async function countdown() {
  console.log(3);
}

countdown();
console.log('countdown started');
