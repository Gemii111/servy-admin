/**
 * Cloudflare R2 presigned upload — Handoff §13
 */

import apiClient from '../services/api/client';
import { handleApiError } from '../services/api/client';

export interface PresignedUploadResult {
  uploadUrl: string;
  publicUrl: string;
}

export async function getPresignedUploadUrl(params: {
  folder: string;
  filename: string;
  contentType: string;
}): Promise<PresignedUploadResult> {
  try {
    const { data } = await apiClient.post<{
      data?: PresignedUploadResult;
      upload_url?: string;
      public_url?: string;
    }>('/uploads/presigned-url', {
      folder: params.folder,
      filename: params.filename,
      content_type: params.contentType,
    });
    const body = (data?.data ?? data) as PresignedUploadResult & {
      upload_url?: string;
      public_url?: string;
    };
    const uploadUrl = body.uploadUrl ?? body.upload_url;
    const publicUrl = body.publicUrl ?? body.public_url;
    if (!uploadUrl || !publicUrl) {
      throw new Error('استجابة رفع غير صالحة من السيرفر');
    }
    return { uploadUrl, publicUrl };
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}

export async function uploadFileToPresignedUrl(
  uploadUrl: string,
  file: File
): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type },
  });
  if (!res.ok) {
    throw new Error('فشل رفع الملف إلى التخزين');
  }
}

export async function uploadImage(file: File, folder: string): Promise<string> {
  const { uploadUrl, publicUrl } = await getPresignedUploadUrl({
    folder,
    filename: file.name,
    contentType: file.type || 'image/jpeg',
  });
  await uploadFileToPresignedUrl(uploadUrl, file);
  return publicUrl;
}
