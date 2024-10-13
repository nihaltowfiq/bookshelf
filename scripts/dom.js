function displayBooks(books) {
  const bookList = document.getElementById('book-list');
  bookList.innerHTML = '';

  books.forEach((book) => {
    const bookCard = document.createElement('div');
    bookCard.classList.add('book-card');
    bookCard.innerHTML = `
      <img src="${book.formats['image/jpeg']}" alt="${book.title}">
      <h3>${book.title}</h3>
      <p>Author: ${book.authors.map((a) => a.name).join(', ')}</p>
      <button onclick="toggleWishlist(${book.id})">❤️</button>
    `;
    bookList.appendChild(bookCard);
  });
}

function displayGenres(genres) {
  const genreFilter = document.getElementById('genre-filter');
  genres.forEach((genre) => {
    const option = document.createElement('option');
    option.value = genre;
    option.textContent = genre;
    genreFilter.appendChild(option);
  });
}

// export { displayBooks, displayGenres };
