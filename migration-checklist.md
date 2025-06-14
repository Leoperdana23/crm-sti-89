
# Checklist Migrasi ke Hosting

## Pre-Migration
- [ ] Backup data Supabase (export semua tabel)
- [ ] Test aplikasi di development dengan PostgreSQL lokal
- [ ] Siapkan hosting dengan PostgreSQL support
- [ ] Domain dan SSL certificate ready

## Migration Steps
- [ ] Upload aplikasi ke hosting (folder dist/)
- [ ] Setup database PostgreSQL di hosting
- [ ] Import database_backup.sql
- [ ] Konfigurasi file .env dengan setting hosting
- [ ] Upload API endpoints (folder api/)
- [ ] Test koneksi database
- [ ] Verify semua fitur berfungsi

## Post-Migration
- [ ] Update DNS jika perlu domain baru
- [ ] Setup monitoring dan backup otomatis
- [ ] Test performance dan optimasi
- [ ] Update dokumentasi dengan URL hosting
- [ ] Inform users tentang URL baru

## Rollback Plan
- [ ] Backup hosting sebelum migrasi
- [ ] Keep Supabase active sampai migrasi sukses
- [ ] Documentation untuk rollback steps

## Optimasi Hosting
- [ ] Enable Gzip compression
- [ ] Setup CDN untuk static files
- [ ] Database indexing optimization
- [ ] Caching strategy untuk API responses
