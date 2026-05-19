/**
 * Cloudflare R2 presigned upload — Handoff §13
 * Go backend binds JSON: uploadType, contentType, filename (camelCase).
 */

import apiClient from '../services/api/client';
import { handleApiError } from '../services/api/client';
import { unwrap } from '../services/api/base';

export interface PresignedUploadResult {
  uploadUrl: string;
  publicUrl: string;
}

/** Map UI folder names → backend upload_type enum */
const UPLOAD_TYPE_BY_FOLDER: Record<string, string> = {
  banners: 'banner',
  banner: 'banner',
  restaurants: 'restaurant',
  restaurant: 'restaurant',
  menu: 'menu_item',
  menu_item: 'menu_item',
  menu_category: 'menu_category',
  category: 'menu_category',
};

function resolveUploadType(folder: string): string {
  const key = folder.trim().toLowerCase();
  const mapped = UPLOAD_TYPE_BY_FOLDER[key];
  if (mapped) return mapped;
  const stripped = key.replace(/s$/, '');
  return stripped || 'banner';
}

export async function getPresignedUploadUrl(params: {
  folder: string;
  filename: string;
  contentType: string;
}): Promise<PresignedUploadResult> {
  try {
    const uploadType = resolveUploadType(params.folder);
    const contentType = params.contentType?.trim() || 'image/jpeg';

    const res = await apiClient.post('/uploads/presigned-url', {
      uploadType,
      contentType,
      filename: params.filename,
    });

    const body = (unwrap(res.data) ?? res.data) as PresignedUploadResult & {
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
  const contentType = file.type?.trim() || 'image/jpeg';

  const attempts: { headers?: Record<string, string> }[] = [
    { headers: { 'Content-Type': contentType } },
    {},
  ];

  let lastStatus = 0;
  for (const attempt of attempts) {
    try {
      const res = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: attempt.headers,
        credentials: 'omit',
        mode: 'cors',
      });
      if (res.ok) return;
      lastStatus = res.status;
    } catch (err) {
      const isNetwork =
        err instanceof TypeError &&
        (err.message === 'Failed to fetch' || err.message.includes('NetworkError'));
      if (isNetwork) {
        throw new Error(
          'تعذّر رفع الصورة من المتصفح (CORS على R2). الصق رابط الصورة في الحقل، أو اطلب من الباك تفعيل CORS على bucket التخزين للدومين: ' +
            (typeof window !== 'undefined' ? window.location.origin : 'admin')
        );
      }
      throw err instanceof Error ? err : new Error('فشل رفع الملف');
    }
  }

  throw new Error(
    lastStatus
      ? `فشل رفع الملف إلى التخزين (HTTP ${lastStatus})`
      : 'فشل رفع الملف إلى التخزين'
  );
}

export async function uploadImage(file: File, folder: string): Promise<string> {
  const contentType = file.type?.trim() || 'image/jpeg';
  const { uploadUrl, publicUrl } = await getPresignedUploadUrl({
    folder,
    filename: file.name,
    contentType,
  });
  await uploadFileToPresignedUrl(uploadUrl, file);
  return publicUrl;
}
