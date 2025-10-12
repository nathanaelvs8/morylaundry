const db = require('../config/db');
const jwt = require('jsonwebtoken');

// Helper untuk verifikasi token
function verifyToken(req) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return null;
  
  const token = authHeader.split(' ')[1];
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Generate nomor pesanan unik
function generateOrderNumber() {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ML${year}${month}${day}${random}`;
}

// Create pesanan baru (Admin only)
async function createOrder(req, res, body, sendResponse) {
  const decoded = verifyToken(req);

  if (!decoded) {
    return sendResponse(res, 401, {
      success: false,
      message: 'Token tidak valid. Silakan login terlebih dahulu.'
    });
  }

  if (decoded.role !== 'admin') {
    return sendResponse(res, 403, {
      success: false,
      message: 'Akses ditolak. Hanya admin yang diizinkan.'
    });
  }

  const { user_id, customer_name, phone_number, service_id, quantity, notes } = body;

  if (!user_id || !customer_name || !service_id) {
    return sendResponse(res, 400, {
      success: false,
      message: 'user_id, customer_name, dan service_id harus diisi'
    });
  }

  try {
    // Ambil data service untuk hitung total harga
    const [services] = await db.query(
      'SELECT price FROM services WHERE id = ?',
      [service_id]
    );

    if (services.length === 0) {
      return sendResponse(res, 404, {
        success: false,
        message: 'Layanan tidak ditemukan.'
      });
    }

    const total_price = services[0].price * (quantity || 1);
    const order_number = generateOrderNumber();

    const [result] = await db.query(
      `INSERT INTO orders (user_id, order_number, customer_name, phone_number, service_id, quantity, total_price, notes, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, order_number, customer_name, phone_number || null, service_id, quantity || 1, total_price, notes || null, 'Antrian']
    );

    sendResponse(res, 201, {
      success: true,
      message: 'Pesanan berhasil dibuat.',
      orderId: result.insertId,
      orderNumber: order_number
    });

  } catch (error) {
    console.error('Create order error:', error);
    sendResponse(res, 500, {
      success: false,
      message: 'Terjadi kesalahan saat membuat pesanan.'
    });
  }
}

// Get semua pesanan (Admin) atau pesanan user tertentu (Pelanggan)
async function getOrders(req, res, sendResponse) {
  const decoded = verifyToken(req);

  if (!decoded) {
    return sendResponse(res, 401, {
      success: false,
      message: 'Token tidak valid. Silakan login terlebih dahulu.'
    });
  }

  try {
    let query = `
      SELECT o.*, s.service_name, s.unit, u.full_name as user_full_name
      FROM orders o
      LEFT JOIN services s ON o.service_id = s.id
      LEFT JOIN users u ON o.user_id = u.id
    `;
    let params = [];

    // Jika bukan admin, hanya tampilkan pesanan milik user tersebut
    if (decoded.role !== 'admin') {
      query += ' WHERE o.user_id = ?';
      params.push(decoded.id);
    }

    query += ' ORDER BY o.entry_date DESC';

    const [orders] = await db.query(query, params);

    sendResponse(res, 200, {
      success: true,
      orders
    });

  } catch (error) {
    console.error('Get orders error:', error);
    sendResponse(res, 500, {
      success: false,
      message: 'Terjadi kesalahan saat mengambil data pesanan.'
    });
  }
}

// Get detail pesanan berdasarkan ID
async function getOrderById(req, res, id, sendResponse) {
  const decoded = verifyToken(req);

  if (!decoded) {
    return sendResponse(res, 401, {
      success: false,
      message: 'Token tidak valid. Silakan login terlebih dahulu.'
    });
  }

  try {
    const [orders] = await db.query(
      `SELECT o.*, s.service_name, s.unit, s.price, u.full_name as user_full_name
       FROM orders o
       LEFT JOIN services s ON o.service_id = s.id
       LEFT JOIN users u ON o.user_id = u.id
       WHERE o.id = ?`,
      [id]
    );

    if (orders.length === 0) {
      return sendResponse(res, 404, {
        success: false,
        message: 'Pesanan tidak ditemukan.'
      });
    }

    const order = orders[0];

    // Jika bukan admin, cek apakah pesanan milik user tersebut
    if (decoded.role !== 'admin' && order.user_id !== decoded.id) {
      return sendResponse(res, 403, {
        success: false,
        message: 'Anda tidak memiliki akses ke pesanan ini.'
      });
    }

    sendResponse(res, 200, {
      success: true,
      order
    });

  } catch (error) {
    console.error('Get order by ID error:', error);
    sendResponse(res, 500, {
      success: false,
      message: 'Terjadi kesalahan saat mengambil detail pesanan.'
    });
  }
}

// Update pesanan (Admin only)
async function updateOrder(req, res, id, body, sendResponse) {
  const decoded = verifyToken(req);

  if (!decoded) {
    return sendResponse(res, 401, {
      success: false,
      message: 'Token tidak valid. Silakan login terlebih dahulu.'
    });
  }

  if (decoded.role !== 'admin') {
    return sendResponse(res, 403, {
      success: false,
      message: 'Akses ditolak. Hanya admin yang diizinkan.'
    });
  }

  const { customer_name, phone_number, service_id, quantity, status, notes } = body;

  try {
    // Cek apakah pesanan ada
    const [existingOrder] = await db.query('SELECT * FROM orders WHERE id = ?', [id]);
    
    if (existingOrder.length === 0) {
      return sendResponse(res, 404, {
        success: false,
        message: 'Pesanan tidak ditemukan.'
      });
    }

    let updateFields = [];
    let updateValues = [];

    if (customer_name) {
      updateFields.push('customer_name = ?');
      updateValues.push(customer_name);
    }
    if (phone_number !== undefined) {
      updateFields.push('phone_number = ?');
      updateValues.push(phone_number);
    }
    if (service_id) {
      updateFields.push('service_id = ?');
      updateValues.push(service_id);
      
      // Hitung ulang total harga
      const [services] = await db.query('SELECT price FROM services WHERE id = ?', [service_id]);
      if (services.length > 0) {
        const qty = quantity || existingOrder[0].quantity;
        updateFields.push('total_price = ?');
        updateValues.push(services[0].price * qty);
      }
    }
    if (quantity) {
      updateFields.push('quantity = ?');
      updateValues.push(quantity);
      
      // Hitung ulang total harga jika quantity berubah
      if (!service_id) {
        const [services] = await db.query('SELECT price FROM services WHERE id = ?', [existingOrder[0].service_id]);
        if (services.length > 0) {
          updateFields.push('total_price = ?');
          updateValues.push(services[0].price * quantity);
        }
      }
    }
    if (status) {
      updateFields.push('status = ?');
      updateValues.push(status);
      
      // Set completed_date jika status = Selesai
      if (status === 'Selesai') {
        updateFields.push('completed_date = NOW()');
      }
    }
    if (notes !== undefined) {
      updateFields.push('notes = ?');
      updateValues.push(notes);
    }

    if (updateFields.length === 0) {
      return sendResponse(res, 400, {
        success: false,
        message: 'Tidak ada data yang diubah.'
      });
    }

    updateValues.push(id);
    const query = `UPDATE orders SET ${updateFields.join(', ')} WHERE id = ?`;

    await db.query(query, updateValues);

    sendResponse(res, 200, {
      success: true,
      message: 'Pesanan berhasil diupdate.'
    });

  } catch (error) {
    console.error('Update order error:', error);
    sendResponse(res, 500, {
      success: false,
      message: 'Terjadi kesalahan saat mengupdate pesanan.'
    });
  }
}

// Delete pesanan (Admin only)
async function deleteOrder(req, res, id, sendResponse) {
  const decoded = verifyToken(req);

  if (!decoded) {
    return sendResponse(res, 401, {
      success: false,
      message: 'Token tidak valid. Silakan login terlebih dahulu.'
    });
  }

  if (decoded.role !== 'admin') {
    return sendResponse(res, 403, {
      success: false,
      message: 'Akses ditolak. Hanya admin yang diizinkan.'
    });
  }

  try {
    const [result] = await db.query('DELETE FROM orders WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return sendResponse(res, 404, {
        success: false,
        message: 'Pesanan tidak ditemukan.'
      });
    }

    sendResponse(res, 200, {
      success: true,
      message: 'Pesanan berhasil dihapus.'
    });

  } catch (error) {
    console.error('Delete order error:', error);
    sendResponse(res, 500, {
      success: false,
      message: 'Terjadi kesalahan saat menghapus pesanan.'
    });
  }
}

// Get all services (Public endpoint)
async function getServices(req, res, sendResponse) {
  try {
    const [services] = await db.query(
      'SELECT * FROM services WHERE is_active = TRUE ORDER BY id'
    );

    sendResponse(res, 200, {
      success: true,
      services
    });

  } catch (error) {
    console.error('Get services error:', error);
    sendResponse(res, 500, {
      success: false,
      message: 'Terjadi kesalahan saat mengambil data layanan.'
    });
  }
}

// Get all customers (Admin only)
async function getCustomers(req, res, sendResponse) {
  const decoded = verifyToken(req);

  if (!decoded) {
    return sendResponse(res, 401, {
      success: false,
      message: 'Token tidak valid. Silakan login terlebih dahulu.'
    });
  }

  if (decoded.role !== 'admin') {
    return sendResponse(res, 403, {
      success: false,
      message: 'Akses ditolak. Hanya admin yang diizinkan.'
    });
  }

  try {
    const [customers] = await db.query(
      `SELECT id, full_name, username, created_at,
       (SELECT COUNT(*) FROM orders WHERE user_id = users.id) as total_orders
       FROM users WHERE role = 'pelanggan' ORDER BY created_at DESC`
    );

    sendResponse(res, 200, {
      success: true,
      customers
    });

  } catch (error) {
    console.error('Get customers error:', error);
    sendResponse(res, 500, {
      success: false,
      message: 'Terjadi kesalahan saat mengambil data pelanggan.'
    });
  }
}

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  getServices,
  getCustomers
};