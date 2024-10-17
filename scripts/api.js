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
