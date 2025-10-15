import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  public_id: string;
  secure_url: string;
  width?: number;
  height?: number;
  format: string;
  bytes: number;
}

export interface UploadOptions {
  folder?: string;
  transformation?: any;
  resource_type?: 'image' | 'video' | 'raw' | 'auto';
  quality?: 'auto' | number;
  format?: 'auto' | string;
}

class CloudinaryService {
  async uploadFile(
    file: Buffer | string,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    try {
      const result = await cloudinary.uploader.upload(file, {
        folder: options.folder || 'ryd-employees',
        resource_type: options.resource_type || 'auto',
        quality: options.quality || 'auto',
        format: options.format || 'auto',
        transformation: options.transformation,
      });

      return {
        public_id: result.public_id,
        secure_url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
      };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error('Failed to upload file to Cloudinary');
    }
  }

  async uploadProfilePhoto(
    file: Buffer | string,
    employeeId: string
  ): Promise<UploadResult> {
    return this.uploadFile(file, {
      folder: `ryd-employees/profile-photos/${employeeId}`,
      transformation: {
        width: 400,
        height: 400,
        crop: 'fill',
        gravity: 'face',
        quality: 'auto',
      },
      resource_type: 'image',
    });
  }

  async uploadDocument(
    file: Buffer | string,
    employeeId: string,
    category: string
  ): Promise<UploadResult> {
    return this.uploadFile(file, {
      folder: `ryd-employees/documents/${employeeId}/${category}`,
      resource_type: 'raw',
    });
  }

  async deleteFile(publicId: string): Promise<boolean> {
    try {
      await cloudinary.uploader.destroy(publicId);
      return true;
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      return false;
    }
  }

  async getFileInfo(publicId: string) {
    try {
      return await cloudinary.api.resource(publicId);
    } catch (error) {
      console.error('Cloudinary get info error:', error);
      throw new Error('Failed to get file information');
    }
  }

  generateImageUrl(publicId: string, transformations?: any): string {
    return cloudinary.url(publicId, {
      ...transformations,
      secure: true,
    });
  }

  generateThumbnailUrl(publicId: string, width: number = 200, height: number = 200): string {
    return cloudinary.url(publicId, {
      width,
      height,
      crop: 'fill',
      quality: 'auto',
      secure: true,
    });
  }
}

export const cloudinaryService = new CloudinaryService();
export default cloudinaryService;
