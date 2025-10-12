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

// Modal elements
const modal = document.getElementById('order-modal');
const addOrderBtn = document.getElementById('add-order-btn');
const cancelModalBtn = document.getElementById('cancel-modal-btn');
const orderForm = document.getElementById('order-form');
const modalTitle = document.getElementById('modal-title');

// Show alert
function showAlert(message, type = 'error') {
    const bgColor = type === 'success' ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-100 text-red-800 border-red-300';
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    
    document.getElementById('alert-container').innerHTML = `
        <div class="${bgColor} border px-4 py-3 rounded-lg flex items-center">
            <i class="fas ${icon} mr-3"></i>
            <span>${message}</span>
        </div>
    `;
    
    setTimeout(() => {
        document.getElementById('alert-container').innerHTML = '';
    }, 5000);
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
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

// Open modal for adding new order
addOrderBtn.addEventListener('click', () => {
    modalTitle.textContent = 'Tambah Pesanan Baru';
    document.getElementById('order-id').value = '';
    document.getElementById('status-field').classList.add('hidden');
    orderForm.reset();
    modal.classList.add('active');
    loadCustomersSelect();
    loadServicesSelect();
});

// Close modal
cancelModalBtn.addEventListener('click', () => {
    modal.classList.remove('active');
});

// Close modal when clicking outside
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.remove('active');
    }
});

// Load customers for select dropdown
async function loadCustomersSelect() {
    try {
        const response = await fetch(`${API_URL}/orders/admin/customers`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            const select = document.getElementById('user-id');
            select.innerHTML = '<option value="">Pilih Pelanggan...</option>';
            
            data.customers.forEach(customer => {
                select.innerHTML += `<option value="${customer.id}">${customer.full_name} (${customer.username})</option>`;
            });
        }
    } catch (error) {
        console.error('Error loading customers:', error);
    }
}

// Load services for select dropdown
async function loadServicesSelect() {
    try {
        const response = await fetch(`${API_URL}/orders/public/services`);
        const data = await response.json();
        
        if (data.success) {
            const select = document.getElementById('service-id');
            select.innerHTML = '<option value="">Pilih Layanan...</option>';
            
            data.services.forEach(service => {
                select.innerHTML += `<option value="${service.id}">${service.service_name} - Rp ${service.price.toLocaleString('id-ID')} / ${service.unit}</option>`;
            });
        }
    } catch (error) {
        console.error('Error loading services:', error);
    }
}

// Load all orders
async function loadOrders() {
    const tbody = document.getElementById('orders-table-body');
    
    try {
        const response = await fetch(`${API_URL}/orders`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (data.success && data.orders.length > 0) {
            tbody.innerHTML = data.orders.map(order => `
                <tr class="border-b hover:bg-gray-50">
                    <td class="px-4 py-3 font-semibold">${order.order_number}</td>
                    <td class="px-4 py-3">
                        ${order.customer_name}<br>
                        <span class="text-sm text-gray-500">${order.user_full_name || ''}</span>
                    </td>
                    <td class="px-4 py-3">
                        ${order.service_name}<br>
                        <span class="text-sm text-gray-500">${order.quantity} ${order.unit}</span>
                    </td>
                    <td class="px-4 py-3 font-semibold text-blue-600">
                        Rp ${order.total_price.toLocaleString('id-ID')}
                    </td>
                    <td class="px-4 py-3">
                        <span class="px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(order.status)}">
                            ${order.status}
                        </span>
                    </td>
                    <td class="px-4 py-3 text-sm">${formatDate(order.entry_date)}</td>
                    <td class="px-4 py-3">
                        <div class="flex justify-center space-x-2">
                            <button onclick="editOrder(${order.id})" class="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded transition" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="deleteOrder(${order.id}, '${order.order_number}')" class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition" title="Hapus">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        } else {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="px-4 py-8 text-center text-gray-500">
                        <i class="fas fa-inbox text-4xl mb-2"></i>
                        <p>Belum ada pesanan</p>
                    </td>
                </tr>
            `;
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="px-4 py-8 text-center text-red-500">
                    <i class="fas fa-exclamation-triangle text-4xl mb-2"></i>
                    <p>Gagal memuat data pesanan</p>
                </td>
            </tr>
        `;
    }
}

// Edit order
async function editOrder(orderId) {
    try {
        const response = await fetch(`${API_URL}/orders/${orderId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            const order = data.order;
            
            modalTitle.textContent = 'Edit Pesanan';
            document.getElementById('order-id').value = order.id;
            document.getElementById('user-id').value = order.user_id;
            document.getElementById('customer-name').value = order.customer_name;
            document.getElementById('phone-number').value = order.phone_number || '';
            document.getElementById('service-id').value = order.service_id;
            document.getElementById('quantity').value = order.quantity;
            document.getElementById('status').value = order.status;
            document.getElementById('notes').value = order.notes || '';
            
            document.getElementById('status-field').classList.remove('hidden');
            
            await loadCustomersSelect();
            await loadServicesSelect();
            
            document.getElementById('user-id').value = order.user_id;
            document.getElementById('service-id').value = order.service_id;
            
            modal.classList.add('active');
        }
    } catch (error) {
        console.error('Error loading order:', error);
        showAlert('Gagal memuat data pesanan');
    }
}

// Delete order
async function deleteOrder(orderId, orderNumber) {
    if (!confirm(`Apakah Anda yakin ingin menghapus pesanan ${orderNumber}?`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/orders/${orderId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert('Pesanan berhasil dihapus', 'success');
            loadOrders();
        } else {
            showAlert(data.message || 'Gagal menghapus pesanan');
        }
    } catch (error) {
        console.error('Error deleting order:', error);
        showAlert('Terjadi kesalahan saat menghapus pesanan');
    }
}

// Submit order form
orderForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const orderId = document.getElementById('order-id').value;
    const formData = {
        user_id: document.getElementById('user-id').value,
        customer_name: document.getElementById('customer-name').value,
        phone_number: document.getElementById('phone-number').value || null,
        service_id: document.getElementById('service-id').value,
        quantity: parseFloat(document.getElementById('quantity').value),
        notes: document.getElementById('notes').value || null
    };
    
    if (orderId) {
        formData.status = document.getElementById('status').value;
    }
    
    const saveBtn = document.getElementById('save-order-btn');
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Menyimpan...';
    
    try {
        const url = orderId ? `${API_URL}/orders/${orderId}` : `${API_URL}/orders`;
        const method = orderId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert(orderId ? 'Pesanan berhasil diupdate' : 'Pesanan berhasil ditambahkan', 'success');
            modal.classList.remove('active');
            loadOrders();
        } else {
            showAlert(data.message || 'Gagal menyimpan pesanan');
        }
    } catch (error) {
        console.error('Error saving order:', error);
        showAlert('Terjadi kesalahan saat menyimpan pesanan');
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fas fa-save mr-2"></i> Simpan';
    }
});

// Make functions globally accessible
window.editOrder = editOrder;
window.deleteOrder = deleteOrder;

// Load orders on page load
document.addEventListener('DOMContentLoaded', () => {
    loadOrders();
});