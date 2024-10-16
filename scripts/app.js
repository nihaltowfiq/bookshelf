document.addEventListener('DOMContentLoaded', () => {
  loadBooks();
  handleSearch();
  handleGenreFilter();
});

async function loadBooks(page = 1, search = '', genre = '') {
  // const data = await fetchBooks({page, search, genre});
  const data = mock_data;
  displayBooks(data.results);
  setupPagination(data.count, page);

  console.log(data);
}

function handleSearch() {
  const searchInput = document.getElementById('search-input');
  searchInput.addEventListener('input', () => {
    loadBooks(1, searchInput.value);
  });
}

function handleGenreFilter() {
  const genreFilter = document.getElementById('genre-filter');
  genreFilter.addEventListener('change', () => {
    loadBooks(1, '', genreFilter.value);
  });
}

function setupPagination(totalCount, currentPage) {
  const pagination = document.getElementById('pagination');
  pagination.innerHTML = '';

  const totalPages = Math.ceil(totalCount / 32); // Assuming 32 books per page

  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement('button');
    pageButton.textContent = i;
    if (i === currentPage) pageButton.disabled = true;
    pageButton.addEventListener('click', () => loadBooks(i));
    pagination.appendChild(pageButton);
  }
}

function toggleWishlist(bookId) {
  let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

  if (wishlist.includes(bookId)) {
    wishlist = wishlist.filter((id) => id !== bookId);
  } else {
    wishlist.push(bookId);
  }

  localStorage.setItem('wishlist', JSON.stringify(wishlist));
  updateWishlistIcon(bookId);
}

function updateWishlistIcon(bookId) {
  const button = document.querySelector(
    `button[onclick="toggleWishlist(${bookId})"]`
  );
  let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

  if (wishlist.includes(bookId)) {
    button.classList.add('wishlisted');
  } else {
    button.classList.remove('wishlisted');
  }
}
