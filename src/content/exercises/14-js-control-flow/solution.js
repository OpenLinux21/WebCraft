// Lesson 14 solution: conditionals and loops
function classify(n) {
  if (n % 15 === 0) return 'fizzbuzz'; // most specific case first
  if (n % 3 === 0) return 'fizz';
  if (n % 5 === 0) return 'buzz';
  return String(n);
}

for (let n = 1; n <= 15; n += 1) {
  console.log(n + ' -> ' + classify(n));
}
// 1, 2, fizz, 4, buzz, fizz, 7, 8, fizz, buzz,
// 11, fizz, 13, 14, fizzbuzz
