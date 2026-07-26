# 📋 Use Case — DCMS (Document Control Management System)
**Aplikasi:** Pelni DCMS
**Perusahaan:** PELNI Shipping Agencies
**Status:** Development

---

## 🎯 Tujuan Aplikasi
Sistem manajemen dokumen digital untuk internal PELNI. Karyawan bisa upload, manage, dan share dokumen secara aman dengan sistem approval-based registration.

---

## 👥 Aktor

| Aktor | Deskripsi |
|---|---|
| **User** | Karyawan PELNI yang sudah di-approve admin. Bisa upload, manage, folder, star, trash, dan share file ke user lain. |
| **Admin** | User dengan role `admin`. Bisa approve/reject pendaftaran user, ubah role user, dan nonaktifkan user (resign). |
| **Pending User** | User baru yang daftar tapi belum di-approve. Hanya bisa lihat halaman "Menunggu Persetujuan". |
| **Guest** | Orang dengan link public share. Bisa lihat file tertentu tanpa login. |

---

## 📖 Use Case List

### 🔐 1. Registrasi & Approval

| UC | Nama | Deskripsi |
|---|---|---|
| **UC-01** | Daftar Akun | User daftar via Clerk (`/register`). Setelah daftar, status = `pending`. Tidak bisa akses app. |
| **UC-02** | Approve User | Admin buka `/admin/users` → Approve user → status jadi `active` + bisa pilih role (`user`/`admin`). |
| **UC-03** | Reject User | Admin tolak user → status `rejected`. User gabisa login. |
| **UC-04** | Nonaktifkan User | Admin set user ke `inactive` (resign). User gabisa login sampai di-activate balik. |
| **UC-05** | Ganti Role User | Admin bisa naikin user jadi admin, atau turunin admin jadi user kapan aja. |
| **UC-06** | Login | User login via Clerk (`/login`). Clerk handle autentikasi (email, Google, etc). |
| **UC-07** | Auto-create User | Pas user pertama kali hit API, record user otomatis dibuat di DB dengan status `pending`. |

### 📁 2. Manajemen File

| UC | Nama | Deskripsi |
|---|---|---|
| **UC-08** | Upload File | User upload file ke folder tertentu. Otomatis cek storage limit. |
| **UC-09** | Upload Folder | User upload seluruh folder (drag folder). Struktur folder dipertahankan. |
| **UC-10** | Buat Folder Baru | User bikin folder kosong. |
| **UC-11** | Rename File/Folder | User rename file atau folder. |
| **UC-12** | Move File/Folder | User pindahin file/folder ke folder lain. |
| **UC-13** | Copy File/Folder | User copy file/folder ke folder lain. |
| **UC-14** | Star File | User tandai file sebagai favorit (star). |
| **UC-15** | Trash File | User pindahin file ke bin (soft delete). |
| **UC-16** | Restore File | User restore file dari bin. |
| **UC-17** | Delete Forever | User hapus file permanen dari bin. |
| **UC-18** | Download File | User download file ke lokal. |
| **UC-19** | Preview File | User bisa preview gambar, video (mp4), audio (mp3), dan file lainnya (icon). |

### 👤 3. Sharing

| UC | Nama | Deskripsi |
|---|---|---|
| **UC-20** | Share ke User Lain | User A share file ke User B → User B lihat file di menu "Shared with me". Mirip kolaborator GitHub. |
| **UC-21** | Lihat File yang Di-share ke Saya | User buka `/drive/shared-with-me` → lihat semua file yang di-share orang lain ke dia. |
| **UC-22** | Lihat File yang Saya Share | User buka `/drive/my-shares` → lihat file yang dia share ke siapa aja. |
| **UC-23** | Hapus Share | User bisa un-share file dari user tertentu. |
| **UC-24** | Public Share Link | User bikin public link (Anyone with the link) → siapapun bisa akses file tanpa login. |
| **UC-25** | Matikan Public Link | User nonaktifkan public link. |

### 🗂️ 4. Navigasi & View

| UC | Nama | Deskripsi |
|---|---|---|
| **UC-26** | My Drive | Lihat semua file & folder milik sendiri. |
| **UC-27** | Starred | Lihat file yang di-star. |
| **UC-28** | Trash / Bin | Lihat file yang di-trash. |
| **UC-29** | Buka Folder | Navigasi ke dalam folder (breadcrumbs). |

### 🛡️ 5. Admin

| UC | Nama | Deskripsi |
|---|---|---|
| **UC-30** | Manage Users | Admin lihat semua user, filter by status/role. |
| **UC-31** | Approve with Role | Pas approve user, admin bisa set rolenya langsung (`user` atau `admin`). |

---

## 🔄 Flow Utama

### Flow Registrasi:
```
User → /register → Clerk Auth → Auto-create DB (status: pending)
  → Redirect ke /pending-approval
  ↓
Admin → /admin/users → Approve (pilih role)
  ↓
User → Refresh → status active → Masuk dashboard ✅
```

### Flow Share:
```
User A → Klik ⋮ → Share → Tab "Share with users"
  → Pilih User B → Share
  ↓
User B → Sidebar "Shared with me" → Lihat file dari User A
```

### Flow Public Link:
```
User → Klik ⋮ → Share → Tab "Public link"
  → Enable → Copy link → Kirim ke siapapun
```

---

## 🧱 Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | Next.js 16 (Turbopack) + Tailwind CSS |
| Auth | Clerk (development) |
| Database | PostgreSQL + Prisma ORM |
| Storage | Local filesystem (`/uploads/`) |
| Container | Docker + Docker Compose |
| Icons | react-icons |

## 📂 Struktur Halaman

```
/drive/my-drive          → File milik sendiri
/drive/my-shares         → File yang gue share ke orang
/drive/shared-with-me    → File yang di-share ke gue
/drive/starred           → File favorit
/drive/trash             → File terhapus
/drive/[...Folder]       → Subfolder
/admin/users             → Manage users (admin only)
/pending-approval        → Status pending
/rejected                → Status ditolak/nonaktif
/share/[token]           → Public share link
/login                   → Login Clerk
/register                → Daftar akun
```

---

*Dibuat: 26 Juli 2026*
*Next: Tambah fitur audit log, search global, file versioning?*
