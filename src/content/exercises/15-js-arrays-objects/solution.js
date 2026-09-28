// Lesson 15 solution: arrays and objects
const books = [
  { title: 'HTML Foundations', author: 'Ada', year: 2019 },
  { title: 'CSS in Depth', author: 'Rosa', year: 2021 },
  { title: 'JS Everywhere', author: 'Mika', year: 2023 },
  { title: 'Design Basics', author: 'Lin', year: 2016 },
];

// 1. every book as "Title by Author"
for (const book of books) {
  console.log(book.title + ' by ' + book.author);
}

// 2. only books from 2021 onwards
const recent = books.filter((book) => book.year >= 2021);
console.log(recent);

// 3. just the titles of the recent books
const recentTitles = recent.map((book) => book.title);
console.log(recentTitles); // ["CSS in Depth", "JS Everywhere"]
