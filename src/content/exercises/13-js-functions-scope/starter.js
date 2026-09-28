// Lesson 13 starter: functions, scope and closures
// Console output appears in the panel under the editor.

// TODO 1: make this function RETURN a string like "Hello, Ada!"
function createGreeting(name) {
  return ''; // replace this line
}

// TODO 2: keep count private with a closure
function makeCounter() {
  let count = 0;
  return function () {
    // TODO: increase count by one, then return it
    return 0;
  };
}

console.log(createGreeting('Ada'));

const nextNumber = makeCounter();
console.log(nextNumber(), nextNumber(), nextNumber()); // expect 1 2 3
