// Lesson 17 solution: querying and manipulating the DOM
const list = document.querySelector('#song-list');
const statusLine = document.querySelector('#status');

const songs = ['Sunny Morning', 'Neon Rain', 'Paper Planes'];

// create, fill, attach - one list item per song
for (const song of songs) {
  const item = document.createElement('li');
  item.textContent = song;
  list.append(item);
}

statusLine.textContent = songs.length + ' songs in the list';
