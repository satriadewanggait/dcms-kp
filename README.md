# ![DCMS - PELNI](./public/pelni-logo.png) DCMS — Dokumen & Content Management System ![DCMS - PELNI](./public/logo.png)

**DCMS (Dokumen & Content Management System)** adalah aplikasi manajemen file dan dokumen berbasis web untuk **PT Pelayaran Nasional Indonesia (PELNI)** — terinspirasi dari Google Drive.

Dibangun dengan Next.js, NextAuth, PostgreSQL, Prisma, dan penyimpanan lokal.

### Fitur

- Login via Google dengan NextAuth
- Buat folder, upload file, rename, pindahin, copy, trash, restore
- Hapus permanen langsung dari My Drive
- Penyimpanan file secara lokal (tidak bergantung Cloudinary)
- Folder bersarang (nested) dengan breadcrumbs
- Upload folder (drag & drop)
- Tracking penggunaan storage dengan limit **200GB** per user
- Item berbintang (starred) dan trash/bin
- Berbagi file publik — "Only you" atau "Anyone with the link"
- UI responsif untuk desktop dan mobile
- Siap dijalankan dengan Docker

### Tech Stack

**Next.js** | **TypeScript** | **React** | **Tailwind CSS** | **NextAuth.js** | **Prisma** | **PostgreSQL** | **Docker**

## Setup Lokal

### Dengan Docker (rekomendasi)

1. Clone repository.
2. Jalankan:

```bash
docker compose up -d
```

3. Aplikasi berjalan di [http://localhost:3000](http://localhost:3000).

Docker compose akan menjalankan:
- **db**: PostgreSQL 16 (port `5432`)
- **app**: Next.js dev server (port `3000`)

### Manual

1. Clone repository.
2. Install dependencies:

```bash
npm install
```

3. Copy `.env.example` ke `.env` dan isi environment variables yang diperlukan.
4. Push Prisma schema:

```bash
npx prisma db push
```

5. Jalankan development server:

```bash
npm run dev
```

Aplikasi berjalan di [http://localhost:3000](http://localhost:3000).

## Environment Variables

Gunakan [`.env.example`](./.env.example) sebagai template.

Wajib diisi:

| Variable | Keterangan |
|----------|-----------|
| `DATABASE_URL` | Connection string PostgreSQL |
| `NEXTAUTH_SECRET` | Secret untuk NextAuth |
| `NEXTAUTH_URL` | URL aplikasi (http://localhost:3000) |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret |

> **Catatan:** Untuk Google OAuth, pastikan callback URL sudah diset ke `/api/auth/callback/google`.

## Arsitektur

- **PostgreSQL** — menyimpan metadata akun, session, file, dan folder (diakses via Prisma).
- **Local Storage** — file upload disimpan di `public/uploads/{userId}/` dan bisa diakses langsung lewat URL `/uploads/{userId}/{filename}`.
- **Link publik** — disimpan di PostgreSQL dan dirender lewat `/share/[token]`.

## Docker

### docker-compose.yml

```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: dcms
    # ...
```

Jalankan dengan:

```bash
docker compose up -d
```

Untuk membangun ulang image:

```bash
docker compose up -d --build
```

## Catatan Storage

- Limit penyimpanan: **200GB** per user.
- PostgreSQL menyimpan metadata ukuran file untuk pengecekan kuota.
- Semua file disimpan di folder `public/uploads/{userId}/` di dalam container.

## Catatan Sharing

- Sharing hanya untuk file (bukan folder).
- File yang dishare bisa dibuka lewat link publik.
- Link publik tidak menampilkan layout Drive yang terautentikasi.

## License

MIT License.

## Acknowledgements

- Terinspirasi dari fitur dan UI Google Drive.
- Dibangun dengan Next.js, PostgreSQL, Prisma, dan Tailwind CSS.
- Project ini adalah learning exercise untuk internal PELNI.
- Jika ada issue atau saran, silakan buka issue atau pull request!
- Made with ❤️ by Ezeibekwe Emmanuel — dimodifikasi dan dikustomisasi untuk PELNI oleh Brillian Andrie.
