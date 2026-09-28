// Lesson 18 solution: events and interaction
const likeBtn = document.querySelector('#like-btn');
const likeCount = document.querySelector('#like-count');
const form = document.querySelector('#echo-form');
const input = document.querySelector('#echo-input');
const output = document.querySelector('#echo-output');

let likes = 0;

// 1. like button: count clicks and show the total
likeBtn.addEventListener('click', function () {
  likes += 1;
  likeCount.textContent = String(likes);
});

// 2. live echo on every keystroke
input.addEventListener('input', function () {
  output.textContent = input.value;
});

// 3. submit: stay on the page, log instead
form.addEventListener('submit', function (event) {
  event.preventDefault();
  console.log('Saved!');
});
