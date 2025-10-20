const jwt = require("jsonwebtoken");
const { readJSON, writeJSON, getNextId } = require("../config/db-json");

// Helper token
function verifyToken(req) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return null;
  const token = authHeader.split(" ")[1];
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

function generateOrderNumber() {
  const d = new Date();
  return `ML${d.getFullYear().toString().slice(-2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(
    d.getDate()
  ).padStart(2, "0")}${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`;
}

// Create order (admin only)
async function createOrder(req, res, body, sendResponse) {
  const decoded = verifyToken(req);
  if (!decoded) return sendResponse(res, 401, { success: false, message: "Token tidak valid" });
  if (decoded.role !== "admin")
    return sendResponse(res, 403, { success: false, message: "Hanya admin yang diizinkan" });

  const { user_id, customer_name, phone_number, service_id, quantity, notes } = body;
  const services = readJSON("services.json");
  const users = readJSON("users.json");
  const orders = readJSON("orders.json");

  const service = services.find((s) => s.id === Number(service_id));
  if (!service) return sendResponse(res, 404, { success: false, message: "Layanan tidak ditemukan" });

  const user = users.find((u) => u.id === Number(user_id));
  if (!user) return sendResponse(res, 404, { success: false, message: "User tidak ditemukan" });

  const total_price = service.price * (quantity || 1);
  const order_number = generateOrderNumber();

  const newOrder = {
    id: getNextId(orders),
    user_id,
    order_number,
    customer_name,
    phone_number: phone_number || "",
    service_id,
    quantity: quantity || 1,
    total_price,
    notes: notes || "",
    status: "Antrian",
    entry_date: new Date().toISOString(),
  };

  orders.push(newOrder);
  writeJSON("orders.json", orders);

  sendResponse(res, 201, { success: true, message: "Pesanan dibuat", order: newOrder });
}

// Get orders
async function getOrders(req, res, sendResponse) {
  const decoded = verifyToken(req);
  if (!decoded) return sendResponse(res, 401, { success: false, message: "Token tidak valid" });

  const orders = readJSON("orders.json");
  const services = readJSON("services.json");
  const users = readJSON("users.json");

  let result = orders.map((o) => {
    const service = services.find((s) => s.id === o.service_id) || {};
    const user = users.find((u) => u.id === o.user_id) || {};

    return {
      id: o.id,
      user_id: o.user_id, // 🔥 tambahkan ini
      order_number: o.order_number,
      customer_name: o.customer_name,
      user_full_name: user.full_name || user.username || "Tidak diketahui",
      service_name: service.service_name || "Tidak diketahui",
      unit: service.unit || "",
      quantity: o.quantity,
      total_price: o.total_price,
      status: o.status,
      entry_date: o.entry_date,
    };
  });


  if (decoded.role !== "admin") {
    result = result.filter((o) => o.user_id === decoded.id);
  }

  sendResponse(res, 200, { success: true, orders: result });
}

// Get single order by ID
async function getOrderById(req, res, id, sendResponse) {
  const decoded = verifyToken(req);
  if (!decoded) return sendResponse(res, 401, { success: false, message: "Token tidak valid" });

  const orders = readJSON("orders.json");
  const services = readJSON("services.json");
  const users = readJSON("users.json");

  const order = orders.find((o) => o.id === Number(id));
  if (!order) return sendResponse(res, 404, { success: false, message: "Pesanan tidak ditemukan" });

  const service = services.find((s) => s.id === order.service_id) || {};
  const user = users.find((u) => u.id === order.user_id) || {};

  const orderDetail = {
    ...order,
    user_id: order.user_id,         // 🔥 penting
    service_id: order.service_id,   // 🔥 penting
    user_full_name: user.full_name || user.username || "Tidak diketahui",
    service_name: service.service_name || "Tidak diketahui",
    unit: service.unit || "",
  };


  sendResponse(res, 200, { success: true, order: orderDetail });
}


// Update order
async function updateOrder(req, res, id, body, sendResponse) {
  const decoded = verifyToken(req);
  if (!decoded) return sendResponse(res, 401, { success: false, message: "Token tidak valid" });
  if (decoded.role !== "admin")
    return sendResponse(res, 403, { success: false, message: "Hanya admin yang diizinkan" });

  const orders = readJSON("orders.json");
  const orderIndex = orders.findIndex((o) => o.id === Number(id));
  if (orderIndex === -1)
    return sendResponse(res, 404, { success: false, message: "Pesanan tidak ditemukan" });

  const services = readJSON("services.json");

  let updated = { ...orders[orderIndex], ...body };
  if (body.service_id || body.quantity) {
    const service = services.find((s) => s.id === Number(updated.service_id));
    if (service) {
      updated.total_price = service.price * (updated.quantity || 1);
    }
  }

  orders[orderIndex] = updated;
  writeJSON("orders.json", orders);
  sendResponse(res, 200, { success: true, message: "Pesanan diupdate" });
}

// Delete
async function deleteOrder(req, res, id, sendResponse) {
  const decoded = verifyToken(req);
  if (!decoded) return sendResponse(res, 401, { success: false, message: "Token tidak valid" });
  if (decoded.role !== "admin")
    return sendResponse(res, 403, { success: false, message: "Hanya admin yang diizinkan" });

  let orders = readJSON("orders.json");
  const before = orders.length;
  orders = orders.filter((o) => o.id !== Number(id));
  if (before === orders.length)
    return sendResponse(res, 404, { success: false, message: "Pesanan tidak ditemukan" });

  writeJSON("orders.json", orders);
  sendResponse(res, 200, { success: true, message: "Pesanan dihapus" });
}

// Get services
async function getServices(req, res, sendResponse) {
  const services = readJSON("services.json").filter((s) => s.is_active);
  sendResponse(res, 200, { success: true, services });
}

// Get customers (admin only)
async function getCustomers(req, res, sendResponse) {
  const decoded = verifyToken(req);
  if (!decoded) return sendResponse(res, 401, { success: false, message: "Token tidak valid" });
  if (decoded.role !== "admin")
    return sendResponse(res, 403, { success: false, message: "Hanya admin yang diizinkan" });

  const users = readJSON("users.json").filter((u) => u.role === "pelanggan");
  const orders = readJSON("orders.json");

  const customers = users.map((u) => ({
    ...u,
    total_orders: orders.filter((o) => o.user_id === u.id).length,
  }));

  sendResponse(res, 200, { success: true, customers });
}

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  getServices,
  getCustomers,
};
