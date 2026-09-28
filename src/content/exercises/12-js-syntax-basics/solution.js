// Profile report — the solution.
// The shape: declare -> compute -> print -> check.

const name = 'Ada';
const year = 1990;
const currentYear = 2026;

const age = currentYear - year;

console.log(name, typeof name); // "Ada" string
console.log(year, typeof year); // 1990 number
console.log(age, typeof age); // 36 number

console.log(`${name} is about ${age} years old.`);

// The classic surprise: + with a string concatenates.
console.log('5' + 2); // "52" (a string!)

// The fix: convert before computing.
console.log(Number('5') + 2); // 7
console.log(typeof Number('5')); // "number"
