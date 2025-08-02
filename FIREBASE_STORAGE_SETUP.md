# Firebase Storage Setup for Asset Optimization

## Why External Storage?
Your current assets are causing slow loading times:
- 22 intro videos (~60MB total)
- Large image files (2-4MB each)
- Car images (200-400KB each)
- Total: 100MB+ of assets

## Setup Steps:

### 1. Initialize Firebase Storage
```bash
firebase init storage
```

### 2. Update Firebase Rules
Add to `storage.rules`:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;  // Public read access for assets
      allow write: if request.auth != null;  // Only authenticated users can upload
    }
  }
}
```

### 3. Upload Assets
```bash
# Upload videos
firebase storage:upload public/videos/* gs://your-project-id.appspot.com/videos/

# Upload images
firebase storage:upload src/assets/images/* gs://your-project-id.appspot.com/images/
```

### 4. Update Asset URLs in Code
Replace local paths with Firebase Storage URLs:
```javascript
// Before
const videoUrl = '/videos/intro.mp4';

// After
const videoUrl = 'https://storage.googleapis.com/your-project-id.appspot.com/videos/intro.mp4';
```

## Alternative Options:

### Option B: AWS S3 + CloudFront
- More control and features
- Better for high-traffic applications
- Requires AWS account

### Option C: CDN Services
- Cloudflare (free tier available)
- Bunny.net (specialized for video)
- Imgix (image optimization)

## Benefits:
- ✅ Faster loading times
- ✅ Reduced server bandwidth
- ✅ Better user experience
- ✅ Scalable solution
- ✅ CDN distribution worldwide

## Implementation Priority:
1. Move videos first (biggest impact)
2. Move large images (2MB+)
3. Optimize remaining images
4. Add lazy loading for car images 