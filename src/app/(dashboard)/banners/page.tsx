'use client';

import { useEffect, useState } from 'react';
import { api, endpoints } from '@/lib/api';

export default function BannersPage() {
  const [banners, setBanners] = useState<
    { _id: string; title: string; image: string; isActive: boolean }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(endpoints.bannersAdmin())
      .then((res) => setBanners(res.data || []))
      .catch(() => setBanners([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-8">Banner</h1>
      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <div className="grid gap-4">
          {banners.map((b) => (
            <div
              key={b._id}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 flex items-center gap-4"
            >
              <div className="w-24 h-16 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden shrink-0">
                {b.image && (
                  <img src={b.image} alt="" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{b.title}</h3>
                <span
                  className={`text-sm ${b.isActive ? 'text-green-600' : 'text-gray-500'}`}
                >
                  {b.isActive ? 'Đang hiển thị' : 'Ẩn'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
