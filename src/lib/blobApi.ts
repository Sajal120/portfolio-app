import { put, del, list } from '@vercel/blob';

// Note: In a real Vercel deployment, these would be API routes
// For local development, we'll use a different approach

export async function uploadFile(file: File, folder?: string) {
  // This will work in production on Vercel
  if (typeof window === 'undefined') {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const fileExt = file.name.split('.').pop();
    const filename = `${timestamp}-${randomString}.${fileExt}`;
    const pathname = folder ? `${folder}/${filename}` : filename;

    const blob = await put(pathname, file, {
      access: 'public',
      token: token,
    });

    return {
      url: blob.url,
      pathname: blob.pathname,
      filename: filename
    };
  }
  
  // For local development, we'll simulate the upload
  throw new Error('Server-side API required for blob operations');
}

export async function deleteFile(url: string) {
  if (typeof window === 'undefined') {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    await del(url, { token });
    return { success: true };
  }
  
  throw new Error('Server-side API required for blob operations');
}

export async function listFiles(prefix?: string) {
  if (typeof window === 'undefined') {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    
    const options: Parameters<typeof list>[0] = {
      token,
      limit: 1000,
    };

    if (prefix) {
      options.prefix = prefix;
    }

    const result = await list(options);
    
    return result.blobs.map(blob => ({
      url: blob.url,
      pathname: blob.pathname,
      size: blob.size,
      uploadedAt: blob.uploadedAt,
      filename: blob.pathname.split('/').pop() || blob.pathname
    }));
  }
  
  throw new Error('Server-side API required for blob operations');
}