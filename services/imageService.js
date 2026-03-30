import { supabaseAdmin } from '../config/supabase.js';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import mime from 'mime-types';

class ImageService {
  constructor() {
    this.bucketName = 'hostel-images';
    this.allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    this.maxFileSize = 5 * 1024 * 1024; // 5MB
    this.maxRetries = 3;
    this.retryDelay = 1000;
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getContentType(filename, mimetype) {
    // First try to use the provided mimetype
    if (mimetype && this.allowedMimeTypes.includes(mimetype)) {
      return mimetype;
    }
    
    // Try to detect from file extension
    const ext = path.extname(filename).toLowerCase();
    const detectedType = mime.lookup(ext);
    
    if (detectedType && this.allowedMimeTypes.includes(detectedType)) {
      return detectedType;
    }
    
    // Default to JPEG
    console.warn(`⚠️  Unknown content type for ${filename}, defaulting to image/jpeg`);
    return 'image/jpeg';
  }

  async uploadImage(file, folder = 'hostel-images', retryCount = 0) {
    try {
      if (!file) {
        throw new Error('No file provided');
      }

      // Debug: Check file buffer
      console.log('🔍 File buffer analysis:');
      console.log('  - Buffer type:', typeof file.buffer);
      console.log('  - Buffer length:', file.buffer?.length);
      console.log('  - Is Buffer?', Buffer.isBuffer(file.buffer));
      if (file.buffer) {
        const firstBytes = file.buffer.slice(0, 20);
        console.log('  - First 20 bytes (hex):', firstBytes.toString('hex'));
        console.log('  - First 100 bytes (string):', file.buffer.slice(0, 100).toString('utf8'));
        // Check if it looks like JSON
        const str = file.buffer.slice(0, 200).toString('utf8');
        const isJson = str.trim().startsWith('{') || str.trim().startsWith('[');
        console.log('  - Appears to be JSON?', isJson);
        if (isJson) {
          console.log('  ⚠️  WARNING: Buffer contains JSON data instead of image binary!');
          console.log('  - JSON content preview:', str.substring(0, 200));
        }
        // Check if it looks like JPEG
        const isJpeg = firstBytes[0] === 0xFF && firstBytes[1] === 0xD8 && firstBytes[2] === 0xFF;
        console.log('  - Appears to be JPEG?', isJpeg);
      }
      console.log('  - Original name:', file.originalname);
      console.log('  - Mimetype:', file.mimetype);
      console.log('  - Size:', file.size);

      // Get proper content type
      const contentType = this.getContentType(file.originalname, file.mimetype);
      
      console.log('📤 Upload attempt:', {
        attempt: retryCount + 1,
        filename: file.originalname,
        size: file.size,
        providedType: file.mimetype,
        actualType: contentType,
        folder,
        bucket: this.bucketName
      });

      // Validate file type
      if (!this.allowedMimeTypes.includes(contentType)) {
        throw new Error(`Invalid file type: ${contentType}. Allowed: ${this.allowedMimeTypes.join(', ')}`);
      }

      // Validate file size
      if (file.size > this.maxFileSize) {
        throw new Error(`File too large. Max size: ${this.maxFileSize / 1024 / 1024}MB`);
      }

      // Generate unique filename
      const fileExtension = path.extname(file.originalname);
      const fileName = `${folder}/${uuidv4()}${fileExtension}`;

      // Create a Blob from the buffer for better content type handling
      const blob = new Blob([file.buffer], { type: contentType });
      
      console.log('🔄 Blob creation:');
      console.log('  - Blob type:', blob.type);
      console.log('  - Blob size:', blob.size);

      // Try using signed upload URL for better content type control
      //console.log('🔐 Creating signed upload URL...');
      const { data: uploadData, error: signedError } = await supabaseAdmin.storage
        .from(this.bucketName)
        .createSignedUploadUrl(fileName);
      
      if (signedError) {
        console.log('⚠️  Signed URL failed, falling back to direct upload:', signedError.message);
        
        // Fallback to direct upload with explicit content type
        var { data, error } = await supabaseAdmin.storage
          .from(this.bucketName)
          .upload(fileName, blob, {
            contentType: contentType,
            cacheControl: '3600',
            upsert: false
          });
          
        if (error) {
          console.error('Direct upload error:', error);
          throw error;
        }
        
        console.log('✅ Direct upload successful');
      } else {
        console.log('📤 Uploading via signed URL...');
        
        // Upload using signed URL with proper headers
        const uploadResponse = await fetch(uploadData.signedUrl, {
          method: 'PUT',
          body: blob,
          headers: {
            'Content-Type': contentType,
            'Cache-Control': '3600'
          }
        });
        
        if (!uploadResponse.ok) {
          throw new Error(`Signed URL upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
        }
        
        console.log('✅ Signed URL upload successful');
        var data = { path: fileName }; // Mock data object for consistency
      }

      // Get public URL
      const { data: { publicUrl } } = supabaseAdmin.storage
        .from(this.bucketName)
        .getPublicUrl(fileName);

      console.log('✅ Upload successful!');
      console.log('Public URL:', publicUrl);
      console.log('File path:', data.path);

      return {
        success: true,
        url: publicUrl,
        path: fileName,
        filename: fileName.split('/').pop()
      };
    } catch (error) {
      console.error('Error in uploadImage:', error);
      throw error;
    }
  }

  async uploadMultipleImages(files, folder = 'hostel-images') {
    if (!files || files.length === 0) {
      return { success: true, images: [], uploads: [] };
    }

    const results = [];
    const errors = [];

    for (const file of files) {
      try {
        const result = await this.uploadImage(file, folder);
        results.push(result);
      } catch (error) {
        console.error(`Failed to upload ${file.originalname}:`, error.message);
        errors.push({ file: file.originalname, error: error.message });
      }
    }

    return {
      success: results.length > 0,
      images: results.map(r => r.url),
      uploads: results,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  async deleteImage(imageUrl) {
    try {
      if (!imageUrl) return { success: true };

      // Extract path from URL
      const urlParts = imageUrl.split('/');
      const publicIndex = urlParts.indexOf('public');
      if (publicIndex === -1) {
        throw new Error('Invalid image URL format');
      }
      
      const path = urlParts.slice(publicIndex + 2).join('/');
      
      console.log('Deleting image:', path);
      
      const { error } = await supabaseAdmin.storage
        .from(this.bucketName)
        .remove([path]);

      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  }

  async replaceImage(oldImageUrl, newFile) {
    try {
      // First delete the old image
      await this.deleteImage(oldImageUrl);
      
      // Then upload the new image
      const uploadResult = await this.uploadImage(newFile);
      
      if (!uploadResult.success || !uploadResult.url) {
        throw new Error('Failed to upload replacement image');
      }
      
      return { success: true, url: uploadResult.url };
    } catch (error) {
      console.error('Error replacing image:', error);
      throw error;
    }
  }
}

export default new ImageService();