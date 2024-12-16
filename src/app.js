// Fungsi format Rupiah (Global)
function rupiah(number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
}
document.addEventListener("alpine:init", () => {
  Alpine.data("products", () => ({
    items: [
      { id: 1, name: "Bali Surfer Papan Selancar", img: "6.jpg", price: 30000 },
      { id: 2, name: "Braven wood", img: "1.jpg", price: 40000 },
      { id: 3, name: "Senoparty", img: "3.jpg", price: 100000 },
    ],
  }));

  Alpine.store("cart", {
    items: [],
    total: 0,
    quantity: 0,
    discount: 0, // Potongan harga
    delivery: 0, // Biaya pengiriman

    add(newItem) {
      const cartItem = this.items.find((item) => item.id === newItem.id);

      if (!cartItem) {
        this.items.push({ ...newItem, quantity: 1, total: newItem.price });
      } else {
        cartItem.quantity++;
        cartItem.total = cartItem.price * cartItem.quantity;
      }
      this.updateTotals();
    },

    remove(itemId) {
      const cartItem = this.items.find((item) => item.id === itemId);
      if (cartItem) {
        cartItem.quantity--;
        if (cartItem.quantity === 0) {
          this.items = this.items.filter((item) => item.id !== itemId);
        } else {
          cartItem.total = cartItem.price * cartItem.quantity;
        }
      }
      this.updateTotals();
    },

    applyDiscount(code) {
      if (code === "DISKON20K") {
        this.discount = 20000; // Diskon tetap 20.000
      } else {
        this.discount = 0; // Jika kode tidak valid, diskon di-reset
      }
      console.log("Subtotal sebelum diskon:", this.calculateSubtotal());
      console.log("Diskon diterapkan:", this.discount);
      this.updateTotals();
    },

    setDelivery(fee) {
      this.delivery = fee; // Biaya pengiriman
      this.updateTotals();
    },

    calculateSubtotal() {
      return this.items.reduce((sum, item) => sum + item.total, 0);
    },

    updateTotals() {
      this.total = this.calculateSubtotal() - this.discount + this.delivery;
      console.log("Total setelah diskon:", this.total);
      this.quantity = this.items.reduce((sum, item) => sum + item.quantity, 0);
    },
  });
});

const discountInput = document.getElementById("discountInput");
const applyDiscountButton = document.getElementById("applyDiscountButton");

applyDiscountButton.addEventListener("click", (e) => {
  e.preventDefault(); // Mencegah aksi default tombol (misalnya submit form)
  const discountCode = discountInput.value; // Ambil kode diskon dari input
  Alpine.store("cart").applyDiscount(discountCode);
});

const form = document.querySelector("#checkoutForm");
const checkoutButton = document.querySelector("#checkout-button");

// Fungsi validasi
function validateForm() {
  let isValid = true;

  for (let i = 0; i < form.elements.length; i++) {
    const field = form.elements[i];
    if (field.type !== "button" && field.type !== "submit" && field.id !== "applyDiscountButton" && field.value.trim() === "") {
      isValid = false;
      break;
    }
  }

  // Aktifkan/Nonaktifkan tombol checkout
  if (isValid) {
    checkoutButton.disabled = false;
    checkoutButton.classList.remove("disabled");
  } else {
    checkoutButton.disabled = true;
    checkoutButton.classList.add("disabled");
  }
}

// Event listener
form.addEventListener("input", validateForm);
form.addEventListener("change", validateForm);

// Event khusus untuk input Phone
const phoneInput = document.querySelector("#phone");
phoneInput.addEventListener("input", validateForm);

// Event untuk deliveryOption
const deliveryOption = document.getElementById("deliveryOption");
deliveryOption.addEventListener("change", validateForm);

// Kirim data ketika tombol checkout diklik
checkoutButton.addEventListener("click", async function (e) {
  e.preventDefault();

  // Ambil data dari form
  const formData = new FormData(form);
  const cart = Alpine.store("cart");

  // Gunakan JSON.stringify dan JSON.parse untuk menghilangkan Proxy
  formData.append("total", cart.total); // Total setelah diskon
  formData.append("items", JSON.stringify(JSON.parse(JSON.stringify(cart.items)))); // Detail item yang sudah diubah menjadi objek biasa

  console.log("Total yang dikirim ke backend:", cart.total);
  console.log("Items yang dikirim ke backend:", cart.items);

  try {
    const response = await fetch("php/placeOrder.php", {
      method: "POST",
      body: formData,
    });
    const token = await response.text();
    console.log("Snap Token:", token);
    window.snap.pay(token);
  } catch (err) {
    console.error("Error:", err.message);
  }
});
//format pesan rupiah
const formatMessage = (obj) => {
  return `Data Customer
  Nama: ${obj.name}
  Email: ${obj.email}
  No HP: ${(obj, phone)}
Data Pesanan
  &{JSON.parse(obj.items).map((item) => '${item.name} (${item.quantity} x ${rupiah(item.total)}) \n')}
  TOTAL: ${rupiah(obj.total)}
  Terimakasih.`;
};

console.log("Total dikirim:", Alpine.store("cart").total);
console.log("Items dikirim:", Alpine.store("cart").items);
