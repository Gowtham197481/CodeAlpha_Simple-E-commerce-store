function initCheckout() {
    const checkoutModal = document.getElementById('checkout-modal');
    if (!checkoutModal) return;

    const closeBtn = checkoutModal.querySelector('.close-modal');
    const steps = checkoutModal.querySelectorAll('.step');
    const formSteps = checkoutModal.querySelectorAll('.checkout-form-step');
    const nextBtns = checkoutModal.querySelectorAll('.next-step');
    const prevBtns = checkoutModal.querySelectorAll('.prev-step');
    const checkoutForm = document.getElementById('checkout-form');

    let currentStep = 1;

    function showStep(step) {
        formSteps.forEach(s => s.classList.remove('active'));
        steps.forEach((s, idx) => {
            s.classList.remove('active', 'completed');
            if (idx + 1 < step) s.classList.add('completed');
            if (idx + 1 === step) s.classList.add('active');
        });
        document.querySelector(`.checkout-form-step[data-step="${step}"]`).classList.add('active');
        currentStep = step;
    }

    nextBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (validateStep(currentStep)) {
                showStep(currentStep + 1);
            }
        });
    });

    prevBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            showStep(currentStep - 1);
        });
    });

    function validateStep(step) {
        if (step === 1) {
            const name = document.getElementById('checkout-name').value;
            const address = document.getElementById('checkout-address').value;
            const city = document.getElementById('checkout-city').value;
            if (!name || !address || !city) {
                alert('Please fill in all delivery details including your name');
                return false;
            }
        }
        if (step === 2) {
            const payment = document.querySelector('input[name="payment"]:checked');
            if (!payment) {
                alert('Please select a payment method');
                return false;
            }
        }
        return true;
    }

    checkoutForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const user = JSON.parse(localStorage.getItem('user')) || null;
        const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const totalFormatted = `$${total.toFixed(2)}`;

        // Order Details for API
        const orderPayload = {
            orderNumber: 'ORD' + Math.floor(Math.random() * 1000000),
            totalPrice: total,
            shippingName: document.getElementById('checkout-name').value,
            shippingAddress: document.getElementById('checkout-address').value,
            shippingCity: document.getElementById('checkout-city').value,
            paymentMethod: document.querySelector('input[name="payment"]:checked').value,
            deliveryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString(),
            items: cart,
            userId: user ? user.id : null
        };

        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderPayload)
            });

            if (!res.ok) throw new Error('Order creation failed');

            // Also keep in localStorage for immediate offline tracking
            const orders = JSON.parse(localStorage.getItem('orders')) || [];
            orders.unshift({
                ...orderPayload,
                id: orderPayload.orderNumber, // mapping for tracking page compatibility
                date: new Date().toLocaleDateString(),
                total: totalFormatted
            });
            localStorage.setItem('orders', JSON.stringify(orders));

            // Inject order details into success screen
            const summaryBox = document.getElementById('order-summary');
            if (summaryBox) {
                summaryBox.innerHTML = `
                    <p><strong>Order ID:</strong> ${orderPayload.orderNumber}</p>
                    <p><strong>Total Amount:</strong> ${totalFormatted}</p>
                    <p><strong>Estimated Delivery:</strong> ${orderPayload.deliveryDate}</p>
                `;
            }

            showStep(3);

            // Clear cart
            localStorage.removeItem('cart');

            // Redirect to Orders page after a short delay so user can see success message
            setTimeout(() => {
                window.location.href = 'orders.html';
            }, 2000);

            // Update UI if functions exist
            if (typeof window.updateUI === 'function') window.updateUI();
            if (typeof window.renderCart === 'function') window.renderCart();

            const cartCount = document.getElementById('cart-count');
            if (cartCount) cartCount.textContent = '0';

        } catch (err) {
            console.error('Checkout error:', err);
            alert('Failed to place order. Please try again.');
        }
    });




    closeBtn.onclick = () => {
        checkoutModal.classList.remove('active');
        // Reset to step 1
        setTimeout(() => showStep(1), 300);
    };

    window.openCheckout = function () {
        // Enforce auth before checkout (though cart logic might have caught it)
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            window.location.href = 'auth.html';
            return;
        }

        checkoutModal.classList.add('active');
        showStep(1);
    };
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initCheckout);
