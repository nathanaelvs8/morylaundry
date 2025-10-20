// API Base URL
const API_URL = 'http://localhost:5000/api';

// Check if already logged in - redirect if yes
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (token && user) {
        // User already logged in, redirect based on role
        if (user.role === 'admin') {
            window.location.href = 'admin/dashboard.html';
        } else {
            window.location.href = 'status-pesanan.html';
        }
    }
});

// DOM Elements
const loginTab = document.getElementById('login-tab');
const registerTab = document.getElementById('register-tab');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const alertContainer = document.getElementById('alert-container');

// Tab Switching
loginTab.addEventListener('click', () => {
    loginTab.classList.add('border-blue-600', 'text-blue-600');
    loginTab.classList.remove('text-gray-400');
    registerTab.classList.remove('border-blue-600', 'text-blue-600');
    registerTab.classList.add('text-gray-400');
    
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    clearAlert();
});

registerTab.addEventListener('click', () => {
    registerTab.classList.add('border-blue-600', 'text-blue-600');
    registerTab.classList.remove('text-gray-400');
    loginTab.classList.remove('border-blue-600', 'text-blue-600');
    loginTab.classList.add('text-gray-400');
    
    registerForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
    clearAlert();
});

// Show Alert
function showAlert(message, type = 'error') {
    const bgColor = type === 'success' ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-100 text-red-800 border-red-300';
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    
    alertContainer.innerHTML = `
        <div class="${bgColor} border px-4 py-3 rounded-lg flex items-center">
            <i class="fas ${icon} mr-3"></i>
            <span>${message}</span>
        </div>
    `;
    
    setTimeout(clearAlert, 5000);
}

function clearAlert() {
    alertContainer.innerHTML = '';
}

// Login Handler
loginBtn.addEventListener('click', async () => {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    
    if (!username || !password) {
        showAlert('Username dan password harus diisi!');
        return;
    }
    
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Loading...';
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Save token and user data to localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            showAlert('Login berhasil! Mengalihkan...', 'success');
            
            // Redirect based on role
            setTimeout(() => {
                if (data.user.role === 'admin') {
                    window.location.href = 'admin/dashboard.html';
                } else {
                    window.location.href = 'status-pesanan.html';
                }
            }, 1000);
        } else {
            showAlert(data.message || 'Login gagal!');
            loginBtn.disabled = false;
            loginBtn.innerHTML = '<i class="fas fa-sign-in-alt mr-2"></i> Login';
        }
    } catch (error) {
        console.error('Login error:', error);
        showAlert('Terjadi kesalahan. Pastikan server sedang berjalan.');
        loginBtn.disabled = false;
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt mr-2"></i> Login';
    }
});

// Register Handler
registerBtn.addEventListener('click', async () => {
    const fullName = document.getElementById('register-fullname').value.trim();
    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    
    // Validation
    if (!fullName || !username || !password || !confirmPassword) {
        showAlert('Semua field harus diisi!');
        return;
    }
    
    if (fullName.length < 3) {
        showAlert('Nama lengkap minimal 3 karakter!');
        return;
    }
    
    if (username.length < 4) {
        showAlert('Username minimal 4 karakter!');
        return;
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        showAlert('Username hanya boleh berisi huruf, angka, dan underscore!');
        return;
    }
    
    if (password.length < 6) {
        showAlert('Password minimal 6 karakter!');
        return;
    }
    
    if (password !== confirmPassword) {
        showAlert('Password dan konfirmasi password tidak cocok!');
        return;
    }
    
    registerBtn.disabled = true;
    registerBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Loading...';
    
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                full_name: fullName, 
                username, 
                password 
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert('Registrasi berhasil! Silakan login.', 'success');
            
            // Clear form
            document.getElementById('register-fullname').value = '';
            document.getElementById('register-username').value = '';
            document.getElementById('register-password').value = '';
            document.getElementById('register-confirm-password').value = '';
            
            // Switch to login tab after 2 seconds
            setTimeout(() => {
                loginTab.click();
            }, 2000);
            
            registerBtn.disabled = false;
            registerBtn.innerHTML = '<i class="fas fa-user-plus mr-2"></i> Daftar';
        } else {
            showAlert(data.message || 'Registrasi gagal!');
            registerBtn.disabled = false;
            registerBtn.innerHTML = '<i class="fas fa-user-plus mr-2"></i> Daftar';
        }
    } catch (error) {
        console.error('Register error:', error);
        showAlert('Terjadi kesalahan. Pastikan server sedang berjalan.');
        registerBtn.disabled = false;
        registerBtn.innerHTML = '<i class="fas fa-user-plus mr-2"></i> Daftar';
    }
});