# Cara Test Upload Endpoint dengan Cloudflare R2

## Prerequisites

✅ Pastikan environment variables sudah di-set di `.env`:
```env
R2_ACCOUNT_ID=your-r2-account-id
R2_ACCESS_KEY_ID=your-r2-access-key-id
R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
R2_BUCKET_NAME=portfolio-images
R2_PUBLIC_URL=https://your-public-url.com
```

✅ Pastikan server sudah running:
```bash
npm run dev
# atau
pm2 restart all
```

## Cara Test Manual

### Step 1: Login untuk mendapatkan token

```bash
curl -X POST http://localhost:5002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email","password":"your-password"}'
```

**Response:**
```json
{
  "status": "success",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Copy `accessToken` yang Anda dapat!

### Step 2: Upload gambar

```bash
curl -X POST http://localhost:5002/api/upload \
  -H "Authorization: Bearer PASTE_ACCESS_TOKEN_HERE" \
  -F "image=@/path/to/your/image.jpg"
```

**Expected Response:**
```json
{
  "success": true,
  "url": "https://your-public-url.com/uuid.jpg",
  "message": "Image uploaded successfully"
}
```

## Test Scenarios

### ✅ Test 1: Upload dengan authentication (SUCCESS)
```bash
curl -X POST http://localhost:5002/api/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@test.jpg"
```

### ❌ Test 2: Upload tanpa authentication (FAIL)
```bash
curl -X POST http://localhost:5002/api/upload \
  -F "image=@test.jpg"
```
Expected: 401 Unauthorized

### ❌ Test 3: Upload file bukan image (FAIL)
```bash
echo "test" > test.txt
curl -X POST http://localhost:5002/api/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@test.txt"
```
Expected: 400 Bad Request - "Only image files are allowed"

### ❌ Test 4: Upload tanpa file (FAIL)
```bash
curl -X POST http://localhost:5002/api/upload \
  -H "Authorization: Bearer YOUR_TOKEN"
```
Expected: 400 Bad Request - "No image file provided"

## Test dengan Postman

1. **Import Collection:**
   - Method: POST
   - URL: `http://localhost:5002/api/upload`
   - Headers:
     - `Authorization: Bearer YOUR_TOKEN`
   - Body: form-data
   - Key: `image` (Type: File)
   - Value: Pilih gambar Anda

2. **Test Cases:**
   - ✅ Valid JPG image
   - ✅ Valid PNG image
   - ❌ Invalid file type (PDF, TXT, etc.)
   - ❌ No authentication
   - ❌ File > 5MB

## Verify di Cloudflare R2

1. Login ke [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Pilih **R2 Object Storage**
3. Pilih bucket `portfolio-images`
4. Lihat file yang sudah di-upload
5. Klik file untuk mendapatkan public URL

## Troubleshooting

### Error: "Failed to upload image"
- Check environment variables di `.env`
- Verify R2 credentials correct
- Check R2 bucket exists and is accessible
- Check server logs

### Error: "No image file provided"
- Pastikan field name `image` (bukan `file` atau yang lain)
- Pastikan file ada dan readable

### Error: "Only image files are allowed"
- Pastikan file adalah image (JPG, PNG, GIF, WebP)
- Check Content-Type header

## Cek Server Logs

```bash
# Tail logs untuk melihat upload attempts
pm2 logs
# atau
npm run dev
```

## Production Testing

Untuk test di production server:

```bash
# Replace localhost dengan production URL
curl -X POST https://be.nicola.id/api/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@test.jpg"
```
