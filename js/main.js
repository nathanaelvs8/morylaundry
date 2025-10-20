// API Base URL
const API_URL = 'http://localhost:5000/api';

// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });
}

// Check Authentication Status and Update Navbar
function updateNavbar() {
    const navbarUser = document.getElementById('navbar-user');
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (token && user) {
        // User is logged in - DENGAN STYLE KECE! 🔥
        navbarUser.innerHTML = `
            <a href="status-pesanan.html" class="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition backdrop-blur-sm">
                <i class="fas fa-clipboard-list"></i>
                <span>Status Pesanan</span>
            </a>
            <div class="flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
                <i class="fas fa-user-circle text-lg"></i>
                <span class="font-semibold">${user.full_name}</span>
            </div>
            <button id="logout-btn" class="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 px-4 py-2 rounded-lg transition backdrop-blur-sm">
                <i class="fas fa-sign-out-alt"></i>
                <span>Logout</span>
            </button>
        `;

        // Add logout handler
        document.getElementById('logout-btn').addEventListener('click', handleLogout);

        // Update mobile menu
        const mobileMenuDiv = document.getElementById('mobile-menu');
        if (mobileMenuDiv) {
            mobileMenuDiv.innerHTML = `
                <a href="#home" class="block hover:bg-blue-700 px-4 py-2 rounded">
                    <i class="fas fa-home mr-2"></i>Home
                </a>
                <a href="#layanan" class="block hover:bg-blue-700 px-4 py-2 rounded">
                    <i class="fas fa-tshirt mr-2"></i>Layanan
                </a>
                <a href="#kontak" class="block hover:bg-blue-700 px-4 py-2 rounded">
                    <i class="fas fa-phone mr-2"></i>Kontak
                </a>
                <a href="status-pesanan.html" class="block bg-white/10 hover:bg-white/20 px-4 py-2 rounded">
                    <i class="fas fa-clipboard-list mr-2"></i>Status Pesanan
                </a>
                <div class="block bg-gradient-to-r from-purple-500/20 to-blue-500/20 px-4 py-2 rounded border border-white/20">
                    <i class="fas fa-user-circle mr-2"></i>${user.full_name}
                </div>
                <button onclick="handleLogout()" class="block w-full text-left bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 px-4 py-2 rounded">
                    <i class="fas fa-sign-out-alt mr-2"></i>Logout
                </button>
            `;
        }
    } else {
        // User is not logged in
        navbarUser.innerHTML = `
            <a href="login.html" class="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition font-semibold shadow-lg">
                <i class="fas fa-sign-in-alt mr-2"></i>Login
            </a>
        `;

        // Update mobile menu
        const mobileMenuDiv = document.getElementById('mobile-menu');
        if (mobileMenuDiv) {
            mobileMenuDiv.innerHTML = `
                <a href="#home" class="block hover:bg-blue-700 px-4 py-2 rounded">
                    <i class="fas fa-home mr-2"></i>Home
                </a>
                <a href="#layanan" class="block hover:bg-blue-700 px-4 py-2 rounded">
                    <i class="fas fa-tshirt mr-2"></i>Layanan
                </a>
                <a href="#kontak" class="block hover:bg-blue-700 px-4 py-2 rounded">
                    <i class="fas fa-phone mr-2"></i>Kontak
                </a>
                <a href="login.html" class="block bg-white text-blue-600 px-4 py-2 rounded text-center font-semibold">
                    <i class="fas fa-sign-in-alt mr-2"></i>Login
                </a>
            `;
        }
    }
}

// Logout Handler
function handleLogout() {
    if (confirm('Apakah Anda yakin ingin logout?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    }
}

// Make handleLogout globally accessible
window.handleLogout = handleLogout;

// Load Services
async function loadServices() {
    const container = document.getElementById('services-container');
    
    try {
        const response = await fetch(`${API_URL}/orders/public/services`);
        const data = await response.json();
        
        if (data.success && data.services.length > 0) {
            container.innerHTML = '';
            
            data.services.forEach(service => {
                const serviceCard = createServiceCard(service);
                container.innerHTML += serviceCard;
            });
        } else {
            container.innerHTML = '<p class="col-span-full text-center text-gray-600">Tidak ada layanan tersedia</p>';
        }
    } catch (error) {
        console.error('Error loading services:', error);
        container.innerHTML = '<p class="col-span-full text-center text-red-600">Gagal memuat layanan. Silakan refresh halaman.</p>';
    }
}

// Create Service Card HTML
function createServiceCard(service) {
    const whatsappMessage = encodeURIComponent(
        `Halo Mory Laundry, saya tertarik untuk memesan layanan ${service.service_name}.`
    );
    const whatsappLink = `https://wa.me/6281217607101?text=${whatsappMessage}`;
    
    return `
        <div class="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition transform hover:-translate-y-1">
            <div class="text-center">
                <i class="fas fa-tshirt text-4xl text-blue-600 mb-4"></i>
                <h3 class="text-xl font-bold text-gray-800 mb-2">${service.service_name}</h3>
                <p class="text-gray-600 text-sm mb-4">${service.description || 'Layanan berkualitas untuk pakaian Anda'}</p>
                <div class="text-3xl font-bold text-blue-600 mb-4">
                    Rp ${service.price.toLocaleString('id-ID')}
                    <span class="text-sm text-gray-500">/ ${service.unit}</span>
                </div>
                <a href="${whatsappLink}" target="_blank" 
                   class="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:opacity-90 transition">
                    <i class="fab fa-whatsapp mr-2"></i> Pesan Sekarang
                </a>
            </div>
        </div>
    `;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    updateNavbar();
    loadServices();
});