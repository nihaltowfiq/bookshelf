const perPage = 32;
let currentSearch = '';
let currentGenre = '';
let currentPage = 1;
let totalPage = 1;

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
    handleGenreFilter();
    displayFilter(filterData);
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

  displayBookDetails(data?.['results']?.[0]);
}

async function loadBooks(page = currentPage, search = currentSearch, genre) {
  const data = await fetchBooks({ page, search, genre });

  if (!data) return;

  const finalData = getFinalData(data?.results);

  totalPage = Math.ceil(data.count / perPage);

  displayBooks(finalData);
  storeBook(finalData);

  if (data.count > 0) {
    displayPagination(page);
  } else {
    clearPagination();
  }
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

  const debouncedSearch = debounce((value) => {
    loadBooks(1, value);
  }, 500);

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

function handleGenreFilter() {
  const filter = document.getElementById('filter');
  filter.addEventListener('change', () => {
    loadBooks(1, '', filter.value);
  });
}

const paginationRanges = (currentPage, totalPage) => {
  const rangeWithDots = [];

  // If total pages are 5 or less, return the full range
  if (totalPage <= 5) {
    for (let i = 1; i <= totalPage; i++) {
      rangeWithDots.push(i);
    }
  } else {
    // Total pages greater than 5
    if (currentPage <= 3) {
      // Show first 3 pages, ..., last page
      rangeWithDots.push(1, 2, 3, '...', totalPage);
    } else if (currentPage >= totalPage - 2) {
      // Show first page, ..., last 3 pages
      rangeWithDots.push(1, '...', totalPage - 2, totalPage - 1, totalPage);
    } else {
      // Show first page, ..., current-1, current, current+1, ..., last page
      rangeWithDots.push(
        1,
        '...',
        currentPage - 1,
        currentPage,
        currentPage + 1,
        '...',
        totalPage
      );
    }
  }

  return rangeWithDots;
};

const changePage = (page) => {
  if (page < 1 || page > totalPage) return;
  currentPage = page;
  loadBooks(page);
};

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
