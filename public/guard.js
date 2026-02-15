(function () {
    const user = JSON.parse(localStorage.getItem('user'));
    const path = window.location.pathname;
    const isAuthPage = path.includes('auth.html');

    // List of pages that require authentication
    const protectedPages = ['shop.html', 'orders.html', 'product-detail.html', 'checkout.html'];

    // Check if current page is protected
    const matchesProtected = protectedPages.some(page => path.toLowerCase().includes(page.toLowerCase()));

    const isProtected = matchesProtected;

    if (!user && isProtected && !isAuthPage) {
        // Save the intended destination to redirect back after login
        // For local files, we use the absolute URL to be safe
        localStorage.setItem('redirectAfterLogin', window.location.href);
        window.location.href = 'auth.html';
    }
})();
