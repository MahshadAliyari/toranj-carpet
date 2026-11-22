
/* =====================================================
   FARSH IRAN
   JavaScript - Product API, Search & Shopping Cart
===================================================== */


/* =====================================================
   01. SELECT HTML ELEMENTS
===================================================== */

const productsGrid = document.getElementById("productsGrid");
const productsCount = document.getElementById("productsCount");
const searchInput = document.getElementById("searchInput");

const cartButton = document.getElementById("cartButton");
const cartCount = document.getElementById("cartCount");
const cartOverlay = document.getElementById("cartOverlay");
const closeCart = document.getElementById("closeCart");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");


/* =====================================================
   02. API URL & VARIABLES
===================================================== */

const API_URL = "https://fakestoreapi.com/products";

let products = [];

let cart = JSON.parse(localStorage.getItem("farshIranCart")) || [];


/* =====================================================
   03. GET PRODUCTS FROM API
===================================================== */

async function getProducts() {

    try {

        productsGrid.innerHTML = `
            <div class="loading-message">
                در حال دریافت محصولات...
            </div>
        `;

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("خطا در دریافت اطلاعات");
        }

        const data = await response.json();

        products = data;

        renderProducts(products);

    } catch (error) {

        console.error("API Error:", error);

        productsGrid.innerHTML = `
            <div class="empty-message">
                دریافت محصولات با مشکل مواجه شد.
                لطفاً دوباره تلاش کنید.
            </div>
        `;

        productsCount.textContent = "خطا در دریافت محصولات";

    }

}


/* =====================================================
   04. DISPLAY PRODUCTS
===================================================== */

function renderProducts(items) {

    productsGrid.innerHTML = "";

    productsCount.textContent = `${items.length} محصول پیدا شد`;

    if (items.length === 0) {

        productsGrid.innerHTML = `
            <div class="empty-message">
                محصولی پیدا نشد!
            </div>
        `;

        return;

    }

    items.forEach(product => {

        const card = document.createElement("article");

        card.className = "product-card";

        const imageWrapper = document.createElement("div");
        imageWrapper.className = "product-image";

        const image = document.createElement("img");
        image.src = product.image;
        image.alt = product.title;
        image.loading = "lazy";

        imageWrapper.appendChild(image);

        const info = document.createElement("div");
        info.className = "product-info";

        const category = document.createElement("span");
        category.className = "product-category";
        category.textContent = product.category;

        const title = document.createElement("h3");
        title.textContent = product.title;

        const price = document.createElement("div");
        price.className = "product-price";
        price.textContent = `${Number(product.price).toLocaleString("en-US")} $`;

        const addButton = document.createElement("button");
        addButton.className = "add-to-cart";
        addButton.textContent = "افزودن به سبد خرید";
        addButton.dataset.id = product.id;

        info.append(category, title, price, addButton);

        card.append(imageWrapper, info);

        productsGrid.appendChild(card);

    });

}


/* =====================================================
   05. SEARCH PRODUCTS
===================================================== */

searchInput.addEventListener("input", function () {

    const searchValue = searchInput.value.trim().toLowerCase();

    const filteredProducts = products.filter(product => {

        return (
            product.title.toLowerCase().includes(searchValue) ||
            product.category.toLowerCase().includes(searchValue)
        );

    });

    renderProducts(filteredProducts);

});


/* =====================================================
   06. ADD PRODUCT TO CART
===================================================== */

productsGrid.addEventListener("click", function (event) {

    const button = event.target.closest(".add-to-cart");

    if (!button) return;

    const productId = Number(button.dataset.id);

    addToCart(productId);

});


function addToCart(productId) {

    const selectedProduct = products.find(product => product.id === productId);

    if (!selectedProduct) return;

    const existingProduct = cart.find(item => item.id === productId);

    if (existingProduct) {

        existingProduct.quantity++;

    } else {

        cart.push({
            id: selectedProduct.id,
            title: selectedProduct.title,
            price: selectedProduct.price,
            image: selectedProduct.image,
            quantity: 1
        });

    }

    saveCart();

    renderCart();

}


/* =====================================================
   07. SAVE CART IN LOCAL STORAGE
===================================================== */

function saveCart() {

    localStorage.setItem("farshIranCart", JSON.stringify(cart));

}


/* =====================================================
   08. DISPLAY CART ITEMS
===================================================== */

function renderCart() {

    cartItems.innerHTML = "";

    if (cart.length === 0) {

        cartItems.innerHTML = `
            <div class="empty-message">
                سبد خرید شما خالی است.
            </div>
        `;

    }

    cart.forEach(item => {

        const cartItem = document.createElement("div");

        cartItem.className = "cart-item";

        const image = document.createElement("img");
        image.src = item.image;
        image.alt = item.title;

        const info = document.createElement("div");
        info.className = "cart-item-info";

        const title = document.createElement("h4");
        title.textContent = item.title;

        const price = document.createElement("p");
        price.textContent =
            `${Number(item.price).toLocaleString("en-US")} $`;

        const quantity = document.createElement("p");
        quantity.textContent = `تعداد: ${item.quantity}`;

        const removeButton = document.createElement("button");
        removeButton.className = "remove-cart-item";
        removeButton.textContent = "حذف";
        removeButton.dataset.id = item.id;

        info.append(title, price, quantity, removeButton);

        cartItem.append(image, info);

        cartItems.appendChild(cartItem);

    });

    updateCartSummary();

}


/* =====================================================
   09. UPDATE CART COUNT & TOTAL PRICE
===================================================== */

function updateCartSummary() {

    const totalQuantity = cart.reduce((total, item) => {

        return total + item.quantity;

    }, 0);

    const totalPrice = cart.reduce((total, item) => {

        return total + item.price * item.quantity;

    }, 0);

    cartCount.textContent = totalQuantity;

    cartTotal.textContent =
        `${totalPrice.toLocaleString("en-US")} $`;

}


/* =====================================================
   10. REMOVE PRODUCT FROM CART
===================================================== */

cartItems.addEventListener("click", function (event) {

    const button = event.target.closest(".remove-cart-item");

    if (!button) return;

    const productId = Number(button.dataset.id);

    cart = cart.filter(item => item.id !== productId);

    saveCart();

    renderCart();

});


/* =====================================================
   11. OPEN & CLOSE CART
===================================================== */

cartButton.addEventListener("click", function () {

    cartOverlay.classList.add("active");

});

closeCart.addEventListener("click", function () {

    cartOverlay.classList.remove("active");

});

cartOverlay.addEventListener("click", function (event) {

    if (event.target === cartOverlay) {

        cartOverlay.classList.remove("active");

    }

});


/* =====================================================
   12. MOBILE MENU
===================================================== */

const menuToggle = document.getElementById("menuToggle");
const nav = document.querySelector(".nav");

if (menuToggle && nav) {

    menuToggle.addEventListener("click", function () {

        nav.classList.toggle("active");

    });

    nav.addEventListener("click", function (event) {

        if (event.target.closest("a")) {

            nav.classList.remove("active");

        }

    });

}


/* =====================================================
   13. INITIALIZE APP
===================================================== */

getProducts();

renderCart();

