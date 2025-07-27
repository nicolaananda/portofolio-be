# Deployment Guide - Portfolio Backend

Panduan lengkap untuk deploy backend portfolio ke VPS menggunakan Docker Compose.

## 📋 Prerequisites

1. **VPS dengan Docker dan Docker Compose terinstall**
2. **Domain yang sudah pointing ke IP VPS** (untuk HTTPS)
3. **Aplikasi sudah di-build** (`npm run build`)

## 🚀 Quick Start

### 1. Persiapan Environment

```bash
# Copy template environment
cp env.template .env

# Edit file .env dengan nilai yang sesuai
nano .env
```

**Isi .env dengan nilai yang aman:**
```env
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=password_mongodb_yang_kuat_123
JWT_SECRET=jwt_secret_key_minimal_32_karakter_12345
JWT_REFRESH_SECRET=refresh_secret_key_minimal_32_karakter_67890
```

### 2. Deploy Simple (HTTP Only)

Untuk deployment sederhana tanpa HTTPS:

```bash
# Gunakan docker-compose simple
docker-compose -f docker-compose.simple.yml up -d

# Atau jalankan script deploy
chmod +x deploy.sh
./deploy.sh
```

### 3. Deploy dengan HTTPS

Untuk deployment production dengan HTTPS:

```bash
# 1. Setup SSL Certificate (Let's Encrypt)
# Install certbot di VPS
sudo apt update
sudo apt install certbot

# Generate certificate
sudo certbot certonly --standalone -d nicola.id -d www.nicola.id

# Copy certificates
sudo cp /etc/letsencrypt/live/nicola.id/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/nicola.id/privkey.pem nginx/ssl/
sudo chown $USER:$USER nginx/ssl/*

# 2. Deploy dengan nginx
docker-compose up -d
```

## 🛠️ Konfigurasi VPS

### Firewall Setup
```bash
# Allow SSH, HTTP, dan HTTPS
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 5000  # Jika menggunakan HTTP only
sudo ufw enable
```

### Domain Setup
Pastikan DNS record domain pointing ke IP VPS:
```
A     nicola.id        YOUR_VPS_IP
CNAME www.nicola.id    nicola.id
```

## 📊 Monitoring dan Maintenance

### Useful Commands

```bash
# Melihat status containers
docker-compose ps

# Melihat logs
docker-compose logs -f
docker-compose logs backend
docker-compose logs mongodb

# Restart services
docker-compose restart
docker-compose restart backend

# Stop semua services
docker-compose down

# Update aplikasi
git pull
npm run build
docker-compose up --build -d

# Backup database
docker-compose exec mongodb mongodump --out /data/backup

# Restore database
docker-compose exec mongodb mongorestore /data/backup
```

### Auto-Renewal SSL Certificate

Tambahkan cron job untuk auto-renewal SSL:
```bash
# Edit crontab
crontab -e

# Tambahkan line ini untuk renewal setiap 2 bulan
0 2 1 */2 * certbot renew --quiet && docker-compose restart nginx
```

## 🔒 Security Best Practices

1. **Gunakan password yang kuat** untuk MongoDB
2. **Jangan expose MongoDB port** ke public (sudah di-handle di compose)
3. **Update Docker images secara berkala**
4. **Monitor logs secara rutin**
5. **Setup backup database otomatis**

## 🌐 Endpoints

Setelah deployment berhasil:

- **HTTP Only**: `http://your-domain.com:5000/api`
- **HTTPS**: `https://your-domain.com/api`

### API Endpoints Available:
- `GET /api/portfolio` - List portfolio items
- `POST /api/auth/login` - Authentication
- `POST /api/contact` - Contact form
- Dan lainnya sesuai dokumentasi API

## 🐛 Troubleshooting

### Container tidak start
```bash
# Check logs
docker-compose logs backend
docker-compose logs mongodb

# Check disk space
df -h

# Check memory
free -h
```

### Database connection error
```bash
# Restart MongoDB
docker-compose restart mongodb

# Check MongoDB logs
docker-compose logs mongodb

# Connect ke MongoDB untuk debug
docker-compose exec mongodb mongosh
```

### SSL Certificate issues
```bash
# Check certificate validity
openssl x509 -in nginx/ssl/fullchain.pem -text -noout

# Regenerate certificate
sudo certbot renew --force-renewal
```

## 📞 Support

Jika ada masalah, check:
1. Logs aplikasi: `docker-compose logs backend`
2. Logs database: `docker-compose logs mongodb`
3. Logs nginx: `docker-compose logs nginx`
4. Status containers: `docker-compose ps` 