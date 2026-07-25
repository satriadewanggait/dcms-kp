# ![DCMS - PELNI](./public/pelni-logo.png) DCMS — Dokumen & Content Management System ![DCMS - PELNI](./public/logo.png)

**DCMS (Dokumen & Content Management System)** adalah aplikasi manajemen file dan dokumen berbasis web untuk **PT Pelayaran Nasional Indonesia (PELNI)** — terinspirasi dari Google Drive.

Dibangun dengan Next.js, Clerk Auth, PostgreSQL, Prisma, dan penyimpanan lokal.

### Fitur

- Login via Google / Email dengan **Clerk Auth**
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

**Next.js** | **TypeScript** | **React** | **Tailwind CSS** | **Clerk Auth** | **Prisma** | **PostgreSQL** | **Docker**

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
4. Push Prisma schema & generate client:

```bash
npx prisma migrate dev
```

5. Jalankan development server:

```bash
npm run dev
```

Aplikasi berjalan di [http://localhost:3000](http://localhost:3000).

## Environment Variables

Gunakan [`.env.example`](./env.example) sebagai template.

### Clerk Auth (wajib)

| Variable | Keterangan |
|----------|-----------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Publishable key dari Clerk Dashboard |
| `CLERK_SECRET_KEY` | Secret key dari Clerk Dashboard |
| `CLERK_WEBHOOK_SECRET` | Signing secret dari Clerk Dashboard → Webhooks |

### Database (wajib)

| Variable | Keterangan |
|----------|-----------|
| `DATABASE_URL` | Connection string PostgreSQL |

## Clerk Webhook

Webhook digunakan untuk menyinkronkan data user dari Clerk ke database lokal saat registrasi/login.

### Setup di Clerk Dashboard

1. Buka **Clerk Dashboard → Webhooks → Add Endpoint**
2. Endpoint URL: `https://domainkamu/api/webhooks/clerk`
3. Subscribe ke event: `user.created`, `user.updated`, `user.deleted`
4. Copy **Signing Secret** dan isi ke `CLERK_WEBHOOK_SECRET` di `.env`

### Konfirmasi webhook berjalan

Cek log server, akan terlihat:
```
POST /api/webhooks/clerk 200
```

Dan user muncul di database:
```sql
SELECT id, name, email FROM "User";
```

### Catatan Penting

- Pastikan endpoint URL bisa diakses dari internet (bisa pake tunnel atau domain publik).
- Pastikan tidak ada environment variable `CLERK_WEBHOOK_SECRET` yang diset di level sistem/terminal — akan meng-override nilai dari `.env`. Cek dengan: `env | grep CLERK_WEBHOOK`

## Upload File Body Size Limit

File upload via Next.js middleware/proxy terbatas secara default. Untuk mengubahnya:

```js
// next.config.mjs
experimental: {
  proxyClientMaxBodySize: "50MB",
}
```

Juga pastikan `bodyParser: false` di API route dan gunakan `formidable` dengan `maxFileSize`:

```ts
// pages/api/upload/local.ts
const form = formidable({ multiples: false, maxFileSize: 50 * 1024 * 1024 });
```

## Database Migration

Untuk mengupdate schema database setelah perubahan di `prisma/schema.prisma`:

```bash
npx prisma migrate dev --name deskripsi_perubahan
```

Atau jika hanya ingin sinkron tanpa migration history:

```bash
npx prisma db push
```

### Catatan: Perubahan Schema

- **User** model — memiliki kolom `id`, `name`, `email`, `image`, `createdAt`, `updatedAt`
- Data user di-sync dari Clerk via webhook (`user.created` / `user.updated`)
- Jika webhook belum keproses, API akan auto-create user record minimal (hanya `id`)

## Arsitektur

- **PostgreSQL** — menyimpan metadata file, folder, dan user (diakses via Prisma).
- **Local Storage** — file upload disimpan di `public/uploads/{userId}/` dan bisa diakses langsung lewat URL `/uploads/{userId}/{filename}`.
- **Clerk Auth** — mengelola autentikasi (Google OAuth, email/password, magic link).
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
- Dibangun dengan Next.js, PostgreSQL, Prisma, Clerk Auth, dan Tailwind CSS.
- Project ini adalah learning exercise untuk internal PELNI.
- Jika ada issue atau saran, silakan buka issue atau pull request!
- Made with ❤️ by Ezeibekwe Emmanuel — dimodifikasi dan dikustomisasi untuk PELNI oleh Brillian Andrie.
