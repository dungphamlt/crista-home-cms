import { api } from '@/lib/api';

export interface UploadImageResponse {
  success: boolean;
  data?: {
    url?: string;
    result?: { variants?: string[] };
  };
  error?: string;
}

export const postService = {
  async uploadImage(file: File, _folder?: string): Promise<UploadImageResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await api.post<{ success: boolean; data?: { url: string } }>(
        '/upload/image',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (res.data?.success && res.data?.data) {
        return {
          success: true,
          data: {
            url: res.data.data.url,
          },
        };
      }

      return {
        success: false,
        error: 'Upload thất bại',
      };
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data
              ?.message
          : 'Upload thất bại';
      return {
        success: false,
        error: typeof message === 'string' ? message : 'Upload thất bại',
      };
    }
  },
};
