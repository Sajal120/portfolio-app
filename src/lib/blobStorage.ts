import { put, del, list, type ListBlobResult } from '@vercel/blob';

// Types for blob operations
export interface BlobFile {
  url: string;
  pathname: string;
  size: number;
  uploadedAt: Date;
  filename: string;
}

export interface UploadResult {
  url: string;
  pathname: string;
  filename: string;
}

export interface UploadError {
  error: string;
  message: string;
}

// Check if we're in a development environment
const isDevelopment = import.meta.env.DEV;

// Upload a file to Vercel Blob storage
export const uploadToBlob = async (
  file: File,
  folder?: string
): Promise<{ data: UploadResult | null; error: UploadError | null }> => {
  try {
    const token = import.meta.env.VITE_BLOB_READ_WRITE_TOKEN;
    
    if (!token) {
      return {
        data: null,
        error: {
          error: 'Configuration Error',
          message: 'VITE_BLOB_READ_WRITE_TOKEN not found in environment variables'
        }
      };
    }

    // For development, we'll create a mock upload since CORS blocks direct API calls
    if (isDevelopment) {
      console.log('Development mode: Simulating blob upload');
      
      // Create a data URL from the file for development mode
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          
          // Generate mock data that looks like a real Vercel Blob response
          const timestamp = Date.now();
          const randomString = Math.random().toString(36).substring(2, 8);
          const fileExt = file.name.split('.').pop();
          const filename = `${timestamp}-${randomString}.${fileExt}`;
          const pathname = folder ? `${folder}/${filename}` : filename;
          
          // Store in localStorage for testing with the actual data URL
          const mockFiles = JSON.parse(localStorage.getItem('mockBlobFiles') || '[]');
          const newFile = {
            url: dataUrl, // Use the actual data URL instead of a fake URL
            pathname: pathname,
            filename: filename,
            size: file.size,
            uploadedAt: new Date().toISOString(),
            type: file.type
          };
          mockFiles.push(newFile);
          localStorage.setItem('mockBlobFiles', JSON.stringify(mockFiles));
          
          console.log('Mock file uploaded with data URL:', { filename, size: file.size });
          
          resolve({
            data: {
              url: dataUrl,
              pathname: pathname,
              filename: filename
            },
            error: null
          });
        };
        
        reader.onerror = () => {
          resolve({
            data: null,
            error: {
              error: 'File Read Error',
              message: 'Failed to read file for development mode'
            }
          });
        };
        
        reader.readAsDataURL(file);
      });
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const filename = `${timestamp}-${randomString}.${fileExt}`;
    
    // Add folder prefix if provided
    const pathname = folder ? `${folder}/${filename}` : filename;

    const blob = await put(pathname, file, {
      access: 'public',
      token: token,
    });

    return {
      data: {
        url: blob.url,
        pathname: blob.pathname,
        filename: filename
      },
      error: null
    };
  } catch (error) {
    console.error('Error uploading to blob:', error);
    return {
      data: null,
      error: {
        error: 'Upload Failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    };
  }
};

// Delete a file from Vercel Blob storage
export const deleteFromBlob = async (
  url: string
): Promise<{ success: boolean; error: string | null }> => {
  try {
    const token = import.meta.env.VITE_BLOB_READ_WRITE_TOKEN;
    
    if (!token) {
      return {
        success: false,
        error: 'VITE_BLOB_READ_WRITE_TOKEN not found in environment variables'
      };
    }

    // For development, use mock deletion
    if (isDevelopment) {
      console.log('Development mode: Simulating blob deletion for:', url);
      
      const mockFiles = JSON.parse(localStorage.getItem('mockBlobFiles') || '[]');
      const updatedFiles = mockFiles.filter((file: { url: string }) => file.url !== url);
      localStorage.setItem('mockBlobFiles', JSON.stringify(updatedFiles));
      
      console.log('Mock file deleted:', url);
      
      return {
        success: true,
        error: null
      };
    }

    console.log('Attempting to delete file:', url);
    await del(url, { token });
    console.log('File deleted successfully:', url);

    return {
      success: true,
      error: null
    };
  } catch (error) {
    console.error('Error deleting from blob:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Delete multiple files from Vercel Blob storage
export const deleteMultipleFromBlob = async (
  urls: string[]
): Promise<{ success: boolean; error: string | null; failedUrls: string[] }> => {
  try {
    const token = import.meta.env.VITE_BLOB_READ_WRITE_TOKEN;
    
    if (!token) {
      return {
        success: false,
        error: 'VITE_BLOB_READ_WRITE_TOKEN not found in environment variables',
        failedUrls: urls
      };
    }

    // For development, use mock deletion
    if (isDevelopment) {
      console.log('Development mode: Simulating multiple blob deletions');
      
      const mockFiles = JSON.parse(localStorage.getItem('mockBlobFiles') || '[]');
      const updatedFiles = mockFiles.filter((file: { url: string }) => 
        !urls.includes(file.url)
      );
      localStorage.setItem('mockBlobFiles', JSON.stringify(updatedFiles));
      
      console.log('Mock files deleted:', urls);
      
      return {
        success: true,
        error: null,
        failedUrls: []
      };
    }

    const deletePromises = urls.map(async (url) => {
      try {
        await del(url, { token });
        return { url, success: true };
      } catch (error) {
        console.error(`Failed to delete ${url}:`, error);
        return { url, success: false };
      }
    });

    const results = await Promise.all(deletePromises);
    const failedUrls = results.filter(r => !r.success).map(r => r.url);

    return {
      success: failedUrls.length === 0,
      error: failedUrls.length > 0 ? `Failed to delete ${failedUrls.length} files` : null,
      failedUrls
    };
  } catch (error) {
    console.error('Error deleting multiple files from blob:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      failedUrls: urls
    };
  }
};

// List files in Vercel Blob storage
export const listBlobFiles = async (
  prefix?: string,
  limit?: number
): Promise<{ data: BlobFile[] | null; error: string | null }> => {
  try {
    const token = import.meta.env.VITE_BLOB_READ_WRITE_TOKEN;
    
    if (!token) {
      return {
        data: null,
        error: 'VITE_BLOB_READ_WRITE_TOKEN not found in environment variables'
      };
    }

    // For development, use mock listing
    if (isDevelopment) {
      console.log('Development mode: Using mock blob listing');
      
      const mockFiles = JSON.parse(localStorage.getItem('mockBlobFiles') || '[]');
      console.log('Mock files found:', mockFiles.length);
      
      let filteredFiles = mockFiles;
      
      if (prefix) {
        console.log('Filtering by prefix:', prefix);
        filteredFiles = mockFiles.filter((file: { pathname: string }) => 
          file.pathname.startsWith(prefix)
        );
      }
      
      const files: BlobFile[] = filteredFiles.map((file: {
        url: string;
        pathname: string;
        size: number;
        uploadedAt: string;
        filename: string;
      }) => ({
        url: file.url,
        pathname: file.pathname,
        size: file.size,
        uploadedAt: new Date(file.uploadedAt),
        filename: file.filename
      }));

      console.log('Processed mock files:', files);

      return {
        data: files,
        error: null
      };
    }

    const options: Parameters<typeof list>[0] = {
      token,
      limit: limit || 1000,
    };

    if (prefix) {
      options.prefix = prefix;
      console.log('Listing files with prefix:', prefix);
    } else {
      console.log('Listing all files');
    }

    const result: ListBlobResult = await list(options);
    
    console.log('Raw blob result:', result);
    console.log('Found blobs:', result.blobs?.length || 0);

    const files: BlobFile[] = result.blobs.map(blob => ({
      url: blob.url,
      pathname: blob.pathname,
      size: blob.size,
      uploadedAt: blob.uploadedAt,
      filename: blob.pathname.split('/').pop() || blob.pathname
    }));

    console.log('Processed files:', files);

    return {
      data: files,
      error: null
    };
  } catch (error) {
    console.error('Error listing blob files:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Get public URL for a blob file (since Vercel Blob URLs are already public)
export const getBlobPublicUrl = (url: string): string => {
  return url;
};

// Validate file type for uploads
export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.some(type => file.type.startsWith(type));
};

// Validate file size
export const validateFileSize = (file: File, maxSizeInMB: number): boolean => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
};

// Helper function to format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Extract filename from Vercel Blob URL
export const extractFilenameFromUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    return pathname.split('/').pop() || 'unknown';
  } catch {
    return 'unknown';
  }
};

// Generate a safe filename
export const generateSafeFilename = (originalName: string, prefix?: string): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const fileExt = originalName.split('.').pop();
  const safeName = originalName
    .replace(/[^a-zA-Z0-9.-]/g, '-')
    .replace(/--+/g, '-')
    .toLowerCase();
  
  const nameWithoutExt = safeName.substring(0, safeName.lastIndexOf('.')) || safeName;
  const finalName = prefix 
    ? `${prefix}-${nameWithoutExt}-${timestamp}-${randomString}.${fileExt}`
    : `${nameWithoutExt}-${timestamp}-${randomString}.${fileExt}`;
    
  return finalName;
};