const API_URL = '/api';

// State
let products = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let user = JSON.parse(localStorage.getItem('user')) || null;

// Selectors
const productGrid = document.getElementById('product-grid');
const cartCount = document.getElementById('cart-count');
const authBtn = document.getElementById('auth-btn');
const authModal = document.getElementById('auth-modal');
const cartBtn = document.getElementById('cart-btn');
const cartDrawer = document.getElementById('cart-drawer');
const authBtnText = authBtn.querySelector('i').parentElement; // Get button or parent
const closeButtons = document.querySelectorAll('.close-modal, .close-drawer');

// Initialize
async function init() {
    await fetchProducts();
    updateUserStatus();
    updateUI();
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
        products = await res.json();
        renderProducts();
    } catch (err) {
        console.error('Error fetching products:', err);
        productGrid.innerHTML = '<p class="error">Failed to load products. Is the server running?</p>';
    }
}

// Render Products
function renderProducts() {
    productGrid.innerHTML = products.map(product => `
        <div class="product-card">
            <div class="product-image">
                <img src="${product.imagePath}" alt="${product.name}">
                <div class="add-to-cart-overlay">
                    <button class="btn-primary" onclick="addToCart(${product.id})">Add to Cart</button>
                </div>
            </div>
            <div class="product-info">
                <p class="product-category">${product.category}</p>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-price">$${product.price.toFixed(2)}</p>
            </div>
        </div>
    `).join('');
}

// Cart Logic
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existing = cart.find(item => item.id === productId);

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    saveCart();
    updateUI();
    // toggleCart(true);
    if (window.openCheckout) {
        window.openCheckout();
    } else {
        alert('Added to cart!');
    }
}

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

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateUI();
}

// UI Toggles
function toggleCart(show) {
    cartDrawer.classList.toggle('active', show);
}

// authBtn listeners handled in updateUserStatus

cartBtn.addEventListener('click', () => toggleCart(true));

closeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        authModal.classList.remove('active');
        cartDrawer.classList.remove('active');
    });
});

// Modal Tabbing
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

// Login Logic (Modal)
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = loginForm.querySelector('input[type="email"]').value;
        const password = loginForm.querySelector('input[type="password"]').value;

        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                alert(`Welcome back, ${data.user.username}!`);
                window.location.reload();
            } else {
                alert(data.error || 'Login failed');
            }
        } catch (err) {
            console.error('Login error:', err);
            alert('Server error. Please try again later.');
        }
    });
}

// Register Logic (Modal)
const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = registerForm.querySelector('input[type="text"]').value;
        const email = registerForm.querySelector('input[type="email"]').value;
        const password = registerForm.querySelector('input[type="password"]').value;

        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });

            const data = await res.json();
            if (res.ok) {
                alert('Registration successful! You can now log in.');
                const loginTab = document.querySelector('.tab-btn[data-tab="login"]');
                if (loginTab) loginTab.click();
            } else {
                alert(data.error || 'Registration failed');
            }
        } catch (err) {
            console.error('Registration error:', err);
            alert('Server error. Please try again later.');
        }
    });
}


init();
