# How to Create R2 Bucket di Cloudflare

## Langkah-langkah:

1. Login ke [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Pilih akun yang memiliki R2 enabled
3. Klik **R2 Object Storage** di sidebar
4. Klik **Create bucket** button
5. Bucket name: `portfolio`
6. Location: Pilih region terdekat
7. Klik **Create bucket**

## Set Public Access (Untuk CDN):

1. Setelah bucket dibuat, klik nama bucket "portfolio"
2. Go to **Settings** tab
3. Find **Public Access** section
4. Enable public access
5. Setup custom domain jika perlu:
   - Domain: `cdn.nicola.id`
   - Or use default R2 URL

## Verify Bucket Created:

Setelah bucket dibuat, test upload lagi di Postman.
You should see: "Uploading to bucket: portfolio" in server logs.

