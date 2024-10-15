const apiBaseUrl = 'https://gutendex.com/books';

async function fetchBooks(page = 1, searchTerm = '', genre = '') {
  let url = `${apiBaseUrl}/?page=${page}`;
  if (searchTerm) url += `&search=${searchTerm}`;
  if (genre) url += `&topic=${genre}`;

  try {
    console.log('api loading...');

    loader().on();
    const response = await fetch(url);
    if (!response.ok) throw Error(response.error);
    const data = await response.json();
    console.log(data);

    return data;
  } catch (error) {
    console.log(error);
  } finally {
    console.log('api loaded...');
    loader().off();
  }
}

function loader() {
  const element = document.getElementById('loader');
  return {
    on: function () {
      element.style.display = 'block';
    },
    off: function () {
      element.style.display = 'none';
    },
  };
}
