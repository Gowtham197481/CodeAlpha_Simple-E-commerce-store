const API_URL = '/api';

// State
let user = JSON.parse(localStorage.getItem('user')) || null;

// Selectors
const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const authSubtitle = document.getElementById('auth-subtitle');

// Tab Switching
tabLogin.addEventListener('click', () => {
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    loginForm.classList.add('active');
    registerForm.classList.remove('active');
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
    authSubtitle.textContent = 'Welcome back to premium living';
});

tabRegister.addEventListener('click', () => {
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
    registerForm.classList.add('active');
    loginForm.classList.remove('active');
    registerForm.style.display = 'block';
    loginForm.style.display = 'none';
    authSubtitle.textContent = 'Create your premium account';
});

// Login Logic
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const emailInput = loginForm.querySelector('input[type="email"]');
    const passwordInput = loginForm.querySelector('input[type="password"]');
    const email = emailInput.value;
    const password = passwordInput.value;

    const submitBtn = loginForm.querySelector('button[type="submit"]');
    submitBtn.textContent = 'Signing In...';
    submitBtn.disabled = true;

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

            let redirectUrl = localStorage.getItem('redirectAfterLogin');
            if (!redirectUrl || redirectUrl.includes('auth.html')) {
                redirectUrl = 'index.html';
            }

            localStorage.removeItem('redirectAfterLogin');
            alert(`Welcome back, ${data.user.username}!`);
            window.location.href = redirectUrl;
        } else {
            alert(data.error || 'Login failed. Please check your credentials.');
        }
    } catch (err) {
        console.error('Login error:', err);
        alert('Cannot connect to server. Please ensure the backend is running.');
    } finally {
        submitBtn.textContent = 'Sign In';
        submitBtn.disabled = false;
    }
});

// Register Logic
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = registerForm.querySelector('input[type="text"]').value;
    const email = registerForm.querySelector('input[type="email"]').value;
    const password = registerForm.querySelector('input[type="password"]').value;

    const submitBtn = registerForm.querySelector('button[type="submit"]');
    submitBtn.textContent = 'Creating Account...';
    submitBtn.disabled = true;

    try {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const data = await res.json();
        if (res.ok) {
            alert('Registration successful! You can now log in.');
            tabLogin.click();
            // Pre-fill email for login
            loginForm.querySelector('input[type="email"]').value = email;
        } else {
            alert(data.error || 'Registration failed');
        }
    } catch (err) {
        console.error('Registration error:', err);
        alert('Server error. Please try again later.');
    } finally {
        submitBtn.textContent = 'Create Account';
        submitBtn.disabled = false;
    }
});

// Google Picker Logic
const gmailBtn = document.getElementById('gmail-btn');
const googlePicker = document.getElementById('google-picker-modal');
const closePicker = document.querySelector('.close-picker');
const accountItems = document.querySelectorAll('.account-item:not(#use-another-account)');

if (gmailBtn) {
    gmailBtn.addEventListener('click', () => {
        googlePicker.style.display = 'block';
    });
}

if (closePicker) {
    closePicker.addEventListener('click', () => {
        googlePicker.style.display = 'none';
    });
}

accountItems.forEach(item => {
    item.addEventListener('click', () => {
        const email = item.dataset.email;
        const name = item.dataset.name;

        // Mock successful login
        localStorage.setItem('user', JSON.stringify({
            username: name,
            email: email,
            id: 'google_' + Math.floor(Math.random() * 1000)
        }));
        localStorage.setItem('token', 'mock_google_token_' + Date.now());

        alert(`Successfully logged in as ${name}`);
        const redirectUrl = localStorage.getItem('redirectAfterLogin') || 'index.html';
        localStorage.removeItem('redirectAfterLogin');
        window.location.href = redirectUrl;
    });
});

const useAnotherBtn = document.getElementById('use-another-account');
if (useAnotherBtn) {
    useAnotherBtn.addEventListener('click', () => {
        const sysEmail = 'gowtham.admin@ecart-elite.com';
        const sysPass = 'password123';
        alert(`System Login Credentials:\n\nEmail: ${sysEmail}\nPassword: ${sysPass}\n\nYou can now use these to login to the store.`);

        // Hide picker and fill login form
        googlePicker.style.display = 'none';
        tabLogin.click();

        const loginEmailInput = loginForm.querySelector('input[type="email"]');
        const loginPassInput = loginForm.querySelector('input[type="password"]');
        if (loginEmailInput) {
            loginEmailInput.value = sysEmail;
            loginEmailInput.focus();
        }
        if (loginPassInput) {
            loginPassInput.value = sysPass;
        }
    });
}

