"use strict";

const $ = selector => document.querySelector(selector);
const $$ = selector => document.querySelectorAll(selector);

// افزودن رویداد فقط اگر المنت در صفحه وجود داشته باشد
const on = (element, eventName, handler, options) => {
  if (element) element.addEventListener(eventName, handler, options);
};

const CART_KEY = "farshIranCart";

// یکسان‌سازی نگارش فارسی (ي/ی، ك/ک، نیم‌فاصله) برای جستجو و فیلتر
const normalize = text =>
  String(text ?? "")
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/\u200c/g, " ")
    .trim()
    .toLocaleLowerCase("fa");

const faNumber = value =>
  new Intl.NumberFormat("fa-IR").format(value);

const formatPrice = value => `${faNumber(value)} تومان`;

// ---------------------------------------------------------------
// عناصر اصلی
// ---------------------------------------------------------------
const productsGrid = $("#productsGrid");
const productsCount = $("#productsCount");
const searchInput = $("#searchInput");

// ---------------------------------------------------------------
// کاتالوگ محصولات
// ---------------------------------------------------------------
const rugCatalog = [
  {
    id: 1,
    title: "فرش دستباف طرح لچک ترنج",
    category: "فرش دستباف",
    price: 28500000,
    color: "کرم",
    image: "assets/images/farsh-1.webp"
  },
  {
    id: 2,
    title: "فرش ماشینی طرح افشان",
    category: "فرش ماشینی",
    price: 8500000,
    color: "سرمه ای",
    image: "assets/images/farsh-7.webp"
  },
  {
    id: 3,
    title: "فرش کلاسیک طرح شاه‌عباسی",
    category: "فرش کلاسیک",
    price: 17200000,
    color: "قرمز",
    image: "assets/images/farsh-3.webp"
  },
  {
    id: 4,
    title: "فرش مدرن طرح مینیمال",
    category: "فرش مدرن",
    price: 6900000,
    color: "طوسی",
    image: "assets/images/farsh-4.webp"
  },
  {
    id: 5,
    title: "فرش دستباف طرح تبریز",
    category: "فرش دستباف",
    price: 42000000,
    color: "سرمه‌ای",
    image: "assets/images/farsh-5.webp"
  },
  {
    id: 6,
    title: "فرش کلاسیک طرح ترنج",
    category: "فرش کلاسیک",
    price: 19800000,
    color: "قهوه‌ای",
    image: "assets/images/farsh-6.webp"
  },
  {
    id: 7,
    title: "فرش مدرن مینیمال",
    category: "فرش مدرن",
    price: 7600000,
    color: "طوسی",
    image: "assets/images/farsh-8.webp"
  },
  {
    id: 8,
    title: "فرش لاکی گل‌ریز",
    category: "فرش کلاسیک",
    price: 16200000,
    color: "کرم",
    image: "assets/images/farsh-7.webp"
  }
];

let products = [];
let activeCategory = "all";
let activeColor = "all";
let searchTerm = "";
let cart = [];

// ---------------------------------------------------------------
// سبد خرید: ذخیره و بازیابی
// ---------------------------------------------------------------
try {
  const saved = JSON.parse(localStorage.getItem(CART_KEY));
  cart = Array.isArray(saved) ? saved : [];
} catch {
  cart = [];
}

function saveCart() {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (error) {
    console.warn("ذخیره سبد خرید ممکن نبود.", error);
  }
}

// ---------------------------------------------------------------
// بارگذاری و نمایش محصولات
// ---------------------------------------------------------------
function loadProducts() {
  products = rugCatalog;
  renderProducts();
}

function getFilteredProducts() {
  return products.filter(product => {
    const matchesSearch = normalize(
      `${product.title} ${product.category} ${product.color}`
    ).includes(searchTerm);

    const matchesCategory =
      activeCategory === "all" ||
      normalize(product.category).includes(normalize(activeCategory));

    const matchesColor =
      activeColor === "all" ||
      normalize(product.color) === normalize(activeColor);

    return matchesSearch && matchesCategory && matchesColor;
  });
}

function renderProducts() {
  if (!productsGrid) return;

  const items = getFilteredProducts();

  productsGrid.innerHTML = "";

  if (productsCount) {
    productsCount.textContent = `${faNumber(items.length)} محصول`;
  }

  if (!items.length) {
    productsGrid.innerHTML = `
      <div class="error-message">
        <p>محصولی با این مشخصات پیدا نشد.</p>
        <button type="button" class="reset-filters" id="resetFilters">
          پاک کردن فیلترها
        </button>
      </div>
    `;
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

    image.addEventListener(
      "error",
      () => {
        image.remove();
        imageBox.classList.add("image-missing");
        imageBox.setAttribute("aria-label", "تصویر محصول در دسترس نیست");
      },
      { once: true }
    );

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

// ---------------------------------------------------------------
// جستجو و فیلترها
// ---------------------------------------------------------------
on(searchInput, "input", event => {
  searchTerm = normalize(event.target.value);
  renderProducts();
});

function setCategory(category, shouldRender = true) {
  activeCategory = category;

  $$(".filter-chip").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.filterCategory === category
    );
  });

  if (shouldRender) renderProducts();
}

function setColor(color, shouldRender = true) {
  activeColor = color;

  $$(".color-option").forEach(button => {
    button.classList.toggle("active", button.dataset.filterColor === color);
  });

  if (shouldRender) renderProducts();
}

// ریست همه فیلترها (دسته، رنگ، جستجو)
function resetFilters() {
  searchTerm = "";
  if (searchInput) searchInput.value = "";

  setCategory("all", false);
  setColor("all", false);

  renderProducts();
}

$$(".filter-chip").forEach(button => {
  on(button, "click", () => setCategory(button.dataset.filterCategory));
});

$$(".color-option").forEach(button => {
  on(button, "click", () => setColor(button.dataset.filterColor));
});

// کلیک روی کارت دسته‌بندی بالای صفحه:
// بقیه فیلترها ریست می‌شوند تا نتیجه خالی نشود
$$(".category-card").forEach(button => {
  on(button, "click", () => {
    searchTerm = "";
    if (searchInput) searchInput.value = "";

    setColor("all", false);
    setCategory(button.dataset.category);

    $("#products")?.scrollIntoView({ behavior: "smooth" });
  });
});

// دکمه‌ی «پاک کردن فیلترها» در پیام نتیجه‌ی خالی
on(productsGrid, "click", event => {
  if (event.target.closest("#resetFilters")) resetFilters();
});

// ---------------------------------------------------------------
// منطق سبد خرید
// ---------------------------------------------------------------
const cartOverlay = $("#cartOverlay");
const cartItems = $("#cartItems");
const cartCount = $("#cartCount");
const cartTotal = $("#cartTotal");

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

// تغییر تعداد؛ اگر به صفر برسد آیتم حذف می‌شود
function changeQuantity(id, delta) {
  const item = cart.find(entry => entry.id === id);
  if (!item) return;

  item.quantity += delta;

  if (item.quantity <= 0) {
    cart = cart.filter(entry => entry.id !== id);
  }

  saveCart();
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
  renderCart();
}

function createQtyButton(label, action, id, ariaLabel) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "qty-btn";
  button.dataset.action = action;
  button.dataset.id = id;
  button.textContent = label;
  button.setAttribute("aria-label", ariaLabel);
  return button;
}

function renderCart() {
  if (!cartItems) return;

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
    image.addEventListener("error", () => image.remove(), { once: true });

    const info = document.createElement("div");
    info.className = "cart-item-info";

    const title = document.createElement("h4");
    title.textContent = item.title;

    const details = document.createElement("p");
    details.textContent = `${formatPrice(item.price)} × ${faNumber(
      item.quantity
    )}`;

    // کنترل تعداد
    const qty = document.createElement("div");
    qty.className = "cart-qty";

    const quantityLabel = document.createElement("span");
    quantityLabel.className = "qty-value";
    quantityLabel.textContent = faNumber(item.quantity);

    qty.append(
      createQtyButton("+", "inc", item.id, "افزایش تعداد"),
      quantityLabel,
      createQtyButton("−", "dec", item.id, "کاهش تعداد")
    );

    info.append(title, details, qty);

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "remove-item";
    remove.dataset.id = item.id;
    remove.textContent = "حذف";

    row.append(image, info, remove);
    cartItems.append(row);
  });

  const quantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (cartCount) cartCount.textContent = faNumber(quantity);
  if (cartTotal) cartTotal.textContent = formatPrice(total);
}

// افزودن از لیست محصولات
on(productsGrid, "click", event => {
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

// دکمه‌های داخل سبد خرید (تعداد و حذف)
on(cartItems, "click", event => {
  const qtyButton = event.target.closest(".qty-btn");

  if (qtyButton) {
    changeQuantity(
      Number(qtyButton.dataset.id),
      qtyButton.dataset.action === "inc" ? 1 : -1
    );
    return;
  }

  const removeButton = event.target.closest(".remove-item");

  if (removeButton) {
    removeFromCart(Number(removeButton.dataset.id));
  }
});

// ---------------------------------------------------------------
// باز و بسته کردن سبد خرید
// ---------------------------------------------------------------
function openCart() {
  if (!cartOverlay) return;
  cartOverlay.classList.add("active");
  cartOverlay.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  $("#closeCart")?.focus();
}

function closeCart() {
  if (!cartOverlay) return;
  cartOverlay.classList.remove("active");
  cartOverlay.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

on($("#cartButton"), "click", openCart);
on($("#closeCart"), "click", closeCart);

on(cartOverlay, "click", event => {
  if (event.target === cartOverlay) closeCart();
});

// ---------------------------------------------------------------
// منوی موبایل
// ---------------------------------------------------------------
const menuToggle = $("#menuToggle");
const mainNav = $("#mainNav");

function closeMenu() {
  mainNav?.classList.remove("active");
  menuToggle?.setAttribute("aria-expanded", "false");
}

on(menuToggle, "click", () => {
  if (!mainNav) return;
  const opened = mainNav.classList.toggle("active");
  menuToggle.setAttribute("aria-expanded", String(opened));
});

$$(".nav a").forEach(link => on(link, "click", closeMenu));

// ---------------------------------------------------------------
// فرم تماس (نمونه)
// ---------------------------------------------------------------
const contactFeedback = $("#contactFeedback");
contactFeedback?.setAttribute("aria-live", "polite");

on($("#contactForm"), "submit", event => {
  event.preventDefault();

  const form = event.currentTarget;
  if (!form.reportValidity()) return;

  if (contactFeedback) {
    contactFeedback.textContent =
      "پیام شما با موفقیت ثبت شد.";
  }

  form.reset();
});

// ---------------------------------------------------------------
// ورود و ثبت‌نام (نمونه، بدون سرور)
// ---------------------------------------------------------------
const authOverlay = $("#authOverlay");
const authFeedback = $("#authFeedback");
authFeedback?.setAttribute("aria-live", "polite");

function openAuth() {
  if (!authOverlay) return;
  authOverlay.classList.add("active");
  authOverlay.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  if (authFeedback) authFeedback.textContent = "";
  $("#authClose")?.focus();
}

function closeAuth() {
  if (!authOverlay) return;
  authOverlay.classList.remove("active");
  authOverlay.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

on($("#authButton"), "click", openAuth);
on($("#authClose"), "click", closeAuth);

on(authOverlay, "click", event => {
  if (event.target === authOverlay) closeAuth();
});

$$(".auth-tab").forEach(tab => {
  on(tab, "click", () => {
    const register = tab.dataset.auth === "register";

    $$(".auth-tab").forEach(item => {
      item.classList.toggle("active", item === tab);
    });

    const loginForm = $("#loginForm");
    const registerForm = $("#registerForm");
    if (loginForm) loginForm.hidden = register;
    if (registerForm) registerForm.hidden = !register;

    if (authFeedback) authFeedback.textContent = "";
  });
});

const demoAuthMessage =
  "خوش آمدید.";

on($("#loginForm"), "submit", event => {
  event.preventDefault();
  if (!event.currentTarget.reportValidity()) return;
  if (authFeedback) authFeedback.textContent = demoAuthMessage;
});

on($("#registerForm"), "submit", event => {
  event.preventDefault();
  if (!event.currentTarget.reportValidity()) return;
  if (authFeedback) authFeedback.textContent = demoAuthMessage;
});

// ---------------------------------------------------------------
// بستن همه پنجره‌ها با Escape
// ---------------------------------------------------------------
document.addEventListener("keydown", event => {
  if (event.key !== "Escape") return;
  closeCart();
  closeAuth();
  closeMenu();
});

// ---------------------------------------------------------------
// اجرای اولیه
// ---------------------------------------------------------------
renderCart();
loadProducts();