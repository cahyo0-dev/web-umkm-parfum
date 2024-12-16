// Ambil semua tombol detail produk
const detailButtons = document.querySelectorAll('.item-detail-button');

// Ambil modal dan elemen-elemen di dalamnya
const modal = document.querySelector('#item-detail-modal');
const modalImage = modal.querySelector('img');
const modalTitle = modal.querySelector('h3');
const modalDescription = modal.querySelector('p');
const modalStars = modal.querySelector('.product-stars');
const modalPrice = modal.querySelector('.product-price');

// Fungsi untuk menampilkan modal
function openModal(product) {
  // Update konten modal dengan data dari kartu produk
  const productImage = product.querySelector('.product-image img');
  const productTitle = product.querySelector('.product-content h3');
  const productStars = product.querySelector('.product-stars');
  const productPrice = product.querySelector('.product-price');

  modalImage.src = productImage.src;
  modalImage.alt = productImage.alt;
  modalTitle.textContent = productTitle.textContent;
  modalDescription.textContent = 'Deskripsi detail produk bisa dimasukkan di sini.';
  modalStars.innerHTML = productStars.innerHTML; // Salin bintang
  modalPrice.innerHTML = productPrice.innerHTML; // Salin harga

  // Tampilkan modal
  modal.classList.add('active');
}

// Fungsi untuk menutup modal
function closeModal() {
  modal.classList.remove('active');
}

// Tambahkan event listener pada setiap tombol
detailButtons.forEach((button) => {
  button.addEventListener('click', (e) => {
    e.preventDefault();
    const productCard = button.closest('.product-card');
    openModal(productCard);
  });
});

// Event listener untuk menutup modal
const closeIcon = modal.querySelector('.close-icon');
closeIcon.addEventListener('click', (e) => {
  e.preventDefault();
  closeModal();
});
