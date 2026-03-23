'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api, endpoints } from '@/lib/api';

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<
    { _id: string; title: string; slug: string; thumbnail?: string; isPublished: boolean }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(endpoints.blogsAdmin(1))
      .then((res) => setBlogs(res.data?.data || []))
      .catch(() => setBlogs([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Bài viết</h1>
        <Link
          href="/blogs/new"
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg"
        >
          Thêm bài viết
        </Link>
      </div>
      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="text-left p-4">Ảnh</th>
                <th className="text-left p-4">Tiêu đề</th>
                <th className="text-left p-4">Slug</th>
                <th className="text-left p-4">Trạng thái</th>
                <th className="text-right p-4">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {blogs.map((b) => (
                <tr key={b._id} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="p-4">
                    {b.thumbnail ? (
                      <div className="relative w-12 h-12 rounded overflow-hidden bg-gray-100 dark:bg-gray-700">
                        <Image
                          src={b.thumbnail}
                          alt={b.title}
                          fill
                          className="object-cover"
                          sizes="48px"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-400 text-xs">
                        N/A
                      </div>
                    )}
                  </td>
                  <td className="p-4">{b.title}</td>
                  <td className="p-4 text-gray-500">{b.slug}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        b.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {b.isPublished ? 'Đã xuất bản' : 'Nháp'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <Link href={`/blogs/${b._id}`} className="text-amber-600 hover:underline">
                      Sửa
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
