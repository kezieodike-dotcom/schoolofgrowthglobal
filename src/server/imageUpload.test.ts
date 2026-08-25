import { buildImageUploadPath, isAllowedImageMime, MAX_IMAGE_UPLOAD_BYTES } from './imageUpload.js';

if (!isAllowedImageMime('image/webp')) {
  throw new Error('WebP images should be accepted for site content uploads.');
}

if (isAllowedImageMime('application/pdf')) {
  throw new Error('Non-image documents should not be accepted as site content images.');
}

if (MAX_IMAGE_UPLOAD_BYTES !== 5 * 1024 * 1024) {
  throw new Error('Admin image uploads should remain capped at 5MB.');
}

const path = buildImageUploadPath('job', 'Senior Growth Role.png');

if (!path.startsWith('job/') || !path.endsWith('.png') || path.includes(' ')) {
  throw new Error(`Upload paths should be safe and grouped by content type. Received: ${path}`);
}
