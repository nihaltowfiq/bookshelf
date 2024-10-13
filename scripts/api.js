const apiBaseUrl = 'https://gutendex.com/books';

async function fetchBooks(page = 1, searchTerm = '', genre = '') {
  let url = `${apiBaseUrl}/?page=${page}`;
  if (searchTerm) url += `&search=${searchTerm}`;
  if (genre) url += `&topic=${genre}`;

  const response = await fetch(url);
  const data = await response.json();
  console.log(data);

  return data;
}

// export { fetchBooks };
