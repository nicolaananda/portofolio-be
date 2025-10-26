#!/bin/bash

echo "🚀 Testing Upload Endpoint"
echo "=========================="
echo ""

# Step 1: Login
echo "1️⃣ Logging in..."
TOKEN=$(curl -s -X POST http://localhost:5002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}' \
  | jq -r '.accessToken')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo "❌ Error: Login failed"
  exit 1
fi

echo "✅ Token obtained: ${TOKEN:0:30}..."
echo ""

# Step 2: Upload image
echo "2️⃣ Uploading image..."
RESPONSE=$(curl -s -X POST http://localhost:5002/api/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@test-image.png")

echo "Response:"
echo "$RESPONSE" | jq . 2>/dev/null || echo "$RESPONSE"
echo ""

# Step 3: Test without authentication
echo "3️⃣ Testing without authentication (should fail)..."
NO_AUTH_RESPONSE=$(curl -s -X POST http://localhost:5002/api/upload \
  -F "image=@test-image.png")
echo "Response:"
echo "$NO_AUTH_RESPONSE" | jq . 2>/dev/null || echo "$NO_AUTH_RESPONSE"

