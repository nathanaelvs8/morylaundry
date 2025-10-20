const fs = require("fs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { readJSON, writeJSON, getNextId } = require("../config/db-json");

// Helper verifikasi token
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

// Register user baru
async function register(req, res, body, sendResponse) {
  const { full_name, username, password } = body;
  if (!full_name || !username || !password) {
    return sendResponse(res, 400, { success: false, message: "Semua field harus diisi" });
  }

  const users = readJSON("users.json");
  const existing = users.find((u) => u.username === username);
  if (existing) {
    return sendResponse(res, 400, { success: false, message: "Username sudah digunakan" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    id: getNextId(users),
    full_name,
    username,
    password: hashedPassword,
    role: "pelanggan",
    created_at: new Date().toISOString()
  };
  users.push(newUser);
  writeJSON("users.json", users);

  sendResponse(res, 201, { success: true, message: "Registrasi berhasil", userId: newUser.id });
}

// Login
async function login(req, res, body, sendResponse) {
  const { username, password } = body;
  const users = readJSON("users.json");
  const user = users.find((u) => u.username === username);

  if (!user) {
    return sendResponse(res, 401, { success: false, message: "Username atau password salah" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return sendResponse(res, 401, { success: false, message: "Username atau password salah" });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );

  sendResponse(res, 200, {
    success: true,
    message: "Login berhasil",
    token,
    user: { id: user.id, full_name: user.full_name, username: user.username, role: user.role }
  });
}

// Get profile user login
async function getProfile(req, res, sendResponse) {
  const decoded = verifyToken(req);
  if (!decoded) return sendResponse(res, 401, { success: false, message: "Token tidak valid" });

  const users = readJSON("users.json");
  const user = users.find((u) => u.id === decoded.id);
  if (!user) return sendResponse(res, 404, { success: false, message: "User tidak ditemukan" });

  sendResponse(res, 200, { success: true, user });
}

module.exports = { register, login, getProfile };
