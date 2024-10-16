const booksPerPage = 32; // Number of books per page
let currentPage = 1;
let totalPages = 1; // Total number of pages

function generatePagination(totalCount, page) {
  const paginationContainer = document.getElementById('page-numbers');
  paginationContainer.innerHTML = ''; // Clear the previous pagination numbers

  totalPages = Math.ceil(totalCount / booksPerPage);

  // Create and append page numbers
  for (let i = 1; i <= totalPages; i++) {
    const pageNumber = document.createElement('span');
    pageNumber.classList.add('page-number');
    pageNumber.textContent = i;

    // Highlight the active page number
    if (i === page) {
      pageNumber.classList.add('active');
    }

    pageNumber.addEventListener('click', () => {
      currentPage = i;
      displayBooks(currentPage);
      generatePagination(currentPage); // Update the pagination
    });

    paginationContainer.appendChild(pageNumber);
  }
}

function setupPaginationButtons() {
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');

  prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      displayBooks(currentPage);
      generatePagination(currentPage);
    }
  });

  nextBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      displayBooks(currentPage);
      generatePagination(currentPage);
    }
  });
}
