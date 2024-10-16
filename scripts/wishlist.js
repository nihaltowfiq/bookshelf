document.addEventListener('DOMContentLoaded', () => {
  const wishlist = storage().get('wishlist');

  displayBooks(wishlist);
});
