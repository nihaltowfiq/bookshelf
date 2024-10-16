function displayBooks(books) {
  const bookList = document.getElementById('book-list');
  bookList.innerHTML = '';

  books.forEach((book) => {
    const bookCard = document.createElement('div');
    bookCard.classList.add('book-card');
    bookCard.innerHTML = `
      <div class="img-wrapper">
        <img src="${book.formats['image/jpeg']}" alt="${book.title}">
        <button title="Wishlist" class="wishlist" onclick="toggleWishlist(${
          book.id
        })">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="18" width="18" fill="red"><path d="${
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

      <p class="author"><span>Author:</span> ${book.authors
        .map((a) => a.name)
        .join(', ')}</p>
      
    `;
    bookList.appendChild(bookCard);
  });
}

function displayGenres(genres) {
  const genreFilter = document.getElementById('genre-filter');
  genres.forEach((genre) => {
    const option = document.createElement('option');
    option.value = genre;
    option.textContent = genre;
    genreFilter.appendChild(option);
  });
}

function loadBookDetails(book) {
  const bookDetails = document.getElementById('book-details');

  console.log(book);

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
                <span class="title">Bookshelves: </span>
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

  // ${
  //   bookshelves && (
  //     <p class="book-bookshelves">Bookshelves: ${bookshelves.join(', ')}</p>
  //   )
  // }

  bookDetails.innerHTML = html;

  const bookCover = document.getElementById('book-cover');
  bookCover.src = book.formats['image/jpeg'];

  const linksContainer = document.getElementById('book-links');
  Object.entries(book.formats).forEach(([type, url]) => {
    const link = document.createElement('a');
    link.href = url;
    link.textContent = `Download ${type}`;
    link.target = '_blank';
    linksContainer.appendChild(link);
  });
}
