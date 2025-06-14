
# Setup Aplikasi di Hosting

## 1. Persiapan File
```bash
# Build aplikasi untuk production
npm run build

# Copy file yang dibutuhkan
cp .env.example .env
cp database_backup.sql ./
```

## 2. Upload ke Hosting
Upload file-file berikut ke hosting:
- Seluruh isi folder `dist/` → ke `public_html/` atau `www/`
- File `database_backup.sql` → untuk import database
- File `.htaccess` → untuk URL rewriting
- File `.env` → dengan konfigurasi hosting (edit sesuai setting hosting)

## 3. Setup Database
```sql
-- 1. Create database
CREATE DATABASE sedekat_crm;

-- 2. Import backup
psql -h localhost -U your_user -d sedekat_crm < database_backup.sql

-- 3. Verify tables
\dt
```

## 4. Konfigurasi Environment
Edit file `.env` dengan setting hosting:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sedekat_crm
DB_USER=your_db_user
DB_PASSWORD=your_db_password
VITE_API_URL=https://yourdomain.com/api
```

## 5. Setup Web Server
Pastikan web server support:
- PHP 8.0+ (untuk API endpoints)
- PostgreSQL connection
- URL rewriting (mod_rewrite untuk Apache)
- HTTPS/SSL certificate

## 6. Test Aplikasi
- ✅ Akses halaman utama
- ✅ Test login/register
- ✅ Test database connection
- ✅ Test semua fitur utama

## 7. Troubleshooting
- **404 errors**: Check `.htaccess` dan URL rewriting
- **Database errors**: Verify connection string dan credentials
- **API errors**: Check PHP error logs dan API endpoints
- **Static files**: Ensure proper file permissions

## 8. Security Checklist
- ✅ Update database credentials
- ✅ Setup SSL certificate
- ✅ Enable firewall rules
- ✅ Set proper file permissions
- ✅ Remove development files
