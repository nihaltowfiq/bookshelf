document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('book');

  getBook(id);
});

async function getBook(bookId) {
  // const data = await fetchBooks({ id: bookId });

  loadBookDetails(mock_data?.['results']?.[0]);
}
