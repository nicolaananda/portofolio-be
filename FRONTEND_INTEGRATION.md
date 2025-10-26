# 🎯 Frontend Integration Guide - Image Upload Endpoint

## ✅ Backend Endpoint Ready

**Endpoint:** `POST /api/upload`

**Status:** ✅ Ready for frontend integration

---

## 📋 API Documentation

### Endpoint Details

```
URL: https://be.nicola.id/api/upload (Production)
URL: http://localhost:5002/api/upload (Development)

Method: POST
Content-Type: multipart/form-data
Authentication: Required (JWT Bearer Token)
```

### Request Format

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Body (form-data):**
```
Field Name: image
Type: File
Allowed Types: JPG, PNG, GIF, WebP
Max Size: 5MB
```

### Success Response

```json
{
  "success": true,
  "url": "https://cdn.nicola.id/uuid.jpg",
  "message": "Image uploaded successfully"
}
```

### Error Responses

**1. No Authentication:**
```json
{
  "status": "fail",
  "message": "You are not logged in! Please log in to get access."
}
```
Status Code: `401 Unauthorized`

**2. No File Provided:**
```json
{
  "success": false,
  "message": "No image file provided"
}
```
Status Code: `400 Bad Request`

**3. Invalid File Type:**
```json
{
  "success": false,
  "message": "Only image files are allowed"
}
```
Status Code: `400 Bad Request`

**4. File Too Large:**
```json
{
  "message": "File too large"
}
```
Status Code: `413 Payload Too Large`

**5. Upload Failed:**
```json
{
  "success": false,
  "message": "Failed to upload image"
}
```
Status Code: `500 Internal Server Error`

---

## 🔧 Frontend Integration

### React/Next.js Example

```typescript
// types/upload.ts
export interface UploadResponse {
  success: boolean;
  url: string;
  message: string;
}

// services/uploadService.ts
import { authService } from './authService';

export const uploadImage = async (file: File): Promise<string> => {
  const token = authService.getAccessToken(); // Get your token from auth service
  
  if (!token) {
    throw new Error('Authentication required');
  }

  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch('https://be.nicola.id/api/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      // Don't set Content-Type, let browser set it for multipart/form-data
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to upload image');
  }

  const data: UploadResponse = await response.json();
  return data.url;
};
```

### Usage in Component

```typescript
// components/ImageUpload.tsx
import { useState } from 'react';
import { uploadImage } from '@/services/uploadService';

export const ImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed');
      return;
    }

    // Validate file size (5MB = 5 * 1024 * 1024 bytes)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const url = await uploadImage(file);
      setImageUrl(url);
      console.log('Image uploaded:', url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
      />
      
      {uploading && <p>Uploading...</p>}
      {error && <p className="error">Error: {error}</p>}
      {imageUrl && (
        <div>
          <p>Uploaded!</p>
          <img src={imageUrl} alt="Uploaded" style={{ maxWidth: '200px' }} />
          <p>URL: {imageUrl}</p>
        </div>
      )}
    </div>
  );
};
```

### Integration with Portfolio Form

```typescript
// Example: Using in portfolio form
const handlePortfolioSubmit = async (data: PortfolioFormData) => {
  try {
    let imageUrl = data.existingImage;

    // If new image is uploaded
    if (data.imageFile) {
      imageUrl = await uploadImage(data.imageFile);
      console.log('New image URL:', imageUrl);
    }

    // Submit portfolio with image URL
    const portfolioData = {
      ...data,
      image: imageUrl,
    };

    await createPortfolio(portfolioData);
  } catch (error) {
    console.error('Error uploading portfolio:', error);
  }
};
```

---

## 🎨 UI/UX Best Practices

### 1. File Upload Component

**Features to implement:**
- ✅ Drag & drop support
- ✅ Image preview before upload
- ✅ Progress indicator
- ✅ File size validation
- ✅ File type validation
- ✅ Error handling and display
- ✅ Success feedback

### 2. Example Implementation (Chakra UI / Tailwind)

```tsx
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadImage } from '@/services/uploadService';

export const ImageUploader = ({ onUpload }: { onUpload: (url: string) => void }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    // Upload file
    setUploading(true);
    try {
      const url = await uploadImage(file);
      onUpload(url);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer ${
          isDragActive ? 'border-blue-500' : 'border-gray-300'
        }`}
      >
        <input {...getInputProps()} />
        {preview ? (
          <img src={preview} alt="Preview" className="max-h-64 mx-auto" />
        ) : (
          <p>{isDragActive ? 'Drop image here' : 'Click or drag image here'}</p>
        )}
      </div>
      {uploading && <p>Uploading...</p>}
    </div>
  );
};
```

---

## 📦 NPM Packages Recommendations

### For File Upload:
```bash
npm install react-dropzone
# or
npm install react-dropzone-uploader
```

### For Form Handling:
```bash
npm install react-hook-form
```

---

## ✅ Testing Checklist

### Frontend Testing:

- [ ] Upload valid JPG image → Success
- [ ] Upload valid PNG image → Success
- [ ] Upload valid GIF image → Success
- [ ] Upload valid WebP image → Success
- [ ] Upload PDF → Error "Only image files are allowed"
- [ ] Upload TXT → Error "Only image files are allowed"
- [ ] Upload file > 5MB → Error "File too large"
- [ ] Upload without authentication → 401 Error
- [ ] Upload with invalid token → 401 Error
- [ ] Multiple uploads → All succeed with unique URLs

### Integration Testing:

- [ ] Upload image in Create Portfolio page
- [ ] Uploaded URL appears in portfolio list
- [ ] Upload image in Edit Portfolio page
- [ ] Previous image replaced with new image
- [ ] Image URL accessible from browser
- [ ] Image loads correctly in frontend

---

## 🔗 Important URLs

### Endpoints:
- **Upload:** `https://be.nicola.id/api/upload`
- **Auth (Login):** `https://be.nicola.id/api/auth/login`
- **Portfolio:** `https://be.nicola.id/api/portfolio`

### Image Storage:
- **CDN URL:** `https://cdn.nicola.id/`
- **Example:** `https://cdn.nicola.id/550e8400-e29b-41d4-a716-446655440000.jpg`

---

## 📝 Notes for Frontend Team

1. **Authentication is Required**
   - Always include `Authorization: Bearer TOKEN` header
   - Token obtained from login endpoint
   - Token expires after 15 minutes (refresh with refresh-token endpoint)

2. **File Size Limit: 5MB**
   - Client-side validation recommended
   - Server will reject files > 5MB

3. **Allowed File Types**
   - Images only: JPG, PNG, GIF, WebP
   - Server validates Content-Type

4. **Image URLs**
   - All uploaded images accessible via CDN
   - URLs are permanent (until manually deleted)
   - Store URL in database, not the file itself

5. **Error Handling**
   - Always show user-friendly error messages
   - Implement retry mechanism
   - Show loading state during upload

6. **Security**
   - Token stored securely (httpOnly cookies recommended)
   - Validate file type and size on client-side
   - Don't expose secrets in frontend code

---

## 🚀 Quick Start

1. **Get access token:**
   ```typescript
   const response = await fetch('https://be.nicola.id/api/auth/login', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ email, password }),
   });
   const { accessToken } = await response.json();
   ```

2. **Upload image:**
   ```typescript
   const formData = new FormData();
   formData.append('image', file);
   
   const response = await fetch('https://be.nicola.id/api/upload', {
     method: 'POST',
     headers: { 'Authorization': `Bearer ${accessToken}` },
     body: formData,
   });
   const { url } = await response.json();
   ```

3. **Use URL in portfolio:**
   ```typescript
   await createPortfolio({ ...data, image: url });
   ```

---

## 📞 Support

If you encounter any issues:
1. Check browser console for errors
2. Check network tab in DevTools
3. Verify authentication token is valid
4. Verify file meets requirements (type, size)
5. Contact backend team with error logs

---

**Ready to integrate! 🎉**
