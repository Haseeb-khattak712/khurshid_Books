/**
 * Image Compression Utility for Khurshid Books
 * Automatically optimizes and compresses product images in the browser
 * before uploading to Supabase Storage.
 */

/**
 * Format bytes into readable string (e.g., "1.4 MB", "85 KB")
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Compresses an image File or Blob using HTML5 Canvas.
 * Resizes excessive dimensions and encodes to lightweight, crisp WebP (or JPEG fallback).
 *
 * @param {File} file - Original file from user input
 * @param {Object} options - Compression configuration
 * @param {number} [options.maxWidth=1200] - Max bounding box width in pixels
 * @param {number} [options.maxHeight=1200] - Max bounding box height in pixels
 * @param {number} [options.quality=0.82] - Quality factor between 0 and 1
 * @param {string} [options.preferredFormat='image/webp'] - Target format
 * @returns {Promise<{
 *   file: File,
 *   originalSize: number,
 *   compressedSize: number,
 *   savedBytes: number,
 *   reductionPercent: number,
 *   width: number,
 *   height: number
 * }>}
 */
export async function compressImage(file, options = {}) {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.82,
    preferredFormat = 'image/webp'
  } = options;

  // If not an image, return original file safely
  if (!file || !file.type || !file.type.startsWith('image/')) {
    return {
      file,
      originalSize: file?.size || 0,
      compressedSize: file?.size || 0,
      savedBytes: 0,
      reductionPercent: 0,
      width: 0,
      height: 0
    };
  }

  // Animated GIFs or SVGs should be left untouched to preserve animation / vector
  if (file.type === 'image/gif' || file.type === 'image/svg+xml') {
    return {
      file,
      originalSize: file.size,
      compressedSize: file.size,
      savedBytes: 0,
      reductionPercent: 0,
      width: 0,
      height: 0
    };
  }

  return new Promise((resolve) => {
    const originalSize = file.size;
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Calculate aspect-ratio-preserving dimensions
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve({
            file,
            originalSize,
            compressedSize: originalSize,
            savedBytes: 0,
            reductionPercent: 0,
            width,
            height
          });
        }

        // Use high quality image interpolation
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Helper to extract blob
        const processBlob = (blob) => {
          if (!blob) {
            return resolve({
              file,
              originalSize,
              compressedSize: originalSize,
              savedBytes: 0,
              reductionPercent: 0,
              width,
              height
            });
          }

          // If the compressed output happens to be larger than original, keep original
          if (blob.size >= originalSize && (file.type === 'image/webp' || file.type === 'image/jpeg')) {
            return resolve({
              file,
              originalSize,
              compressedSize: originalSize,
              savedBytes: 0,
              reductionPercent: 0,
              width,
              height
            });
          }

          // Determine appropriate file extension
          let extension = '.webp';
          if (blob.type === 'image/jpeg') extension = '.jpg';
          else if (blob.type === 'image/png') extension = '.png';

          const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
          const newFileName = `${baseName}_opt${extension}`;

          const compressedFile = new File([blob], newFileName, {
            type: blob.type,
            lastModified: Date.now()
          });

          const compressedSize = compressedFile.size;
          const savedBytes = Math.max(0, originalSize - compressedSize);
          const reductionPercent = Math.round((savedBytes / originalSize) * 100);

          resolve({
            file: compressedFile,
            originalSize,
            compressedSize,
            savedBytes,
            reductionPercent,
            width,
            height
          });
        };

        // Try encoding to WebP first, fallback to JPEG
        canvas.toBlob(
          (blob) => {
            if (blob) {
              processBlob(blob);
            } else {
              canvas.toBlob(
                (jpegBlob) => processBlob(jpegBlob),
                'image/jpeg',
                quality
              );
            }
          },
          preferredFormat,
          quality
        );
      } catch (err) {
        console.warn('Canvas compression error, falling back to original file:', err);
        resolve({
          file,
          originalSize,
          compressedSize: originalSize,
          savedBytes: 0,
          reductionPercent: 0,
          width: 0,
          height: 0
        });
      }
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      console.warn('Image load error during compression, using original:', err);
      resolve({
        file,
        originalSize,
        compressedSize: originalSize,
        savedBytes: 0,
        reductionPercent: 0,
        width: 0,
        height: 0
      });
    };

    img.src = objectUrl;
  });
}
