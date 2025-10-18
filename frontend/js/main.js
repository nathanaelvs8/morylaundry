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
            </div>
        </div>
    `;
}

// Load services when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadServices();
});

document.addEventListener("DOMContentLoaded", () => {
    const navbarUser = document.getElementById("navbar-user");
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");

    if (token && username) {
      navbarUser.innerHTML = `
        <div class="flex items-center gap-2">
          <i class="fas fa-user text-white"></i>
          <span>${username}</span>
          <button id="logoutBtn" class="ml-2 bg-white text-blue-600 px-3 py-1 rounded hover:bg-gray-100 transition">Logout</button>
        </div>
      `;

      document.getElementById("logoutBtn").addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        window.location.href = "index.html";
      });

    } else {
      navbarUser.innerHTML = `
        <a href="login.html" class="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition">Login</a>
      `;
    }
});