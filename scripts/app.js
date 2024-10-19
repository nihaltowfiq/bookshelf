const query = storage('session').get('query') || {};

const perPage = 32;
let totalPage = 1;
let currentSearch = query?.search ?? '';
let currentFilter = query?.filter ?? '';
let currentPage = query?.page ?? 1;

const filterData = [
  'Art',
  'Fiction',
  'Poetry',
  'Horror',
  'Politics',
  'Philosophy',
  'Sociology',
  'Fantasy',
  'Travel',
  'Physics',
  'Music',
  'Technology',
  'Engineering',
  'History',
];

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
    updateQueryOnInterface();
  }

  displayActivePage();
});

function getPage() {
  let pathname = window.location.pathname;
  pathname = pathname.split('/bookshelf')?.[1] || '/'; // only for github-pages deployment

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

async function loadBooks() {
  const data = await fetchBooks({
    page: currentPage,
    search: currentSearch,
    genre: currentFilter,
  });

  if (!data) return;

  const finalData = addWishlistStatus(data?.results);

  totalPage = Math.ceil(data.count / perPage);

  displayBooks(finalData);
  setBookList(finalData);

  // setTimeout: to match with book-list animation
  setTimeout(() => {
    if (data.count > 0) {
      displayPagination(currentPage);
    } else {
      clearPagination();
    }
  }, 700);
}

function addWishlistStatus(data) {
  if (!data) return null;

  const wishlist = storage().get('wishlist');
  const final_data = data.map((el) => ({
    ...el,
    isWishlist: !!wishlist?.some((e) => e.id === el.id),
  }));

  return final_data;
}

function setBookList(data) {
  storage('session').set('book-list', data);
}

function handleSearch() {
  const searchInput = document.getElementById('search-input');

  const debouncedSearch = debounce((value) => {
    currentSearch = value;
    currentPage = 1;
    setQuery('search', value);
    setQuery({ page: 1, search: value });
    loadBooks();
  }, 500);

  searchInput.addEventListener('input', () => {
    const clearBtn = document.querySelector('.search-bar .close-btn');
    const isBtnHidden =
      window.getComputedStyle(clearBtn).visibility === 'hidden';

    if (searchInput.value.trim() !== '' && isBtnHidden) {
      clearBtn.style.visibility = 'visible';
    } else if (searchInput.value.trim() === '' && !isBtnHidden) {
      clearBtn.style.visibility = 'hidden';
    }

    debouncedSearch(searchInput.value);
  });
}

function clearSearch() {
  const clearBtn = document.querySelector('.search-bar .close-btn');
  const searchInput = document.getElementById('search-input');
  searchInput.value = '';
  setQuery({ search: searchInput.value });
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
    const clearBtn = document.querySelector('.filter-bar .close-filter');
    const isBtnHidden =
      window.getComputedStyle(clearBtn).visibility === 'hidden';

    if (filter.value.trim() !== '' && isBtnHidden) {
      clearBtn.style.visibility = 'visible';
    } else if (filter.value.trim() === '' && !isBtnHidden) {
      clearBtn.style.visibility = 'hidden';
    }

    currentFilter = filter.value;
    currentPage = 1;
    setQuery({ page: 1, filter: filter.value });
    loadBooks();
  });
}

function clearFilter() {
  const clearBtn = document.querySelector('.filter-bar .close-filter');
  const filter = document.getElementById('filter');
  filter.value = '';
  setQuery({ filter: filter.value });
  clearBtn.style.visibility = 'hidden';
  loadBooks();
}

function paginationRanges(currentPage, totalPage) {
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
}

function changePage(page) {
  if (page < 1 || page > totalPage) return;
  currentPage = page;
  setQuery({ page });
  scrollToTop();
  loadBooks();
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
}

function toggleWishlist(bookId) {
  let books = storage('session').get('book-list');
  let book = books.find((el) => bookId === el.id);

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
    displayBooks(wishlist, false);
  } else if (getPage() === 'book') {
    displayBookDetails(book);
  } else {
    displayBooks(books, false);
  }
}

function setQuery(queries) {
  const query = storage('session').get('query');

  storage('session').set('query', { ...query, ...queries });
}

function updateQueryOnInterface() {
  const searchInput = document.getElementById('search-input');
  const filter = document.getElementById('filter');

  searchInput.value = currentSearch;
  filter.value = currentFilter;

  if (currentSearch?.trim()?.length > 0) {
    const clearBtn = document.querySelector('.search-bar .close-btn');
    clearBtn.style.visibility = 'visible';
  }
  if (currentFilter?.trim()?.length > 0) {
    const clearBtn = document.querySelector('.filter-bar .close-filter');
    clearBtn.style.visibility = 'visible';
  }
}

function storage(type = 'local') {
  const store = type === 'session' ? sessionStorage : localStorage;

  const setValue = (key, value) => {
    if (!key || !value) return;

    store.setItem(key, JSON.stringify(value));
  };

  const getValue = (key) => {
    if (!key) return;

    const item = store.getItem(key);
    if (item) {
      return JSON.parse(item);
    }
    return null;
  };

  const removeValue = (key) => {
    if (!key) return;

    store.removeItem(key);
  };

  return {
    set: setValue,
    get: getValue,
    remove: removeValue,
  };
}

// API FUNCTIONALITY
const apiBaseUrl = 'https://gutendex.com/books';
let currentAbortController = null;

async function fetchBooks({ page = 1, search = '', genre = '', id = '' }) {
  if (currentAbortController) {
    currentAbortController.abort();
  }

  currentAbortController = new AbortController();
  const { signal } = currentAbortController;

  let url = `${apiBaseUrl}/?page=${page}`;
  if (search) url += `&search=${search}`;
  if (genre) url += `&topic=${genre}`;
  if (id) url += `&ids=${id}`;

  const currentRequest = currentAbortController;

  try {
    console.log('api loading...');
    displayLoader().on();

    const response = await fetch(url, { signal });

    if (!response.ok) throw Error(response.error);

    const data = await response.json();
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Request was aborted');
    } else {
      console.log(error);
      displayError();
    }
  } finally {
    if (currentRequest === currentAbortController) {
      displayLoader().off();
      console.log('api loaded...');
    }
  }
}

// DOM RELATED FUNCTIONALITY
const bookList = document.getElementById('book-list');
const bookDetails = document.getElementById('book-details');
const loader = document.getElementById('loader');
const pagination = document.getElementById('pagination');
const filter = document.getElementById('filter');

function displayBooks(books, animated = true) {
  if (!animated) {
    if (!books?.length) {
      feedback();
    } else {
      bookList.innerHTML = '';
      renderBooks(books, animated);
    }
    return;
  }

  // Fade out the current list of books
  const oldBooks = document.querySelectorAll('.book-card');
  oldBooks.forEach((book) => {
    book.classList.add('fade-out');
    setTimeout(() => {
      book.remove();
    }, 500);
  });

  // Wait for the fade-out animation to complete before adding new books
  setTimeout(() => {
    if (!books?.length) {
      feedback();
    } else {
      renderBooks(books, animated);
    }
  }, 500);
}

function feedback() {
  bookList.innerHTML = `
    <p style="margin:2rem 0; text-align:center; color:var(--primary-light); font-weight:600">
      No books found!
    </p>
  `;
}

function renderBooks(books, animated) {
  books.forEach((book) => {
    const bookCard = document.createElement('div');
    bookCard.classList.add('book-card');
    if (animated) bookCard.classList.add('fade-in');

    bookCard.innerHTML = `
      <div class="img-wrapper">
        <img src="${book.formats['image/jpeg']}" alt="${book.title}">
        <button title="Wishlist" class="wishlist" onclick="toggleWishlist(${
          book.id
        })">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="18" width="18" fill="red">
            <path d="${
              book?.isWishlist
                ? 'M12.001 4.52853C14.35 2.42 17.98 2.49 20.2426 4.75736C22.5053 7.02472 22.583 10.637 20.4786 12.993L11.9999 21.485L3.52138 12.993C1.41705 10.637 1.49571 7.01901 3.75736 4.75736C6.02157 2.49315 9.64519 2.41687 12.001 4.52853Z'
                : 'M12.001 4.52853C14.35 2.42 17.98 2.49 20.2426 4.75736C22.5053 7.02472 22.583 10.637 20.4786 12.993L11.9999 21.485L3.52138 12.993C1.41705 10.637 1.49571 7.01901 3.75736 4.75736C6.02157 2.49315 9.64519 2.41687 12.001 4.52853ZM18.827 6.1701C17.3279 4.66794 14.9076 4.60701 13.337 6.01687L12.0019 7.21524L10.6661 6.01781C9.09098 4.60597 6.67506 4.66808 5.17157 6.17157C3.68183 7.66131 3.60704 10.0473 4.97993 11.6232L11.9999 18.6543L19.0201 11.6232C20.3935 10.0467 20.319 7.66525 18.827 6.1701Z'
            }"></path></svg>
        </button>
        <div class="id">
          <span>ID: </span>
          <span>${book.id}</span>
        </div>
      </div>
      <div class="detail">
        <h4 class="title" title="${book.title}">
          <a href="${`./book.html?book=${book.id}`}">
            ${book.title}
          </a>
        </h4>        
      </div>
      <p class="author">
        <span>Author:</span> 
        ${book.authors.map((a) => a.name).join(', ')}
      </p>      
    `;

    bookList.appendChild(bookCard);
  });
}

function displayFilter(data) {
  data.forEach((el) => {
    const option = document.createElement('option');
    option.value = el;
    option.textContent = el;
    filter.appendChild(option);
  });
}

function displayBookDetails(book) {
  book.isWishlist = storage()
    .get('wishlist')
    ?.some((el) => el.id === book.id);

  const html = `
    <div class="cover">
      <img src="${book.formats['image/jpeg']}" alt="${book.title}" />
    </div>
    <div class="book-info">
      <h2 class="book-title">${book.title}</h2>

      <div class="author-block">
        <p>
          <span class"title">Author: </span> 
          ${book.authors.map((a) => a.name).join(', ')}
        </p>
        <button title="Wishlist" class="wishlist" onclick="toggleWishlist(${
          book.id
        })">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="18" width="18" fill="red"> <path d="${
              book?.isWishlist
                ? 'M12.001 4.52853C14.35 2.42 17.98 2.49 20.2426 4.75736C22.5053 7.02472 22.583 10.637 20.4786 12.993L11.9999 21.485L3.52138 12.993C1.41705 10.637 1.49571 7.01901 3.75736 4.75736C6.02157 2.49315 9.64519 2.41687 12.001 4.52853Z'
                : 'M12.001 4.52853C14.35 2.42 17.98 2.49 20.2426 4.75736C22.5053 7.02472 22.583 10.637 20.4786 12.993L11.9999 21.485L3.52138 12.993C1.41705 10.637 1.49571 7.01901 3.75736 4.75736C6.02157 2.49315 9.64519 2.41687 12.001 4.52853ZM18.827 6.1701C17.3279 4.66794 14.9076 4.60701 13.337 6.01687L12.0019 7.21524L10.6661 6.01781C9.09098 4.60597 6.67506 4.66808 5.17157 6.17157C3.68183 7.66131 3.60704 10.0473 4.97993 11.6232L11.9999 18.6543L19.0201 11.6232C20.3935 10.0467 20.319 7.66525 18.827 6.1701Z'
            }"> </path>
            </svg>
          </button>
      </div>     
      
      ${
        book?.subjects?.length
          ? `<div class="badge-wrapper">
                <span class="title">Subjects: </span>
                <div>
                  ${book.subjects
                    .map((el) => `<span class="badge">${el}</span>`)
                    .join('')}
                </div>
            </div>`
          : ''
      } 

      ${
        book?.bookshelves?.length
          ? `<div class="badge-wrapper">
                <span class="title">Genre: </span>
                <div>
                  ${book.bookshelves
                    .map((el) => `<span class="badge">${el}</span>`)
                    .join('')}
                </div>
            </div>`
          : ''
      } 
        
          
      <p class="book-download-count">
        Total downloads: ${book.download_count} times
      </p>      
    </div>
  `;

  bookDetails.innerHTML = html;
}

function displayLoader() {
  return {
    on: function () {
      loader.style.display = 'block';
    },
    off: function () {
      loader.style.display = 'none';
    },
  };
}

function displayError() {
  bookList.innerHTML = `
        <p style="margin:2rem 0; text-align:center; color:var(--primary-light); font-weight:600">
          Something went wrong!
        </p>
      `;
}

function displayPagination(currentPage) {
  pagination.innerHTML = '';

  const prevLi = document.createElement('li');
  prevLi.innerText = 'Prev';
  prevLi.className = currentPage === 1 ? 'disabled' : '';
  prevLi.addEventListener('click', () => changePage(currentPage - 1));
  pagination.appendChild(prevLi);

  const pages = paginationRanges(currentPage, totalPage);
  pages.forEach((page) => {
    const li = document.createElement('li');
    li.innerText = page;
    li.className = page === currentPage ? 'active' : '';
    if (page !== '...') {
      li.addEventListener('click', () => changePage(page));
    } else {
      li.classList.add('not-clickable');
    }

    pagination.appendChild(li);
  });

  const nextLi = document.createElement('li');
  nextLi.innerText = 'Next';
  nextLi.className = currentPage === totalPage ? 'disabled' : '';
  nextLi.addEventListener('click', () => changePage(currentPage + 1));
  pagination.appendChild(nextLi);
}

function clearPagination() {
  pagination.innerHTML = '';
}
