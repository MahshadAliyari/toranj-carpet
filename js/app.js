
/* =========================================
   FARSH IRAN — APP.JS
========================================= */

const API_URL = "https://fakestoreapi.com/products";
const CART_KEY = "farshIranCartV2";

// ---------- 1. انتخاب عناصر HTML ----------

const productsGrid = document.getElementById("productsGrid");
const searchInput = document.getElementById("searchInput");
const productsCount = document.getElementById("productsCount");

const cartButton = document.getElementById("cartButton");
const cartOverlay = document.getElementById("cartOverlay");
const closeCart = document.getElementById("closeCart");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");

const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");

// ---------- 2. اطلاعات نمایشی فرش‌ها ----------
// عکس‌ها را بعداً در پوشه images قرار بده.

const rugCatalog = [
  {
    title: "فرش دستباف ترنج لاکی",
    category: "فرش دستباف",
    price: 18500000,
    image: "assets/images/farsh-7.jpg"
  },
  {
    title: "فرش زمینه کرم گل ابریشم",
    category: "فرش دستباف",
    price: 22000000,
    image: "assets/images/farsh-8.jpg"
  },
  {
    title: "فرش شاه‌عباسی سرمه‌ای",
    category: "فرش کلاسیک",
    price: 14800000,
    image: "assets/images/farsh-5.jpg"
  },
  {
    title: "فرش طرح بته‌جقه",
    category: "فرش کلاسیک",
    price: 12500000,
    image: "assets/images/farsh-3.jpg"
  },
  {
    title: "فرش افشان گل‌دار",
    category: "فرش ماشینی",
    price: 8900000,
    image: "assets/images/farsh-1.jpg"
  },
  {
    title: "فرش طرح خشتی",
    category: "فرش دستباف",
    price: 19800000,
    image: "assets/images/farsh-6.jpg"
  },
  {
    title: "فرش مدرن مینیمال",
    category: "فرش مدرن",
    price: 7600000,
    image: "assets/images/farsh-4.jpg"
  },
  {
    title: "فرش لاکی گل‌ریز",
    category: "فرش کلاسیک",
    price: 16200000,
    image: "assets/images/farsh-2.jpg"
  }
];

// ---------- 3. متغیرهای برنامه ----------

let products = [];

let cart = [];

try {
  const savedCart = JSON.parse(localStorage.getItem(CART_KEY));
  cart = Array.isArray(savedCart) ? savedCart : [];
} catch (error) {
  cart = [];
}

// ---------- 4. ابزارهای کمکی ----------

function formatPrice(price) {
  return new Intl.NumberFormat("fa-IR").format(price) + " تومان";
}

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// ---------- 5. دریافت اطلاعات از API ----------

async function getProducts() {
  productsGrid.innerHTML = "<p>در حال آماده‌سازی مجموعه فرش‌ها...</p>";
  productsCount.textContent = "در حال بارگذاری";

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("دریافت اطلاعات از سرور ناموفق بود.");
    }

    const apiProducts = await response.json();

    // API فقط برای دریافت داده و شناسه‌های نمونه استفاده می‌شود.
    // مشخصات و قیمت فرش‌ها از کاتالوگ محلی پروژه می‌آیند.

    products = rugCatalog.map((rug, index) => ({
      ...rug,
      id: apiProducts[index]?.id ?? index + 1
    }));

    renderProducts(products);

  } catch (error) {
    console.error("خطا در دریافت محصولات:", error);

    productsGrid.innerHTML = `
      <p class="error-message">
        دریافت اطلاعات با مشکل روبه‌رو شد.
        <br>
        اتصال اینترنت را بررسی کن و دوباره تلاش کن.
        <button class="retry-button" id="retryButton">
          تلاش دوباره
        </button>
      </p>
    `;

    productsCount.textContent = "خطا در بارگذاری";
  }
}

// ---------- 6. نمایش کارت محصولات ----------

function renderProducts(items) {
  productsGrid.innerHTML = "";

  if (items.length === 0) {
    productsGrid.innerHTML = `
      <p class="error-message">
        محصولی با این مشخصات پیدا نشد.
      </p>
    `;

    productsCount.textContent = "۰ محصول";
    return;
  }

  items.forEach((product) => {
    const card = document.createElement("article");
    card.className = "product-card";

    const imageBox = document.createElement("div");
    imageBox.className = "product-image";

    const image = document.createElement("img");
    image.src = product.image;
    image.alt = product.title;
    image.loading = "lazy";

    image.addEventListener("error", () => {
      image.style.display = "none";
      imageBox.classList.add("image-missing");
    });

    imageBox.appendChild(image);

    const info = document.createElement("div");
    info.className = "product-info";

    const category = document.createElement("span");
    category.className = "product-category";
    category.textContent = product.category;

    const title = document.createElement("h3");
    title.textContent = product.title;

    const price = document.createElement("span");
    price.className = "product-price";
    price.textContent = formatPrice(product.price);

    const addButton = document.createElement("button");
    addButton.className = "add-to-cart";
    addButton.type = "button";
    addButton.dataset.id = product.id;
    addButton.textContent = "افزودن به سبد خرید";

    info.append(category, title, price, addButton);
    card.append(imageBox, info);

    productsGrid.appendChild(card);
  });

  productsCount.textContent =
    `${new Intl.NumberFormat("fa-IR").format(items.length)} محصول`;
}

// ---------- 7. جستجوی محصولات ----------

searchInput.addEventListener("input", (event) => {
  const searchValue = event.target.value.trim().toLowerCase();

  const filteredProducts = products.filter((product) => {
    return (
      product.title.toLowerCase().includes(searchValue) ||
      product.category.toLowerCase().includes(searchValue)
    );
  });

  renderProducts(filteredProducts);
});

// ---------- 8. تلاش دوباره برای دریافت محصولات ----------

productsGrid.addEventListener("click", (event) => {
  if (event.target.id === "retryButton") {
    getProducts();
  }
});

// ---------- 9. افزودن محصول به سبد خرید ----------

productsGrid.addEventListener("click", (event) => {
  const button = event.target.closest(".add-to-cart");

  if (!button) return;

  const productId = Number(button.dataset.id);
  addToCart(productId);

  const originalText = button.textContent;
  button.textContent = "به سبد اضافه شد ✓";

  setTimeout(() => {
    button.textContent = originalText;
  }, 1000);
});

function addToCart(productId) {
  const product = products.find((item) => item.id === productId);

  if (!product) return;

  const existingItem = cart.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      category: product.category,
      price: product.price,
      image: product.image,
      quantity: 1
    });
  }

  saveCart();
  renderCart();
}

// ---------- 10. نمایش سبد خرید ----------

function renderCart() {
  cartItems.innerHTML = "";

  if (cart.length === 0) {
    cartItems.innerHTML = `
      <p class="cart-empty">
        سبد خرید شما هنوز خالی است.
        <br>
        از میان فرش‌های زیبای ما انتخاب کنید.
      </p>
    `;
  }

  cart.forEach((item) => {
    const row = document.createElement("div");
    row.className = "cart-item";

    const image = document.createElement("img");
    image.src = item.image;
    image.alt = item.title;

    image.addEventListener("error", () => {
      image.style.visibility = "hidden";
    });

    const info = document.createElement("div");
    info.className = "cart-item-info";

    const title = document.createElement("h4");
    title.textContent = item.title;

    const details = document.createElement("p");
    details.textContent =
      `${formatPrice(item.price)} × ${new Intl.NumberFormat("fa-IR").format(item.quantity)}`;

    const removeButton = document.createElement("button");
    removeButton.className = "remove-item";
    removeButton.type = "button";
    removeButton.dataset.id = item.id;
    removeButton.textContent = "حذف";

    info.append(title, details);
    row.append(image, info, removeButton);

    cartItems.appendChild(row);
  });

  updateCartSummary();
}

// ---------- 11. محاسبه تعداد و مبلغ سبد ----------

function updateCartSummary() {
  const totalQuantity = cart.reduce((sum, item) => {
    return sum + item.quantity;
  }, 0);

  const totalPrice = cart.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);

  cartCount.textContent = new Intl.NumberFormat("fa-IR").format(totalQuantity);
  cartTotal.textContent = formatPrice(totalPrice);
}

// ---------- 12. حذف محصول از سبد خرید ----------

cartItems.addEventListener("click", (event) => {
  const button = event.target.closest(".remove-item");

  if (!button) return;

  const productId = Number(button.dataset.id);

  cart = cart.filter((item) => item.id !== productId);

  saveCart();
  renderCart();
});

// ---------- 13. باز و بسته کردن سبد خرید ----------

function openCart() {
  cartOverlay.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeCartDrawer() {
  cartOverlay.classList.remove("active");
  document.body.style.overflow = "";
}

cartButton.addEventListener("click", openCart);
closeCart.addEventListener("click", closeCartDrawer);

cartOverlay.addEventListener("click", (event) => {
  if (event.target === cartOverlay) {
    closeCartDrawer();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeCartDrawer();
  }
});

// ---------- 14. منوی موبایل ----------

menuToggle.addEventListener("click", () => {
  mainNav.classList.toggle("active");
  menuToggle.classList.toggle("active");

  const isOpen = mainNav.classList.contains("active");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

mainNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("active");
    menuToggle.classList.remove("active");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

// ---------- 15. اجرای اولیه ----------

renderCart();
getProducts();
