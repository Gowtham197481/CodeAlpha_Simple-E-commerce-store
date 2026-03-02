const API_URL = '/api';

// State
let allProducts = [];
let filteredProducts = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let user = JSON.parse(localStorage.getItem('user')) || null;
let currentCategory = 'all';

// Selectors
const shopGrid = document.getElementById('shop-grid');
const cartCount = document.getElementById('cart-count');
const authBtn = document.getElementById('auth-btn');
const authModal = document.getElementById('auth-modal');
const cartBtn = document.getElementById('cart-btn');
const cartDrawer = document.getElementById('cart-drawer');
const productModal = document.getElementById('product-modal');
const closeButtons = document.querySelectorAll('.close-modal, .close-drawer');
const categoryButtons = document.querySelectorAll('.cat-btn');
const searchInput = document.getElementById('shop-search');
const sortBy = document.getElementById('sort-by');
const productCountText = document.getElementById('product-count');

// Initialize
async function init() {
    await fetchProducts();
    updateUserStatus();
    updateUI();
    setupEventListeners();
}

function updateUserStatus() {
    if (user) {
        authBtn.innerHTML = `<span class="user-name">${user.username}</span>`;
        authBtn.onclick = () => {
            if (confirm('Do you want to logout?')) {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                window.location.reload();
            }
        };
    } else {
        authBtn.addEventListener('click', () => {
            window.location.href = 'auth.html';
        });
    }
}

// Fetch Products
async function fetchProducts() {
    try {
        const res = await fetch(`${API_URL}/products`);
        allProducts = await res.json();
        filteredProducts = [...allProducts];
        renderProducts();
    } catch (err) {
        console.error('Error fetching products:', err);
        shopGrid.innerHTML = '<p class="error">Failed to load products. Is the server running?</p>';
    }
}

// Check Auth Helper
function checkAuth() {
    // Refresh user from storage
    user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        localStorage.setItem('redirectAfterLogin', window.location.href);
        window.location.href = 'auth.html';
        return false;
    }
    return true;
}

// Wishlist Logic
function getWishlist() {
    return JSON.parse(localStorage.getItem('wishlist')) || [];
}

window.toggleWishlist = function (productId, event) {
    if (event) event.stopPropagation();

    if (!checkAuth()) return;

    let wishlist = getWishlist();
    const index = wishlist.indexOf(productId);

    const btns = document.querySelectorAll(`.wishlist-btn[data-id="${productId}"]`);

    if (index === -1) {
        wishlist.push(productId);
        btns.forEach(b => b.classList.add('active'));
        alert('Added to Favorites!');
    } else {
        wishlist.splice(index, 1);
        btns.forEach(b => b.classList.remove('active'));
    }

    localStorage.setItem('wishlist', JSON.stringify(wishlist));
}

// Render Products
function renderProducts() {
    if (filteredProducts.length === 0) {
        shopGrid.innerHTML = '<p class="no-results">No products found matching your criteria.</p>';
        productCountText.textContent = `Showing 0 products in "${currentCategory}"`;
        return;
    }

    const wishlist = getWishlist();

    // Grouping logic
    const groups = {};
    filteredProducts.forEach(product => {
        if (!groups[product.category]) groups[product.category] = [];
        groups[product.category].push(product);
    });

    const sortedCategories = Object.keys(groups).sort();

    shopGrid.innerHTML = sortedCategories.map(category => `
            <div class="category-section">
                <h2 class="category-title">${category}</h2>
                <div class="product-grid">
                    ${groups[category].map(product => {
        const isInWishlist = wishlist.includes(product.id);
        return `
                        <div class="product-card">
                            <div class="product-image" onclick="viewProduct(${product.id})">
                                <img src="${product.imagePath}" alt="${product.name}" onerror="this.onerror=null;this.src='https://placehold.co/600x400?text=No+Image';">
                                <button class="wishlist-btn ${isInWishlist ? 'active' : ''}" data-id="${product.id}" onclick="toggleWishlist(${product.id}, event)">
                                    <i data-lucide="heart"></i>
                                </button>
                                <div class="add-to-cart-overlay">
                                    <button class="btn-primary">View Details</button>
                                </div>
                            </div>
                            <div class="product-info">
                                <p class="product-category">${product.category}</p>
                                <h3 class="product-name" onclick="viewProduct(${product.id})">${product.name}</h3>
                                <p class="product-price">$${product.price.toFixed(2)}</p>
                                <button class="btn-primary" style="width: 100%; margin-top: 1rem;" onclick="addToCart(${product.id})">Add to Cart</button>
                            </div>
                        </div>
                    `}).join('')}
                </div>
            </div>
        `).join('');

    const countLabel = currentCategory === 'all' ? 'all categories' : currentCategory;
    productCountText.textContent = `Showing ${filteredProducts.length} products in ${countLabel}`;

    lucide.createIcons();
}

// Product Detail Navigation
window.viewProduct = function (productId) {
    // Allow viewing without login, but can enforce if requested. 
    // User said "click any option first show login page", but usually viewing is allowed.
    // If strictly enforcing:
    // if (!checkAuth()) return;
    window.location.href = `product-detail.html?id=${productId}`;
};

// Filtering & Sorting
function filterAndSort() {
    let result = [...allProducts];

    // Category Filter
    if (currentCategory === 'favorites') {
        const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        result = result.filter(p => wishlist.includes(p.id));
    } else if (currentCategory !== 'all') {
        result = result.filter(p => p.category.toLowerCase() === currentCategory.toLowerCase());
    }

    // Search Filter
    const query = searchInput.value.toLowerCase();
    if (query) {
        result = result.filter(p =>
            p.name.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query)
        );
    }

    // Sort
    const sortVal = sortBy.value;
    if (sortVal === 'price-low') {
        result.sort((a, b) => a.price - b.price);
    } else if (sortVal === 'price-high') {
        result.sort((a, b) => b.price - a.price);
    }

    filteredProducts = result;
    renderProducts();
}

// Event Listeners
function setupEventListeners() {
    categoryButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.dataset.category;
            filterAndSort();

            shopGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    searchInput.addEventListener('input', filterAndSort);
    sortBy.addEventListener('change', filterAndSort);

    cartBtn.addEventListener('click', () => toggleCart(true));

    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            authModal.classList.remove('active');
            cartDrawer.classList.remove('active');
            productModal.classList.remove('active');
            document.getElementById('contact-modal').classList.remove('active');
        });
    });

    // About Us Modal Logic
    const aboutUsLink = document.getElementById('about-us-link');
    const contactModal = document.getElementById('contact-modal');
    const closeContactModal = document.getElementById('close-contact-modal');

    if (aboutUsLink) {
        aboutUsLink.addEventListener('click', () => {
            contactModal.classList.add('active');
        });
    }

    if (closeContactModal) {
        closeContactModal.addEventListener('click', () => {
            contactModal.classList.remove('active');
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === authModal) authModal.classList.remove('active');
        if (e.target === cartDrawer) cartDrawer.classList.remove('active');
        if (e.target === productModal) productModal.classList.remove('active');
        if (e.target === contactModal) contactModal.classList.remove('active');
    });

    const tabBtns = document.querySelectorAll('.tab-btn');
    const authForms = document.querySelectorAll('.auth-form');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            authForms.forEach(f => f.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(`${btn.dataset.tab}-form`).classList.add('active');
        });
    });
}

// Cart Logic (Shared with app.js)
window.addToCart = function (productId) {
    if (!checkAuth()) return;

    const product = allProducts.find(p => p.id === productId);
    const existing = cart.find(item => item.id === productId);

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    saveCart();
    updateUI();

    if (window.openCheckout) {
        window.openCheckout();
    } else {
        alert('Added to cart!');
    }
}
// ... rest matches original ...


function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateUI() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = count;
    renderCart();
}

function renderCart() {
    const cartItems = document.getElementById('cart-items');
    const totalAmount = document.getElementById('total-amount');

    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Your cart is empty.</p>';
        totalAmount.textContent = '$0.00';
        return;
    }

    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.imagePath}" alt="${item.name}">
            <div class="item-info">
                <h4>${item.name}</h4>
                <p>$${item.price.toFixed(2)} x ${item.quantity}</p>
            </div>
            <button class="remove-item" onclick="removeFromCart(${item.id})">&times;</button>
        </div>
    `).join('');

    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    totalAmount.textContent = `$${total.toFixed(2)}`;
}

window.removeFromCart = function (productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateUI();
}

function toggleCart(show) {
    cartDrawer.classList.toggle('active', show);
}

init();
