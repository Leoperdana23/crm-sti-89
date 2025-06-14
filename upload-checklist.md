
# Upload Checklist untuk Hosting

## File yang Perlu Di-Upload

### 1. File Aplikasi
- [ ] Folder `dist/` hasil build production
- [ ] File `.htaccess` (untuk Apache) atau konfigurasi server
- [ ] File environment variables

### 2. Database
- [ ] database_backup.sql
- [ ] Semua file migration di folder supabase/migrations/

### 3. Konfigurasi Server
- [ ] Setup SSL certificate
- [ ] Konfigurasi domain/subdomain
- [ ] Environment variables di hosting panel

## Langkah Upload

### 1. Persiapan
```bash
# Build aplikasi
npm run build

# Compress file untuk upload
zip -r sedekat-app.zip dist/
```

### 2. Upload via FTP/cPanel
- Upload file sedekat-app.zip ke public_html
- Extract di hosting
- Copy isi folder dist/ ke root public_html

### 3. Database Setup
- Buat database PostgreSQL di hosting
- Import database_backup.sql
- Jalankan migration files sesuai urutan tanggal

### 4. Environment Variables
Set di hosting panel atau .env file:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 5. Testing
- [ ] Test login/register
- [ ] Test semua menu
- [ ] Test reseller app
- [ ] Test order flow
- [ ] Test responsive design

## Troubleshooting
- Jika 404 pada refresh: Setup rewrite rules
- Jika error database: Check connection string
- Jika tidak responsive: Check CSS/JS loading
