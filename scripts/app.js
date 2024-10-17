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

  displayActivePage();
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

function displayActivePage() {
  const page = getPage();

  const navLinks = document.querySelectorAll('nav a');

  navLinks.forEach((link) => {
    const linkPage = link
      .getAttribute('href')
      .replace('.html', '')
      .replace('/', '');

    if (linkPage === page || (page === 'home' && linkPage === 'index')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

async function getBook(bookId) {
  const data = await fetchBooks({ id: bookId });
  // const data = mock_data;

  displayBookDetails(data?.['results']?.[0]);
}

async function loadBooks(page = 1, search = '', genre = '') {
  const data = await fetchBooks({ page, search, genre });
  // const data = mock_data;

  if (!data) return;

  const finalData = getFinalData(data?.results);

  displayBooks(finalData);
  // setupPagination(data.count, page);
  storeBook(finalData);
}

function getFinalData(data) {
  if (!data) return null;
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

  const debouncedSearch = debounce((value) => loadBooks(1, value), 500);

  searchInput.addEventListener('input', () => {
    const clearBtn = document.querySelector('.search-bar .close-btn');
    const isBtnHidden =
      window.getComputedStyle(clearBtn).visibility === 'hidden';

    if (searchInput.value.trim() !== '' && isBtnHidden) {
      console.log('inside if');
      clearBtn.style.visibility = 'visible';
    } else if (searchInput.value.trim() === '' && !isBtnHidden) {
      console.log('inside else');
      clearBtn.style.visibility = 'hidden';
    }

    debouncedSearch(searchInput.value);
  });
}

function clearSearch() {
  const clearBtn = document.querySelector('.search-bar .close-btn');
  const searchInput = document.getElementById('search-input');
  searchInput.value = '';
  clearBtn.style.visibility = 'hidden';
  loadBooks();
}

function debounce(fn, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
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
  console.log({ bookId });

  let books = storage('session').get('book-list');
  let book = books.find((el) => bookId === el.id);

  console.log(book);

  let wishlist = storage().get('wishlist') || [];

  if (wishlist.some((el) => el.id === bookId)) {
    wishlist = wishlist.filter((el) => el.id !== bookId);
    books = books.map((el) =>
      el.id === bookId ? { ...el, isWishlist: false } : el
    );
    if (book) book.isWishlist = false;
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
