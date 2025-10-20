const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");
require("dotenv").config();

// Import controllers
const authController = require("./controllers/authController");
const orderController = require("./controllers/orderController");

const PORT = process.env.PORT || 5000;

// Parse body JSON
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
  });
}

// Kirim JSON response
function sendResponse(res, status, data) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });
  res.end(JSON.stringify(data));
}

// Serve file
function serveFile(res, filePath) {
  const ext = path.extname(filePath);
  const contentType = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".css": "text/css",
  }[ext] || "text/plain";

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/html" });
      res.end("<h1>404 File not found</h1>");
    } else {
      res.writeHead(200, { "Content-Type": contentType });
      res.end(data);
    }
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(200, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    });
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  try {
    // ========== FRONTEND ==========
    if (pathname === "/" && method === "GET") {
      serveFile(res, path.join(__dirname, "index.html"));
      return;
    }

    if (pathname.endsWith(".html") || pathname.endsWith(".css") || pathname.endsWith(".js")) {
      serveFile(res, path.join(__dirname, pathname));
      return;
    }

    // ========== AUTH API ==========
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

    // ========== ORDER API ==========
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

    if (pathname.match(/^\/api\/orders\/[\w-]+$/) && method === "GET") {
      const id = pathname.split("/")[3];
      await orderController.getOrderById(req, res, id, sendResponse);
      return;
    }

    if (pathname.match(/^\/api\/orders\/[\w-]+$/) && method === "PUT") {
      const id = pathname.split("/")[3];
      const body = await parseBody(req);
      await orderController.updateOrder(req, res, id, body, sendResponse);
      return;
    }

    if (pathname.match(/^\/api\/orders\/[\w-]+$/) && method === "DELETE") {
      const id = pathname.split("/")[3];
      await orderController.deleteOrder(req, res, id, sendResponse);
      return;
    }

    if (pathname === "/api/orders/admin/customers" && method === "GET") {
      await orderController.getCustomers(req, res, sendResponse);
      return;
    }

    sendResponse(res, 404, { success: false, message: "Endpoint tidak ditemukan" });
  } catch (err) {
    console.error("Server error:", err);
    sendResponse(res, 500, { success: false, message: "Terjadi kesalahan di server" });
  }
});

server.listen(PORT, () => {
  console.log(`✅ Server jalan di http://localhost:${PORT}`);
});
