'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { api, endpoints } from '@/lib/api';
import { postService } from '@/services/postService';
import CkEditor from '@/components/ckeditor';

export default function EditBlogPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    api
      .get(endpoints.blog(id))
      .then((res) => {
        const b = res.data;
        setTitle(b.title || '');
        setExcerpt(b.excerpt || '');
        setContent(b.content || '');
        setThumbnail(b.thumbnail || '');
        setIsPublished(b.isPublished ?? false);
      })
      .catch(() => router.push('/blogs'))
      .finally(() => setFetching(false));
  }, [id, router]);

  const handleImageUpload = async (files: FileList | null) => {
    if (!files?.length || uploading) return;
    setUploading(true);
    const file = files[0];
    if (file?.type.startsWith('image/')) {
      const res = await postService.uploadImage(file);
      if (res.success && res.data?.url) setThumbnail(res.data.url);
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(endpoints.blog(id), {
        title,
        excerpt,
        content,
        thumbnail: thumbnail || undefined,
        isPublished,
      });
      router.push('/blogs');
    } catch {
      alert('Cập nhật thất bại');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="p-8">
        <p>Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/blogs" className="text-gray-500 hover:text-gray-700">
          ← Quay lại
        </Link>
        <h1 className="text-2xl font-bold">Sửa bài viết</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        <div>
          <label className="block font-medium mb-2">Ảnh thumbnail</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload(e.target.files)}
            className="hidden"
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.classList.add('ring-2', 'ring-amber-500');
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.currentTarget.classList.remove('ring-2', 'ring-amber-500');
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.classList.remove('ring-2', 'ring-amber-500');
              handleImageUpload(e.dataTransfer.files);
            }}
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-amber-500 hover:bg-amber-50/50 dark:hover:bg-amber-900/10 transition-colors"
          >
            {thumbnail ? (
              <div className="relative w-48 h-32 mx-auto rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 group">
                <Image
                  src={thumbnail}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="192px"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setThumbnail('');
                  }}
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-sm transition-opacity"
                >
                  Xóa
                </button>
              </div>
            ) : uploading ? (
              <p className="text-gray-500">Đang tải lên...</p>
            ) : (
              <p className="text-gray-500">
                Kéo thả ảnh vào đây hoặc{' '}
                <span className="text-amber-600 font-medium">chọn ảnh</span>
              </p>
            )}
          </div>
        </div>
        <div>
          <label className="block font-medium mb-2">Tiêu đề</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
          />
        </div>
        <div>
          <label className="block font-medium mb-2">Mô tả ngắn</label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={2}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
          />
        </div>
        <div>
          <label className="block font-medium mb-2">Nội dung</label>
          <CkEditor editorData={content} setEditorData={setContent} />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="published"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
          />
          <label htmlFor="published">Xuất bản</label>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-lg"
        >
          {loading ? 'Đang lưu...' : 'Lưu'}
        </button>
      </form>
    </div>
  );
}
