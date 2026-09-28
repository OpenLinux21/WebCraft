// Lesson 16 solution: promises and timers
// A promise wrapping a timer: the timer calls resolve when the delay is over.
function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function countdown() {
  console.log(3);
  await wait(1000);
  console.log(2);
  await wait(1000);
  console.log(1);
  await wait(1000);
  console.log('Go!');
}

countdown();
console.log('countdown started'); // prints before any number
