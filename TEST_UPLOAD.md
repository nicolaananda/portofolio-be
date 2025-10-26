# Testing Upload Endpoint

## Test 1: Get Access Token First

```bash
# Login to get access token
curl -X POST http://localhost:5002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

**Response akan memberikan `accessToken` yang harus Anda copy.**

## Test 2: Upload Valid Image (with authentication)

```bash
# Replace YOUR_TOKEN dengan accessToken dari Test 1
curl -X POST http://localhost:5002/api/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@test-image.png"
```

**Expected Response:**
```json
{
  "success": true,
  "url": "https://your-public-url.com/uuid.png",
  "message": "Image uploaded successfully"
}
```

## Test 3: Upload Without Authentication (should fail)

```bash
curl -X POST http://localhost:5002/api/upload \
  -F "image=@test-image.png"
```

**Expected Response:**
```json
{
  "status": "fail",
  "message": "You are not logged in! Please log in to get access."
}
```

## Test 4: Upload Invalid File Type (should fail)

```bash
# Create a text file
echo "This is not an image" > test.txt

curl -X POST http://localhost:5002/api/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@test.txt"
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Only image files are allowed"
}
```

## Test 5: Upload File Too Large (should fail)

Catatan: Untuk test ini, Anda perlu membuat file > 5MB. Multer secara otomatis akan menolak file yang terlalu besar.

## Test 6: Upload Without File (should fail)

```bash
curl -X POST http://localhost:5002/api/upload \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": false,
  "message": "No image file provided"
}
```

## Quick Test Script

Buat file `test-upload.sh`:

```bash
#!/bin/bash

echo "1. Logging in..."
TOKEN=$(curl -s -X POST http://localhost:5002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}' \
  | jq -r '.accessToken')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo "Error: Login failed"
  exit 1
fi

echo "Token obtained: ${TOKEN:0:20}..."
echo ""
echo "2. Uploading image..."
curl -X POST http://localhost:5002/api/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@test-image.png"
```

## Check Files in Cloudflare R2 Dashboard

1. Login ke Cloudflare Dashboard
2. Go to R2 Object Storage
3. Select your bucket (portfolio-images)
4. Check if the uploaded files are there
5. Verify the public URL is accessible
