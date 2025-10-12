// API Base URL
const API_URL = 'http://localhost:5000/api';

// Check authentication
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

if (!token || !user || user.role !== 'admin') {
    window.location.href = '../login.html';
}

// Display admin name
document.getElementById('admin-name').textContent = `Admin: ${user.full_name}`;
document.getElementById('admin-name').classList.remove('hidden');

// Logout handler
document.getElementById('logout-btn').addEventListener('click', () => {
    if (confirm('Apakah Anda yakin ingin logout?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '../login.html';
    }
});

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('id-ID', options);
}

// Get status badge
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

// Load statistics
async function loadStatistics() {
    try {
        const response = await fetch(`${API_URL}/orders`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            const orders = data.orders;
            const totalOrders = orders.length;
            const activeOrders = orders.filter(o => 
                !['Selesai', 'Dibatalkan'].includes(o.status)
            ).length;
            
            const today = new Date().toDateString();
            const completedToday = orders.filter(o => 
                o.completed_date && new Date(o.completed_date).toDateString() === today
            ).length;
            
            document.getElementById('total-orders').textContent = totalOrders;
            document.getElementById('active-orders').textContent = activeOrders;
            document.getElementById('completed-today').textContent = completedToday;
        }
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

// Load customers count
async function loadCustomersCount() {
    try {
        const response = await fetch(`${API_URL}/orders/admin/customers`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('total-customers').textContent = data.customers.length;
        }
    } catch (error) {
        console.error('Error loading customers:', error);
    }
}

// Load recent orders
async function loadRecentOrders() {
    const container = document.getElementById('recent-orders-container');
    
    try {
        const response = await fetch(`${API_URL}/orders`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (data.success && data.orders.length > 0) {
            const recentOrders = data.orders.slice(0, 5);
            
            container.innerHTML = `
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-100">
                            <tr>
                                <th class="px-4 py-2 text-left text-gray-600">No. Pesanan</th>
                                <th class="px-4 py-2 text-left text-gray-600">Pelanggan</th>
                                <th class="px-4 py-2 text-left text-gray-600">Layanan</th>
                                <th class="px-4 py-2 text-left text-gray-600">Total</th>
                                <th class="px-4 py-2 text-left text-gray-600">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${recentOrders.map(order => `
                                <tr class="border-b hover:bg-gray-50">
                                    <td class="px-4 py-3 font-semibold">${order.order_number}</td>
                                    <td class="px-4 py-3">${order.customer_name}</td>
                                    <td class="px-4 py-3">${order.service_name}</td>
                                    <td class="px-4 py-3 font-semibold">Rp ${order.total_price.toLocaleString('id-ID')}</td>
                                    <td class="px-4 py-3">
                                        <span class="px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(order.status)}">
                                            ${order.status}
                                        </span>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                <div class="mt-4 text-center">
                    <a href="pesanan.html" class="text-blue-600 hover:underline font-semibold">
                        Lihat Semua Pesanan <i class="fas fa-arrow-right ml-1"></i>
                    </a>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-inbox text-4xl mb-2"></i>
                    <p>Belum ada pesanan</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading recent orders:', error);
        container.innerHTML = `
            <div class="text-center py-8 text-red-500">
                <i class="fas fa-exclamation-triangle text-4xl mb-2"></i>
                <p>Gagal memuat data pesanan</p>
            </div>
        `;
    }
}

// Load all data on page load
document.addEventListener('DOMContentLoaded', () => {
    loadStatistics();
    loadCustomersCount();
    loadRecentOrders();
});