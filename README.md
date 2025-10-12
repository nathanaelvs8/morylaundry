# Mory Laundry - Sistem Manajemen Laundry

Aplikasi web lengkap untuk manajemen laundry dengan fitur login pelanggan dan admin panel.

## 🚀 Fitur Utama

### Halaman Publik
- Single Page Application (SPA) dengan scroll navigation
- Daftar layanan dan harga
- Tombol "Pesan Sekarang" langsung ke WhatsApp
- Google Maps integrasi
- Responsive design

### Area Pelanggan
- Registrasi dan login akun
- Melihat riwayat pesanan pribadi
- Tracking status pesanan real-time
- Dashboard pelanggan yang user-friendly

### Panel Admin
- Dashboard dengan statistik
- CRUD (Create, Read, Update, Delete) pesanan
- Manajemen status pesanan
- Lihat daftar semua pelanggan
- Laporan pesanan

## 📋 Persyaratan Sistem

- Node.js (v14 atau lebih baru)
- MySQL (v5.7 atau lebih baru)
- Browser modern (Chrome, Firefox, Safari, Edge)

## 🛠️ Instalasi

### 1. Setup Database

```bash
# Masuk ke MySQL
mysql -u root -p

# Jalankan script database
source path/to/database-schema.sql
```

Atau copy-paste isi file SQL database schema ke MySQL client Anda.

**PENTING:** Setelah membuat database, Anda perlu meng-hash password untuk admin:

```javascript
// Jalankan di Node.js atau browser console
const bcrypt = require('bcryptjs');
const password = 'natan'; // Password untuk user 'mori'
const hashedPassword = bcrypt.hashSync(password, 10);
console.log(hashedPassword);
```

Kemudian update password admin di database:
```sql
UPDATE users SET password = 'HASIL_HASH_DISINI' WHERE username = 'mori';
```

### 2. Setup Backend

```bash
# Masuk ke folder backend
cd backend

# Install dependencies
npm install

# Copy file .env dan sesuaikan konfigurasi
cp .env.example .env

# Edit file .env dengan text editor
# Sesuaikan DB_PASSWORD, JWT_SECRET, dll
nano .env
```

**Konfigurasi .env:**
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password_mysql_anda
DB_NAME=mory_laundry_db
PORT=5000
JWT_SECRET=ganti_dengan_string_random_yang_aman
CORS_ORIGIN=http://localhost:3000
```

```bash
# Jalankan server
npm start

# Atau gunakan nodemon untuk development
npm run dev
```

Server akan berjalan di `http://localhost:5000`

### 3. Setup Frontend

```bash
# Buka folder frontend di terminal baru
cd frontend

# Jika menggunakan Live Server (VSCode Extension):
# - Install Live Server extension
# - Klik kanan pada index.html
# - Pilih "Open with Live Server"

# Atau gunakan http-server (via npm):
npx http-server -p 3000

# Atau gunakan Python:
python -m http.server 3000
```

Frontend akan berjalan di `http://localhost:3000`

## 📁 Struktur Folder

```
mory-laundry/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── orderController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── orderRoutes.js
│   ├── .env
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── admin/
    │   ├── dashboard.html
    │   └── pesanan.html
    ├── js/
    │   ├── main.js
    │   ├── auth.js
    │   ├── status.js
    │   ├── admin-dashboard.js
    │   └── admin-pesanan.js
    ├── index.html
    ├── login.html
    └── status-pesanan.html
```

## 🔐 Login Credentials

### Admin
- Username: `mori`
- Password: `natan`

### Pelanggan
Pelanggan harus registrasi terlebih dahulu melalui halaman login.

## 🎯 Cara Menggunakan

### Untuk Pelanggan

1. Buka `http://localhost:3000`
2. Klik tombol "Login" di navigation bar
3. Pilih tab "Daftar" untuk membuat akun baru
4. Isi form registrasi dan klik "Daftar"
5. Login dengan username dan password yang sudah dibuat
6. Anda akan diarahkan ke halaman "Status Pesanan"
7. Lihat riwayat pesanan Anda (jika ada)

### Untuk Admin

1. Buka `http://localhost:3000/login.html`
2. Login dengan username `mori` dan password `natan`
3. Anda akan diarahkan ke Dashboard Admin
4. Dari dashboard, Anda bisa:
   - Melihat statistik pesanan
   - Mengelola pesanan (tambah, edit, hapus)
   - Melihat daftar pelanggan
   - Update status pesanan

### Menambah Pesanan (Admin)

1. Masuk ke halaman "Kelola Pesanan"
2. Klik tombol "Tambah Pesanan"
3. Pilih pelanggan dari dropdown
4. Isi detail pesanan (layanan, jumlah, catatan)
5. Klik "Simpan"

### Update Status Pesanan (Admin)

1. Di halaman "Kelola Pesanan"
2. Klik tombol Edit (ikon pensil) pada pesanan
3. Ubah status pesanan
4. Klik "Simpan"
5. Status akan otomatis terlihat oleh pelanggan

## 🔧 Troubleshooting

### Backend tidak bisa connect ke database
- Pastikan MySQL sedang berjalan
- Cek konfigurasi di file `.env`
- Pastikan database `mory_laundry_db` sudah dibuat
- Cek username dan password MySQL

### CORS Error
- Pastikan `CORS_ORIGIN` di `.env` sesuai dengan URL frontend
- Restart backend server setelah mengubah `.env`

### Token expired / Session berakhir
- Token JWT berlaku 24 jam
- Logout dan login kembali
- Cek JWT_SECRET di `.env` sudah benar

### Frontend tidak bisa fetch data
- Pastikan backend sedang berjalan di port 5000
- Cek `API_URL` di file JavaScript (main.js, auth.js, dll)
- Buka browser console untuk melihat error detail

## 📱 Fitur WhatsApp Integration

Tombol "Pesan Sekarang" menggunakan WhatsApp API dengan format:
```
https://wa.me/6281217607101?text=Pesan_yang_sudah_diencode
```

Untuk mengubah nomor WhatsApp:
1. Buka file `frontend/js/main.js`
2. Cari fungsi `createServiceCard`
3. Ubah nomor `6281217607101` dengan nomor Anda (format internasional tanpa +)

## 🎨 Customization

### Mengubah Warna Theme
Edit variabel CSS atau Tailwind classes di file HTML:
- Primer: `#0077B6` (biru tua)
- Sekunder: `#E0F7FA` (biru muda)
- Aksen: `#4CAF50` (hijau)

### Menambah Layanan Baru
Insert langsung ke database:
```sql
INSERT INTO services (service_name, unit, price, description) 
VALUES ('Nama Layanan', 'unit', 50000, 'Deskripsi layanan');
```

### Mengubah Status Pesanan
Edit di file `backend/controllers/orderController.js` atau langsung di database schema.

## 📊 Database Schema

### Table: users
- id (PK, Auto Increment)
- full_name
- username (Unique)
- password (Hashed)
- role (admin/pelanggan)
- created_at

### Table: services
- id (PK, Auto Increment)
- service_name
- unit
- price
- description
- is_active
- created_at

### Table: orders
- id (PK, Auto Increment)
- user_id (FK ke users)
- order_number (Unique)
- customer_name
- phone_number
- entry_date
- completed_date
- service_id (FK ke services)
- quantity
- total_price
- notes
- status

## 🔒 Security Notes

- Password di-hash menggunakan bcrypt (10 rounds)
- JWT token untuk autentikasi
- Middleware untuk proteksi route admin
- Validation pada input form
- Prepared statements untuk mencegah SQL injection

## 📞 Support

Jika mengalami kendala:
1. Cek dokumentasi ini
2. Lihat error di browser console (F12)
3. Cek log server di terminal backend
4. Pastikan semua dependencies ter-install

## 📝 License

Copyright © 2025 Mory Laundry. All rights reserved.

---

**Selamat menggunakan Mory Laundry Management System! 🧺✨**