document.addEventListener('DOMContentLoaded', () => {
  if (getPage() === 'wishlist') {
    const wishlist = storage().get('wishlist');

    displayBooks(wishlist);
  } else if (getPage() === 'book') {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('book');

    getBook(id);
  } else if (getPage() === 'home') {
    loadBooks();
    handleSearch();
    // handleGenreFilter();
  }
});

function getPage() {
  const pathname = window.location.pathname;

  let page = 'unknown';

  if (pathname.includes('wishlist')) {
    page = 'wishlist';
  } else if (pathname.includes('book')) {
    page = 'book';
  } else if (pathname.includes('index') || pathname === '/') {
    page = 'home';
  }

  return page;
}

async function getBook(bookId) {
  // const data = await fetchBooks({ id: bookId });

  displayBookDetails(mock_data?.['results']?.[0]);
}

async function loadBooks(page = 1, search = '', genre = '') {
  // const data = await fetchBooks({page, search, genre});
  const data = mock_data;

  const finalData = getFinalData(data.results);

  displayBooks(finalData);
  setupPagination(data.count, page);

  console.log(finalData);

  storeBook(finalData);

  console.log(data);
}

function getFinalData(data) {
  const wishlist = storage().get('wishlist');
  const final_data = data.map((el) => ({
    ...el,
    isWishlist: !!wishlist?.some((e) => e.id === el.id),
  }));

  return final_data;
}

function storeBook(data) {
  storage('session').set('book-list', data);
}

function handleSearch() {
  const searchInput = document.getElementById('search-input');
  searchInput.addEventListener('input', () => {
    loadBooks(1, searchInput.value);
  });
}

// function handleGenreFilter() {
//   const genreFilter = document.getElementById('genre-filter');
//   genreFilter.addEventListener('change', () => {
//     loadBooks(1, '', genreFilter.value);
//   });
// }

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
  let books = storage('session').get('book-list');
  let book = books.find((el) => bookId === el.id);

  let wishlist = storage().get('wishlist') || [];

  if (wishlist.some((el) => el.id === book.id)) {
    wishlist = wishlist.filter((el) => el.id !== book.id);
    books = books.map((el) =>
      el.id === bookId ? { ...el, isWishlist: false } : el
    );
    book.isWishlist = false;
  } else {
    book.isWishlist = true;
    books = books.map((el) =>
      el.id === bookId ? { ...el, isWishlist: true } : el
    );
    wishlist.push(book);
  }

  storage('session').set('book-list', books);
  storage().set('wishlist', wishlist);

  if (getPage() === 'wishlist') {
    displayBooks(wishlist);
  } else if (getPage() === 'book') {
    displayBookDetails(book);
  } else {
    displayBooks(books);
  }
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
