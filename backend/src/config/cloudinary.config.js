// ─────────────────────────────────────────────────────────────
// FILE: backend/src/config/cloudinary.config.js
// PRODUCTION-READY — Includes:
//   ✅ fetch_format: 'auto' — serves WebP to modern browsers
//      (saves Cloudinary credits — smaller files = less bandwidth)
//   ✅ quality: 'auto' — Cloudinary picks best compression
//   ✅ Memory storage — no local disk writes (Render ephemeral FS fix)
//   ✅ Thumbnail uses Cloudinary URL transforms, no extra upload
// ─────────────────────────────────────────────────────────────

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true  // always use https
});

// ✅ FIX: Memory-based storage via CloudinaryStorage
//         Never touches local disk — safe on Render's ephemeral filesystem
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'civicconnect/issues',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    // ✅ FIX: fetch_format auto → serves WebP to modern browsers
    //         Reduces file size by ~30%, saving Cloudinary credits
    transformation: [
      {
        width: 1200,
        height: 900,
        crop: 'limit',
        quality: 'auto',
        fetch_format: 'auto'   // ✅ saves Cloudinary credits
      }
    ],
    public_id: `issue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  })
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPEG, PNG, WebP images are allowed'), false);
  }
});

// ─────────────────────────────────────────────
// Helper: Build thumbnail URL from full URL
// ✅ FIX: Uses Cloudinary URL transforms instead of
//         uploading a separate thumbnail (saves credits)
// ─────────────────────────────────────────────
function getThumbnailUrl(cloudinaryUrl) {
  // Insert transformation into the Cloudinary URL path
  // e.g. .../upload/image.jpg → .../upload/c_thumb,w_300,h_200,q_auto/image.jpg
  return cloudinaryUrl.replace(
    '/upload/',
    '/upload/c_thumb,w_300,h_200,q_auto,f_auto/'
  );
}

module.exports = { cloudinary, upload, getThumbnailUrl };