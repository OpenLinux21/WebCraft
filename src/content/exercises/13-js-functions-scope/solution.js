// Lesson 13 solution: functions, scope and closures
function createGreeting(name) {
  return 'Hello, ' + name + '!';
}

function makeCounter() {
  let count = 0; // private: only the inner function can see it
  return function () {
    count += 1;
    return count;
  };
}

console.log(createGreeting('Ada')); // "Hello, Ada!"

const nextNumber = makeCounter();
console.log(nextNumber(), nextNumber(), nextNumber()); // 1 2 3
