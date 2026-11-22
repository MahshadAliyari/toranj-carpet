"use strict";

// انتخاب عناصر صفحه
const $ = selector => document.querySelector(selector);
const $$ = selector => document.querySelectorAll(selector);

// آدرس API
const API_URL = "https://fakestoreapi.com/products";
const CART_KEY = "farshIranCart";

// عناصر اصلی
const productsGrid = $("#productsGrid");
const productsCount = $("#productsCount");
const searchInput = $("#searchInput");

// اطلاعات محصولات فروشگاه
const rugCatalog = [
  {
    id: 1,
    title: "فرش دستباف طرح لچک ترنج",
    category: "فرش دستباف",
    price: 28500000,
    color: "قرمز",
    image: "assets/images/farsh-1.jpg"
  },
  {
    id: 2,
    title: "فرش ماشینی طرح افشان",
    category: "فرش ماشینی",
    price: 8500000,
    color: "کرم",
    image: "assets/images/farsh-2.jpg"
  },
  {
    id: 3,
    title: "فرش کلاسیک طرح شاه‌عباسی",
    category: "فرش کلاسیک",
    price: 17200000,
    color: "سرمه‌ای",
    image: "assets/images/farsh-3.jpg"
  },
  {
    id: 4,
    title: "فرش مدرن طرح مینیمال",
    category: "فرش مدرن",
    price: 6900000,
    color: "طوسی",
    image: "assets/images/farsh-4.jpg"
  },
  {
    id: 5,
    title: "فرش دستباف طرح تبریز",
    category: "فرش دستباف",
    price: 42000000,
    color: "قرمز",
    image: "assets/images/farsh-5.jpg"
  },
  {
    id: 6,
    title: "فرش کلاسیک طرح ترنج",
    category: "فرش کلاسیک",
    price: 19800000,
    color: "قهوه‌ای",
    image: "assets/images/farsh-6.jpg"
  },
  {
    id: 7,
    title: "فرش مدرن مینیمال",
    category: "فرش مدرن",
    price: 7600000,
    color: "طوسی",
    image: "assets/images/farsh-4.jpg"
  },
  {
    id: 8,
    title: "فرش لاکی گل‌ریز",
    category: "فرش کلاسیک",
    price: 16200000,
    color: "قرمز",
    image: "assets/images/farsh-2.jpg"
  }
];

let products = [];
let activeCategory = "all";
let activeColor = "all";
let searchTerm = "";
let cart = [];

// بازیابی سبد خرید از localStorage
try {
  const saved = JSON.parse(localStorage.getItem(CART_KEY));
  cart = Array.isArray(saved) ? saved : [];
} catch {
  cart = [];
}

// تبدیل قیمت به قالب فارسی
const formatPrice = value =>
  `${new Intl.NumberFormat("fa-IR").format(value)} تومان`;

const faNumber = value =>
  new Intl.NumberFormat("fa-IR").format(value);

// ذخیره سبد خرید
function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// دریافت اطلاعات API و نمایش کاتالوگ فرش
async function loadProducts() {
  productsGrid.innerHTML =
    '<p class="loading-message">در حال آماده‌سازی مجموعه فرش‌ها...</p>';

  productsCount.textContent = "در حال بارگذاری";

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("API request failed");
    }

    const apiItems = await response.json();

    // اطلاعات واقعی فروشگاه از کاتالوگ محلی گرفته می‌شود.
    products = rugCatalog.map((rug, index) => ({
      ...rug,
      apiId: apiItems[index]?.id ?? null
    }));

  } catch (error) {
    console.warn(
      "API در دسترس نیست؛ کاتالوگ محلی نمایش داده می‌شود.",
      error
    );

    products = rugCatalog.map(rug => ({
      ...rug,
      apiId: null
    }));
  }

  renderProducts();
}

// فیلتر محصولات
function getFilteredProducts() {
  return products.filter(product => {

    const matchesSearch =
      `${product.title} ${product.category}`
        .toLocaleLowerCase("fa")
        .includes(searchTerm);

    const matchesCategory =
      activeCategory === "all" ||
      product.category === activeCategory;

    const matchesColor =
      activeColor === "all" ||
      product.color === activeColor;

    return matchesSearch && matchesCategory && matchesColor;
  });
}

// نمایش محصولات
function renderProducts() {
  const items = getFilteredProducts();

  productsGrid.innerHTML = "";

  productsCount.textContent =
    `${faNumber(items.length)} محصول`;

  if (!items.length) {
    productsGrid.innerHTML =
      '<p class="error-message">محصولی با این مشخصات پیدا نشد.</p>';
    return;
  }

  items.forEach(product => {

    const card = document.createElement("article");
    card.className = "product-card";

    const imageBox = document.createElement("div");
    imageBox.className = "product-image";

    const image = document.createElement("img");
    image.src = product.image;
    image.alt = product.title;
    image.loading = "lazy";

    image.addEventListener("error", () => {
      image.remove();
      imageBox.classList.add("image-missing");
      imageBox.setAttribute(
        "aria-label",
        "تصویر محصول در دسترس نیست"
      );
    }, { once: true });

    imageBox.append(image);

    const info = document.createElement("div");
    info.className = "product-info";

    const category = document.createElement("span");
    category.className = "product-category";
    category.textContent = product.category;

    const title = document.createElement("h3");
    title.textContent = product.title;

    const price = document.createElement("strong");
    price.className = "product-price";
    price.textContent = formatPrice(product.price);

    const add = document.createElement("button");
    add.type = "button";
    add.className = "add-to-cart";
    add.dataset.id = product.id;
    add.textContent = "افزودن به سبد خرید";

    info.append(category, title, price, add);
    card.append(imageBox, info);

    productsGrid.append(card);
  });
}

// جستجوی محصولات
searchInput.addEventListener("input", event => {
  searchTerm = event.target.value
    .trim()
    .toLocaleLowerCase("fa");

  renderProducts();
});

// انتخاب دسته‌بندی
function setCategory(category) {
  activeCategory = category;

  $$(".filter-chip").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.filterCategory === category
    );
  });

  renderProducts();
}

// انتخاب رنگ
function setColor(color) {
  activeColor = color;

  $$(".color-option").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.filterColor === color
    );
  });

  renderProducts();
}

// رویداد فیلتر دسته‌بندی
$$(".filter-chip").forEach(button => {
  button.addEventListener("click", () => {
    setCategory(button.dataset.filterCategory);
  });
});

// رویداد فیلتر رنگ
$$(".color-option").forEach(button => {
  button.addEventListener("click", () => {
    setColor(button.dataset.filterColor);
  });
});

// کلیک روی کارت دسته‌بندی
$$(".category-card").forEach(button => {
  button.addEventListener("click", () => {
    setCategory(button.dataset.category);

    $("#products").scrollIntoView({
      behavior: "smooth"
    });
  });
});

// افزودن محصول به سبد خرید
productsGrid.addEventListener("click", event => {

  const button = event.target.closest(".add-to-cart");

  if (!button) return;

  addToCart(Number(button.dataset.id));

  const previous = button.textContent;

  button.textContent = "اضافه شد ✓";
  button.disabled = true;

  setTimeout(() => {
    button.textContent = previous;
    button.disabled = false;
  }, 850);
});

// منطق افزودن به سبد خرید
function addToCart(id) {

  const product = products.find(item => item.id === id);

  if (!product) return;

  const existing = cart.find(item => item.id === id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      quantity: 1
    });
  }

  saveCart();
  renderCart();
}

// عناصر سبد خرید
const cartOverlay = $("#cartOverlay");
const cartItems = $("#cartItems");
const cartCount = $("#cartCount");
const cartTotal = $("#cartTotal");

// نمایش سبد خرید
function renderCart() {

  cartItems.innerHTML = "";

  if (!cart.length) {
    cartItems.innerHTML = `
      <p class="cart-empty">
        سبد خرید شما هنوز خالی است.
        <br>
        از میان فرش‌های زیبای ما انتخاب کنید.
      </p>
    `;
  }

  cart.forEach(item => {

    const row = document.createElement("div");
    row.className = "cart-item";

    const image = document.createElement("img");
    image.src = item.image;
    image.alt = item.title;

    image.addEventListener("error", () => {
      image.remove();
    }, { once: true });

    const info = document.createElement("div");
    info.className = "cart-item-info";

    const title = document.createElement("h4");
    title.textContent = item.title;

    const details = document.createElement("p");
    details.textContent =
      `${formatPrice(item.price)} × ${faNumber(item.quantity)}`;

    info.append(title, details);

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "remove-item";
    remove.dataset.id = item.id;
    remove.textContent = "حذف";

    row.append(image, info, remove);
    cartItems.append(row);
  });

  const quantity = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  cartCount.textContent = faNumber(quantity);
  cartTotal.textContent = formatPrice(total);
}

// حذف محصول از سبد خرید
cartItems.addEventListener("click", event => {

  const button = event.target.closest(".remove-item");

  if (!button) return;

  cart = cart.filter(
    item => item.id !== Number(button.dataset.id)
  );

  saveCart();
  renderCart();
});

// باز کردن سبد خرید
function openCart() {
  cartOverlay.classList.add("active");
  cartOverlay.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

// بستن سبد خرید
function closeCart() {
  cartOverlay.classList.remove("active");
  cartOverlay.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

$("#cartButton").addEventListener("click", openCart);
$("#closeCart").addEventListener("click", closeCart);

cartOverlay.addEventListener("click", event => {
  if (event.target === cartOverlay) {
    closeCart();
  }
});

// منوی موبایل
const menuToggle = $("#menuToggle");
const mainNav = $("#mainNav");

menuToggle.addEventListener("click", () => {

  const opened = mainNav.classList.toggle("active");

  menuToggle.setAttribute(
    "aria-expanded",
    String(opened)
  );
});

// بستن منو پس از انتخاب لینک
$$(".nav a").forEach(link => {

  link.addEventListener("click", () => {

    mainNav.classList.remove("active");

    menuToggle.setAttribute(
      "aria-expanded",
      "false"
    );
  });
});

// فرم تماس - حالت نمایشی
$("#contactForm").addEventListener("submit", event => {

  event.preventDefault();

  const form = event.currentTarget;

  if (!form.reportValidity()) return;

  $("#contactFeedback").textContent =
    "پیام شما در این نمونه ثبت شد. برای ارسال واقعی باید فرم به سرور متصل شود.";

  form.reset();
});

// ورود و ثبت‌نام
const authOverlay = $("#authOverlay");
const authFeedback = $("#authFeedback");

// باز کردن پنجره ورود
function openAuth() {

  authOverlay.classList.add("active");

  authOverlay.setAttribute("aria-hidden", "false");

  document.body.style.overflow = "hidden";

  authFeedback.textContent = "";
}

// بستن پنجره ورود
function closeAuth() {

  authOverlay.classList.remove("active");

  authOverlay.setAttribute("aria-hidden", "true");

  document.body.style.overflow = "";
}

$("#authButton").addEventListener("click", openAuth);
$("#authClose").addEventListener("click", closeAuth);

authOverlay.addEventListener("click", event => {

  if (event.target === authOverlay) {
    closeAuth();
  }
});

// تغییر تب ورود و ثبت‌نام
$$(".auth-tab").forEach(tab => {

  tab.addEventListener("click", () => {

    const register = tab.dataset.auth === "register";

    $$(".auth-tab").forEach(item => {
      item.classList.toggle("active", item === tab);
    });

    $("#loginForm").hidden = register;
    $("#registerForm").hidden = !register;

    authFeedback.textContent = "";
  });
});

// ارسال فرم ورود - حالت نمایشی
$("#loginForm").addEventListener("submit", event => {

  event.preventDefault();

  if (!event.currentTarget.reportValidity()) return;

  authFeedback.textContent =
  "خوش آمدید."
});

// ارسال فرم ثبت‌نام - حالت نمایشی
$("#registerForm").addEventListener("submit", event => {

  event.preventDefault();

  if (!event.currentTarget.reportValidity()) return;

  authFeedback.textContent =
  "ثبت نام شما با موفقیت انجام شد."
});

// بستن پنجره‌ها با کلید Escape
document.addEventListener("keydown", event => {

  if (event.key === "Escape") {

    closeCart();
    closeAuth();

    mainNav.classList.remove("active");

    menuToggle.setAttribute(
      "aria-expanded",
      "false"
    );
  }
});

// اجرای اولیه
renderCart();
loadProducts();