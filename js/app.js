
/* =====================================================
   FARSH IRAN
   Main JavaScript
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

const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");


/* =====================================================
   02. API & GLOBAL VARIABLES
===================================================== */

const API_URL = "https://fakestoreapi.com/products";

let products = [];

let cart = [];

try {
    const savedCart = JSON.parse(
        localStorage.getItem("farshIranCart")
    );

    cart = Array.isArray(savedCart) ? savedCart : [];

} catch (error) {
    cart = [];
}


/* =====================================================
   03. GET PRODUCTS FROM API
===================================================== */

async function getProducts() {

    productsGrid.innerHTML = `
        <div class="loading-message">
            در حال دریافت محصولات...
        </div>
    `;

    productsCount.textContent = "در حال بارگذاری...";

    try {

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error("Invalid API response");
        }

        products = data;

        renderProducts(products);

    } catch (error) {

        console.error("API Error:", error);

        productsGrid.innerHTML = "";

        const errorBox = document.createElement("div");
        errorBox.className = "empty-message";

        const errorText = document.createElement("p");
        errorText.textContent =
            "دریافت محصولات ناموفق بود. اتصال اینترنت یا دسترسی به API را بررسی کنید.";

        const retryButton = document.createElement("button");
        retryButton.type = "button";
        retryButton.textContent = "تلاش مجدد";
        retryButton.className = "add-to-cart";
        retryButton.id = "retryButton";

        errorBox.append(errorText, retryButton);

        productsGrid.appendChild(errorBox);

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

        const message = document.createElement("div");

        message.className = "empty-message";
        message.textContent = "محصولی پیدا نشد!";

        productsGrid.appendChild(message);

        return;
    }

    items.forEach(product => {

        const card = document.createElement("article");
        card.className = "product-card";

        // Product Image
        const imageWrapper = document.createElement("div");
        imageWrapper.className = "product-image";

        const image = document.createElement("img");

        image.src = product.image;
        image.alt = product.title;
        image.loading = "lazy";

        image.onerror = function () {
            image.alt = "تصویر محصول در دسترس نیست";
            image.style.display = "none";
        };

        imageWrapper.appendChild(image);

        // Product Information
        const info = document.createElement("div");
        info.className = "product-info";

        const category = document.createElement("span");
        category.className = "product-category";
        category.textContent = product.category;

        const title = document.createElement("h3");
        title.textContent = product.title;

        const price = document.createElement("div");
        price.className = "product-price";

        price.textContent =
            `${Number(product.price).toLocaleString("en-US")} $`;

        // Add To Cart Button
        const addButton = document.createElement("button");

        addButton.className = "add-to-cart";
        addButton.type = "button";
        addButton.textContent = "افزودن به سبد خرید";
        addButton.dataset.id = product.id;

        info.append(
            category,
            title,
            price,
            addButton
        );

        card.append(imageWrapper, info);

        productsGrid.appendChild(card);

    });

}


/* =====================================================
   05. SEARCH PRODUCTS
===================================================== */

searchInput.addEventListener("input", function () {

    const searchValue = searchInput.value
        .trim()
        .toLowerCase();

    const filteredProducts = products.filter(product => {

        const title = product.title.toLowerCase();

        const category = product.category.toLowerCase();

        return (
            title.includes(searchValue) ||
            category.includes(searchValue)
        );

    });

    renderProducts(filteredProducts);

});


/* =====================================================
   06. RETRY API REQUEST
===================================================== */

productsGrid.addEventListener("click", function (event) {

    if (event.target.id === "retryButton") {
        getProducts();
    }

});


/* =====================================================
   07. ADD PRODUCT TO CART
===================================================== */

productsGrid.addEventListener("click", function (event) {

    const button = event.target.closest(".add-to-cart");

    if (!button || button.id === "retryButton") {
        return;
    }

    const productId = Number(button.dataset.id);

    addToCart(productId);

});


function addToCart(productId) {

    const selectedProduct = products.find(
        product => product.id === productId
    );

    if (!selectedProduct) {
        return;
    }

    const existingProduct = cart.find(
        item => item.id === productId
    );

    if (existingProduct) {

        existingProduct.quantity++;

    } else {

        cart.push({

            id: selectedProduct.id,

            title: selectedProduct.title,

            price: Number(selectedProduct.price),

            image: selectedProduct.image,

            quantity: 1

        });

    }

    saveCart();

    renderCart();

}


/* =====================================================
   08. SAVE CART IN LOCAL STORAGE
===================================================== */

function saveCart() {

    localStorage.setItem(
        "farshIranCart",
        JSON.stringify(cart)
    );

}


/* =====================================================
   09. DISPLAY CART
===================================================== */

function renderCart() {

    cartItems.innerHTML = "";

    if (cart.length === 0) {

        const emptyMessage = document.createElement("div");

        emptyMessage.className = "empty-message";

        emptyMessage.textContent = "سبد خرید شما خالی است.";

        cartItems.appendChild(emptyMessage);

    }

    cart.forEach(item => {

        const cartItem = document.createElement("div");

        cartItem.className = "cart-item";

        // Image
        const image = document.createElement("img");

        image.src = item.image;
        image.alt = item.title;

        // Information
        const info = document.createElement("div");

        info.className = "cart-item-info";

        const title = document.createElement("h4");

        title.textContent = item.title;

        const price = document.createElement("p");

        price.textContent =
            `${Number(item.price).toLocaleString("en-US")} $`;

        const quantity = document.createElement("p");

        quantity.textContent = `تعداد: ${item.quantity}`;

        // Remove Button
        const removeButton = document.createElement("button");

        removeButton.className = "remove-cart-item";
        removeButton.type = "button";
        removeButton.textContent = "حذف";
        removeButton.dataset.id = item.id;

        info.append(
            title,
            price,
            quantity,
            removeButton
        );

        cartItem.append(image, info);

        cartItems.appendChild(cartItem);

    });

    updateCartSummary();

}


/* =====================================================
   10. UPDATE CART COUNT & TOTAL
===================================================== */

function updateCartSummary() {

    // Total Quantity
    const totalQuantity = cart.reduce(
        (total, item) => total + item.quantity,
        0
    );

    // Total Price
    const totalPrice = cart.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

    cartCount.textContent = totalQuantity;

    cartTotal.textContent =
        `${totalPrice.toLocaleString("en-US")} $`;

}


/* =====================================================
   11. REMOVE PRODUCT FROM CART
===================================================== */

cartItems.addEventListener("click", function (event) {

    const button = event.target.closest(".remove-cart-item");

    if (!button) {
        return;
    }

    const productId = Number(button.dataset.id);

    cart = cart.filter(item => item.id !== productId);

    saveCart();

    renderCart();

});


/* =====================================================
   12. OPEN CART
===================================================== */

cartButton.addEventListener("click", function () {

    cartOverlay.classList.add("active");

});


/* =====================================================
   13. CLOSE CART
===================================================== */

closeCart.addEventListener("click", function () {

    cartOverlay.classList.remove("active");

});


cartOverlay.addEventListener("click", function (event) {

    if (event.target === cartOverlay) {

        cartOverlay.classList.remove("active");

    }

});


/* =====================================================
   14. MOBILE MENU
===================================================== */

menuToggle.addEventListener("click", function () {

    const isOpen = mainNav.classList.toggle("active");

    menuToggle.setAttribute("aria-expanded", isOpen);

});


mainNav.addEventListener("click", function (event) {

    if (event.target.closest("a")) {

        mainNav.classList.remove("active");

        menuToggle.setAttribute("aria-expanded", "false");

    }

});


/* =====================================================
   15. INITIALIZE APPLICATION
===================================================== */

renderCart();

getProducts();
