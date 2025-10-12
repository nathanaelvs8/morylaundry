const http = require('http');
const url = require('url');
require('dotenv').config();

// Import controllers
const authController = require('./controllers/authController');
const orderController = require('./controllers/orderController');

const PORT = process.env.PORT || 5000;

// Helper function untuk parse request body
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

// Helper function untuk send response
function sendResponse(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

// Create HTTP Server
const server = http.createServer(async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  try {
    // ============ AUTH ROUTES ============
    
    // POST /api/auth/register
    if (pathname === '/api/auth/register' && method === 'POST') {
      const body = await parseBody(req);
      await authController.register(req, res, body, sendResponse);
      return;
    }

    // POST /api/auth/login
    if (pathname === '/api/auth/login' && method === 'POST') {
      const body = await parseBody(req);
      await authController.login(req, res, body, sendResponse);
      return;
    }

    // GET /api/auth/profile
    if (pathname === '/api/auth/profile' && method === 'GET') {
      await authController.getProfile(req, res, sendResponse);
      return;
    }

    // ============ ORDER ROUTES ============
    
    // GET /api/orders/public/services
    if (pathname === '/api/orders/public/services' && method === 'GET') {
      await orderController.getServices(req, res, sendResponse);
      return;
    }

    // POST /api/orders
    if (pathname === '/api/orders' && method === 'POST') {
      const body = await parseBody(req);
      await orderController.createOrder(req, res, body, sendResponse);
      return;
    }

    // GET /api/orders
    if (pathname === '/api/orders' && method === 'GET') {
      await orderController.getOrders(req, res, sendResponse);
      return;
    }

    // GET /api/orders/:id
    if (pathname.match(/^\/api\/orders\/\d+$/) && method === 'GET') {
      const id = pathname.split('/')[3];
      await orderController.getOrderById(req, res, id, sendResponse);
      return;
    }

    // PUT /api/orders/:id
    if (pathname.match(/^\/api\/orders\/\d+$/) && method === 'PUT') {
      const id = pathname.split('/')[3];
      const body = await parseBody(req);
      await orderController.updateOrder(req, res, id, body, sendResponse);
      return;
    }

    // DELETE /api/orders/:id
    if (pathname.match(/^\/api\/orders\/\d+$/) && method === 'DELETE') {
      const id = pathname.split('/')[3];
      await orderController.deleteOrder(req, res, id, sendResponse);
      return;
    }

    // GET /api/orders/admin/customers
    if (pathname === '/api/orders/admin/customers' && method === 'GET') {
      await orderController.getCustomers(req, res, sendResponse);
      return;
    }

    // ============ ROOT ENDPOINT ============
    if (pathname === '/' && method === 'GET') {
      sendResponse(res, 200, {
        message: 'Mory Laundry API Server',
        version: '1.0.0',
        endpoints: {
          auth: '/api/auth',
          orders: '/api/orders'
        }
      });
      return;
    }

    // ============ 404 NOT FOUND ============
    sendResponse(res, 404, {
      success: false,
      message: 'Endpoint tidak ditemukan'
    });

  } catch (error) {
    console.error('Server error:', error);
    sendResponse(res, 500, {
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API URL: http://localhost:${PORT}`);
});