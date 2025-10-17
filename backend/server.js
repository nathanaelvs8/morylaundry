const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");
require("dotenv").config();

// Import database
const db = require("./config/db");

// Import controllers
const authController = require("./controllers/authController");
const orderController = require("./controllers/orderController");

const PORT = process.env.PORT || 5000;

// Helper function untuk parse request body
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

// Helper function untuk send JSON response
function sendResponse(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  });
  res.end(JSON.stringify(data));
}

// Helper function untuk serve file HTML/JS/CSS
function serveFile(res, filePath) {
  const ext = path.extname(filePath);
  const contentType = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".css": "text/css"
  }[ext] || "text/plain";

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/html" });
      res.end("<h1>404 - File not found</h1>");
    } else {
      res.writeHead(200, { "Content-Type": contentType });
      res.end(data);
    }
  });
}

// Create server
const server = http.createServer(async (req, res) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    res.writeHead(200, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    });
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  try {
    // ============ SERVE FRONTEND FILES ============
    
    if (pathname === "/" && method === "GET") {
      serveFile(res, path.join(__dirname, "../frontend/index.html"));
      return;
    }

    if (pathname.endsWith(".html") && method === "GET") {
      serveFile(res, path.join(__dirname, "../frontend", pathname));
      return;
    }

    if (pathname.startsWith("/js/") && method === "GET") {
      serveFile(res, path.join(__dirname, "../frontend", pathname));
      return;
    }

    if (pathname.endsWith(".css") && method === "GET") {
      serveFile(res, path.join(__dirname, "../frontend", pathname));
      return;
    }

    // ============ API ROUTES ============

    // AUTH
    if (pathname === "/api/auth/register" && method === "POST") {
      const body = await parseBody(req);
      await authController.register(req, res, body, sendResponse);
      return;
    }

    if (pathname === "/api/auth/login" && method === "POST") {
      const body = await parseBody(req);
      await authController.login(req, res, body, sendResponse);
      return;
    }

    if (pathname === "/api/auth/profile" && method === "GET") {
      await authController.getProfile(req, res, sendResponse);
      return;
    }

    // ORDERS
    if (pathname === "/api/orders/public/services" && method === "GET") {
      await orderController.getServices(req, res, sendResponse);
      return;
    }

    if (pathname === "/api/orders" && method === "POST") {
      const body = await parseBody(req);
      await orderController.createOrder(req, res, body, sendResponse);
      return;
    }

    if (pathname === "/api/orders" && method === "GET") {
      await orderController.getOrders(req, res, sendResponse);
      return;
    }

    if (pathname.match(/^\/api\/orders\/\d+$/) && method === "GET") {
      const id = pathname.split("/")[3];
      await orderController.getOrderById(req, res, id, sendResponse);
      return;
    }

    if (pathname.match(/^\/api\/orders\/\d+$/) && method === "PUT") {
      const id = pathname.split("/")[3];
      const body = await parseBody(req);
      await orderController.updateOrder(req, res, id, body, sendResponse);
      return;
    }

    if (pathname.match(/^\/api\/orders\/\d+$/) && method === "DELETE") {
      const id = pathname.split("/")[3];
      await orderController.deleteOrder(req, res, id, sendResponse);
      return;
    }

    if (pathname === "/api/orders/admin/customers" && method === "GET") {
      await orderController.getCustomers(req, res, sendResponse);
      return;
    }

    // 404
    sendResponse(res, 404, {
      success: false,
      message: "Endpoint tidak ditemukan"
    });

  } catch (error) {
    console.error("Server error:", error);
    sendResponse(res, 500, {
      success: false,
      message: "Terjadi kesalahan pada server"
    });
  }
});

// Start server
server.listen(PORT, () => {
  console.log("Server berjalan di http://localhost:" + PORT);
});