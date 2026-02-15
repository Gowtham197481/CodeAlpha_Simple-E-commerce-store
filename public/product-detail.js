const API_URL = '/api';

async function init() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        window.location.href = 'shop.html';
        return;
    }

    try {
        const res = await fetch(`${API_URL}/products/${productId}`);
        const product = await res.json();

        if (product.error) {
            alert('Product not found');
            window.location.href = 'shop.html';
            return;
        }

        renderProduct(product);
    } catch (err) {
        console.error('Error fetching product:', err);
        alert('Failed to load product details');
    }
}

// Check Auth Helper
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        localStorage.setItem('redirectAfterLogin', window.location.href);
        window.location.href = 'auth.html';
        return false;
    }
    return true;
}

function renderProduct(product) {
    const img = document.getElementById('product-img');
    img.src = product.imagePath;
    img.alt = product.name;
    img.onerror = () => { img.src = 'https://placehold.co/600x400?text=No+Image'; };
    document.getElementById('product-category').textContent = product.category;
    document.getElementById('product-name').textContent = product.name;
    document.getElementById('product-description').textContent = product.description;

    // Price details
    const currentPrice = product.price;
    const originalPrice = product.originalPrice || (currentPrice / 0.8);
    const discount = product.discountPercentage || 20;
    const savings = originalPrice - currentPrice;

    document.getElementById('current-price').textContent = `$${currentPrice.toFixed(2)}`;
    document.getElementById('original-price').textContent = `$${originalPrice.toFixed(2)}`;
    document.getElementById('discount-badge').textContent = `${discount}% OFF`;
    document.getElementById('savings-amount').textContent = `You save $${savings.toFixed(2)}!`;

    // Advantages
    const advantagesList = document.getElementById('product-advantages');
    const advantages = product.advantages ? product.advantages.split(',').map(a => a.trim()) : [];
    advantagesList.innerHTML = advantages.map(a => `<li><i data-lucide="check-circle-2"></i> ${a}</li>`).join('');

    // Wishlist Logic
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const isInWishlist = wishlist.includes(product.id);

    // Create or find wishlist container (we need to inject it since HTML might not have it)
    const imgContainer = document.querySelector('.detail-image');
    let wishlistBtn = imgContainer.querySelector('.wishlist-btn');

    if (!wishlistBtn) {
        wishlistBtn = document.createElement('button');
        wishlistBtn.className = `wishlist-btn ${isInWishlist ? 'active' : ''}`;
        wishlistBtn.onclick = () => toggleDetailWishlist(product.id, wishlistBtn);
        wishlistBtn.innerHTML = '<i data-lucide="heart"></i>';
        imgContainer.appendChild(wishlistBtn);
    } else {
        wishlistBtn.className = `wishlist-btn ${isInWishlist ? 'active' : ''}`;
        wishlistBtn.onclick = () => toggleDetailWishlist(product.id, wishlistBtn);
    }

    // Cart logic
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    addToCartBtn.onclick = () => {
        if (!checkAuth()) return;

        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existing = cart.find(item => item.id === product.id);

        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }

        localStorage.setItem('cart', JSON.stringify(cart));

        if (window.openCheckout) {
            window.openCheckout();
        } else {
            alert('Added to cart!');
        }
    };

    lucide.createIcons();
}

function toggleDetailWishlist(productId, btn) {
    if (!checkAuth()) return;

    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const index = wishlist.indexOf(productId);

    if (index === -1) {
        wishlist.push(productId);
        btn.classList.add('active');
        alert('Added to Favorites!');
    } else {
        wishlist.splice(index, 1);
        btn.classList.remove('active');
    }

    localStorage.setItem('wishlist', JSON.stringify(wishlist));
}

init();
