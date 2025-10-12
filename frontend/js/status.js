// API Base URL
const API_URL = 'http://localhost:5000/api';

// Check authentication
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

if (!token || !user) {
    window.location.href = 'login.html';
}

// Display user name
document.getElementById('user-name').textContent = `Halo, ${user.full_name}`;
document.getElementById('user-name').classList.remove('hidden');

// Logout handler
document.getElementById('logout-btn').addEventListener('click', () => {
    if (confirm('Apakah Anda yakin ingin logout?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    }
});

// Show Alert
function showAlert(message, type = 'error') {
    const bgColor = type === 'success' ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-100 text-red-800 border-red-300';
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    
    document.getElementById('alert-container').innerHTML = `
        <div class="${bgColor} border px-4 py-3 rounded-lg flex items-center">
            <i class="fas ${icon} mr-3"></i>
            <span>${message}</span>
        </div>
    `;
}

// Get status badge color
function getStatusBadge(status) {
    const statusColors = {
        'Antrian': 'bg-gray-200 text-gray-800',
        'Proses Cuci': 'bg-blue-200 text-blue-800',
        'Proses Kering': 'bg-yellow-200 text-yellow-800',
        'Setrika': 'bg-purple-200 text-purple-800',
        'Siap Diambil': 'bg-green-200 text-green-800',
        'Selesai': 'bg-green-500 text-white',
        'Dibatalkan': 'bg-red-200 text-red-800'
    };
    
    return statusColors[status] || 'bg-gray-200 text-gray-800';
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('id-ID', options);
}

// Create order card
function createOrderCard(order) {
    const statusBadge = getStatusBadge(order.status);
    const entryDate = formatDate(order.entry_date);
    const completedDate = order.completed_date ? formatDate(order.completed_date) : '-';
    
    return `
        <div class="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
            <div class="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                <div>
                    <h3 class="text-xl font-bold text-gray-800 mb-1">Pesanan #${order.order_number}</h3>
                    <p class="text-gray-600 text-sm">
                        <i class="fas fa-calendar mr-1"></i> ${entryDate}
                    </p>
                </div>
                <span class="status-badge ${statusBadge} mt-2 md:mt-0">
                    ${order.status}
                </span>
            </div>
            
            <div class="border-t pt-4 space-y-2">
                <div class="flex justify-between">
                    <span class="text-gray-600">Layanan:</span>
                    <span class="font-semibold">${order.service_name}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600">Jumlah:</span>
                    <span class="font-semibold">${order.quantity} ${order.unit}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600">Total Harga:</span>
                    <span class="font-bold text-blue-600">Rp ${order.total_price.toLocaleString('id-ID')}</span>
                </div>
                ${order.notes ? `
                <div class="mt-3 pt-3 border-t">
                    <p class="text-gray-600 text-sm"><strong>Catatan:</strong> ${order.notes}</p>
                </div>
                ` : ''}
                ${order.completed_date ? `
                <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Selesai pada:</span>
                    <span class="text-gray-800">${completedDate}</span>
                </div>
                ` : ''}
            </div>
        </div>
    `;
}

// Load orders
async function loadOrders() {
    const container = document.getElementById('orders-container');
    
    try {
        const response = await fetch(`${API_URL}/orders`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (response.status === 401 || response.status === 403) {
            showAlert('Sesi Anda telah berakhir. Silakan login kembali.');
            setTimeout(() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = 'login.html';
            }, 2000);
            return;
        }
        
        if (data.success && data.orders.length > 0) {
            container.innerHTML = '';
            data.orders.forEach(order => {
                container.innerHTML += createOrderCard(order);
            });
        } else {
            container.innerHTML = `
                <div class="bg-white rounded-lg shadow p-8 text-center">
                    <i class="fas fa-inbox text-6xl text-gray-300 mb-4"></i>
                    <h3 class="text-xl font-semibold text-gray-600 mb-2">Belum Ada Pesanan</h3>
                    <p class="text-gray-500">Anda belum memiliki riwayat pesanan.</p>
                    <a href="index.html#layanan" class="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition">
                        <i class="fas fa-plus mr-2"></i> Pesan Sekarang
                    </a>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        container.innerHTML = `
            <div class="bg-red-50 rounded-lg shadow p-8 text-center">
                <i class="fas fa-exclamation-triangle text-4xl text-red-600 mb-4"></i>
                <p class="text-red-600 mb-4">Gagal memuat data pesanan. Pastikan server sedang berjalan.</p>
                <button onclick="loadOrders()" class="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition">
                    <i class="fas fa-sync-alt mr-2"></i> Coba Lagi
                </button>
            </div>
        `;
    }
}

// Load orders on page load
document.addEventListener('DOMContentLoaded', () => {
    loadOrders();
});