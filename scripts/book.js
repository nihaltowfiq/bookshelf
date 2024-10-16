document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('book');

  loadBook();
});

async function loadBook(bookId) {
  const data = await fetchBooks({ id: bookId });
  console.log(data);
}
