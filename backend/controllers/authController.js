const db = require('../config/db');
const bcrypt = require('bcryptjs');
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

// Register pelanggan baru
async function register(req, res, body, sendResponse) {
  const { full_name, username, password } = body;

  // Validasi
  if (!full_name || !username || !password) {
    return sendResponse(res, 400, {
      success: false,
      message: 'Semua field harus diisi'
    });
  }

  if (full_name.length < 3) {
    return sendResponse(res, 400, {
      success: false,
      message: 'Nama lengkap minimal 3 karakter'
    });
  }

  if (username.length < 4) {
    return sendResponse(res, 400, {
      success: false,
      message: 'Username minimal 4 karakter'
    });
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return sendResponse(res, 400, {
      success: false,
      message: 'Username hanya boleh berisi huruf, angka, dan underscore'
    });
  }

  if (password.length < 6) {
    return sendResponse(res, 400, {
      success: false,
      message: 'Password minimal 6 karakter'
    });
  }

  try {
    // Cek apakah username sudah digunakan
    const [existingUser] = await db.query(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );

    if (existingUser.length > 0) {
      return sendResponse(res, 400, {
        success: false,
        message: 'Username sudah digunakan. Silakan pilih username lain.'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user baru
    const [result] = await db.query(
      'INSERT INTO users (full_name, username, password, role) VALUES (?, ?, ?, ?)',
      [full_name, username, hashedPassword, 'pelanggan']
    );

    sendResponse(res, 201, {
      success: true,
      message: 'Registrasi berhasil! Silakan login.',
      userId: result.insertId
    });

  } catch (error) {
    console.error('Register error:', error);
    sendResponse(res, 500, {
      success: false,
      message: 'Terjadi kesalahan saat registrasi.'
    });
  }
}

// Login untuk admin dan pelanggan
async function login(req, res, body, sendResponse) {
  const { username, password } = body;

  // Validasi
  if (!username || !password) {
    return sendResponse(res, 400, {
      success: false,
      message: 'Username dan password harus diisi'
    });
  }

  try {
    // Cari user berdasarkan username
    const [users] = await db.query(
      'SELECT id, full_name, username, password, role FROM users WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      return sendResponse(res, 401, {
        success: false,
        message: 'Username atau password salah.'
      });
    }

    const user = users[0];

    // Verifikasi password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return sendResponse(res, 401, {
        success: false,
        message: 'Username atau password salah.'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    sendResponse(res, 200, {
      success: true,
      message: 'Login berhasil!',
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        username: user.username,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    sendResponse(res, 500, {
      success: false,
      message: 'Terjadi kesalahan saat login.'
    });
  }
}

// Get profile user yang sedang login
async function getProfile(req, res, sendResponse) {
  const decoded = verifyToken(req);

  if (!decoded) {
    return sendResponse(res, 401, {
      success: false,
      message: 'Token tidak valid atau sudah kadaluarsa.'
    });
  }

  try {
    const [users] = await db.query(
      'SELECT id, full_name, username, role, created_at FROM users WHERE id = ?',
      [decoded.id]
    );

    if (users.length === 0) {
      return sendResponse(res, 404, {
        success: false,
        message: 'User tidak ditemukan.'
      });
    }

    sendResponse(res, 200, {
      success: true,
      user: users[0]
    });

  } catch (error) {
    console.error('Get profile error:', error);
    sendResponse(res, 500, {
      success: false,
      message: 'Terjadi kesalahan saat mengambil profil.'
    });
  }
}

module.exports = {
  register,
  login,
  getProfile
};