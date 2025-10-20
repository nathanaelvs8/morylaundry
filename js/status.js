// API Base URL
const API_URL = 'http://localhost:5000/api';

// Check authentication
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

// Redirect to login if not authenticated
if (!token || !user) {
    alert('Silakan login terlebih dahulu!');
    window.location.href = 'login.html';
} else if (user.role === 'admin') {
    // Admin should go to admin dashboard instead
    window.location.href = 'admin/dashboard.html';
}

// Display user name
document.getElementById('user-name').textContent = user.full_name;

// Logout handler
document.getElementById('logout-btn').addEventListener('click', () => {
    if (confirm('Apakah Anda yakin ingin logout?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    }
});

// Show Alert
function showAlert(message, type = 'error') {
    const alertClass = type === 'success' ? 'alert-success' : 'alert-error';
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    
    document.getElementById('alert-container').innerHTML = `
        <div class="${alertClass}">
            <i class="fas ${icon} text-2xl"></i>
            <span class="font-medium">${message}</span>
        </div>
    `;
    
    setTimeout(() => {
        document.getElementById('alert-container').innerHTML = '';
    }, 5000);
}

// Get status badge class
function getStatusBadge(status) {
    const statusMap = {
        'Antrian': 'status-pending',
        'Proses Cuci': 'status-proses',
        'Proses Kering': 'status-proses',
        'Setrika': 'status-proses',
        'Siap Diambil': 'status-selesai',
        'Selesai': 'status-diambil',
        'Dibatalkan': 'status-dibatalkan'
    };
    
    return statusMap[status] || 'status-pending';
}

// Get status icon
function getStatusIcon(status) {
    const iconMap = {
        'Antrian': 'fa-clock',
        'Proses Cuci': 'fa-water',
        'Proses Kering': 'fa-wind',
        'Setrika': 'fa-fire',
        'Siap Diambil': 'fa-check-circle',
        'Selesai': 'fa-box',
        'Dibatalkan': 'fa-times-circle'
    };
    
    return iconMap[status] || 'fa-clock';
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

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

// Create order card
function createOrderCard(order) {
    const statusClass = getStatusBadge(order.status);
    const statusIcon = getStatusIcon(order.status);
    const entryDate = formatDate(order.entry_date);
    const completedDate = order.completed_date ? formatDate(order.completed_date) : '-';
    
    return `
        <div class="glass-effect rounded-2xl shadow-xl p-6 card-hover order-card">
            <div class="flex flex-col md:flex-row md:justify-between md:items-start mb-6">
                <div class="flex items-center gap-3">
                    <div class="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl text-white">
                        <i class="fas fa-receipt text-2xl"></i>
                    </div>
                    <div>
                        <h3 class="text-2xl font-bold order-number">Pesanan #${order.order_number}</h3>
                        <p class="text-gray-500 text-sm flex items-center gap-2 mt-1">
                            <i class="fas fa-calendar"></i>
                            ${entryDate}
                        </p>
                    </div>
                </div>
                <span class="status-badge ${statusClass} mt-3 md:mt-0">
                    <i class="fas ${statusIcon}"></i>
                    ${order.status}
                </span>
            </div>
            
            <div class="space-y-4">
                <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="flex items-center gap-3">
                            <div class="bg-white p-2 rounded-lg">
                                <i class="fas fa-cog text-blue-500"></i>
                            </div>
                            <div>
                                <div class="text-xs text-gray-500">Layanan</div>
                                <div class="font-semibold text-gray-800">${order.service_name}</div>
                            </div>
                        </div>
                        <div class="flex items-center gap-3">
                            <div class="bg-white p-2 rounded-lg">
                                <i class="fas fa-weight text-purple-500"></i>
                            </div>
                            <div>
                                <div class="text-xs text-gray-500">Jumlah</div>
                                <div class="font-semibold text-gray-800">${order.quantity} ${order.unit}</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="flex items-center justify-between bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-4 text-white">
                    <div class="flex items-center gap-2">
                        <i class="fas fa-money-bill-wave text-2xl"></i>
                        <span class="font-medium">Total Pembayaran</span>
                    </div>
                    <div class="text-2xl font-bold">${formatCurrency(order.total_price)}</div>
                </div>
                
                ${order.notes ? `
                <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-xl">
                    <div class="flex items-start gap-3">
                        <i class="fas fa-sticky-note text-yellow-600 text-lg mt-1"></i>
                        <div>
                            <div class="font-semibold text-yellow-800 mb-1">Catatan</div>
                            <p class="text-yellow-700 text-sm">${order.notes}</p>
                        </div>
                    </div>
                </div>
                ` : ''}
                
                ${order.completed_date ? `
                <div class="flex items-center justify-between text-sm bg-green-50 p-3 rounded-xl">
                    <span class="text-green-600 font-medium flex items-center gap-2">
                        <i class="fas fa-check-circle"></i>
                        Diselesaikan pada
                    </span>
                    <span class="text-green-800 font-semibold">${completedDate}</span>
                </div>
                ` : ''}
            </div>
        </div>
    `;
}

// Update stats
function updateStats(orders) {
    const stats = {
        pending: 0,
        proses: 0,
        selesai: 0,
        diambil: 0
    };
    
    orders.forEach(order => {
        if (order.status === 'Antrian') stats.pending++;
        else if (['Proses Cuci', 'Proses Kering', 'Setrika'].includes(order.status)) stats.proses++;
        else if (order.status === 'Siap Diambil') stats.selesai++;
        else if (order.status === 'Selesai') stats.diambil++;
    });
    
    document.getElementById('total-orders').textContent = orders.length;
    document.getElementById('stat-pending').textContent = stats.pending;
    document.getElementById('stat-proses').textContent = stats.proses;
    document.getElementById('stat-selesai').textContent = stats.selesai;
    document.getElementById('stat-diambil').textContent = stats.diambil;
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
            updateStats(data.orders);
            container.innerHTML = '';
            data.orders.forEach(order => {
                container.innerHTML += createOrderCard(order);
            });
        } else {
            document.getElementById('total-orders').textContent = '0';
            container.innerHTML = `
                <div class="glass-effect rounded-2xl shadow-xl p-12 text-center empty-state">
                    <div class="empty-state-icon">
                        <i class="fas fa-inbox"></i>
                    </div>
                    <h3 class="text-2xl font-bold text-gray-700 mb-2">Belum Ada Pesanan</h3>
                    <p class="text-gray-500 mb-6">Anda belum memiliki riwayat pesanan laundry</p>
                    <a href="index.html#layanan" class="inline-flex items-center space-x-3 btn-gradient text-white px-8 py-4 rounded-xl font-semibold">
                        <i class="fas fa-plus text-xl"></i>
                        <span>Buat Pesanan Pertama</span>
                    </a>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        container.innerHTML = `
            <div class="glass-effect rounded-2xl shadow-xl p-12 text-center">
                <div class="bg-gradient-to-br from-red-500 to-pink-600 p-6 rounded-full inline-block mb-4">
                    <i class="fas fa-exclamation-triangle text-5xl text-white"></i>
                </div>
                <h3 class="text-2xl font-bold text-red-600 mb-3">Gagal Memuat Data</h3>
                <p class="text-gray-600 mb-6">Tidak dapat terhubung ke server. Pastikan server sedang berjalan.</p>
                <button onclick="loadOrders()" class="inline-flex items-center space-x-3 bg-gradient-to-r from-red-500 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition">
                    <i class="fas fa-sync-alt text-xl"></i>
                    <span>Coba Lagi</span>
                </button>
            </div>
        `;
    }
}

// Load orders on page load
document.addEventListener('DOMContentLoaded', () => {
    loadOrders();
});