
# Deployment Guide

## 1. Build Production
```bash
npm run build
```

## 2. Upload ke Hosting
Upload seluruh isi folder `dist/` ke folder public_html atau www di hosting Anda.

## 3. Konfigurasi Server
Pastikan server mendukung:
- Node.js (jika menggunakan SSR)
- Single Page Application routing
- HTTPS

## 4. Environment Variables
Set environment variables di hosting:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 5. Database Setup
1. Import database_backup.sql ke PostgreSQL server
2. Update connection string di Supabase dashboard
3. Jalankan migration files sesuai urutan

## 6. Domain Configuration
- Point domain ke hosting
- Setup SSL certificate
- Configure DNS settings
