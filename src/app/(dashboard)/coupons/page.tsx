'use client';

import { useEffect, useState } from 'react';
import { api, endpoints } from '@/lib/api';

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<
    { _id: string; code: string; type: string; value: number; isActive: boolean }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(endpoints.coupons())
      .then((res) => setCoupons(res.data?.data || []))
      .catch(() => setCoupons([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-8">Mã giảm giá</h1>
      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="text-left p-4">Mã</th>
                <th className="text-left p-4">Loại</th>
                <th className="text-left p-4">Giá trị</th>
                <th className="text-left p-4">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c._id} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="p-4 font-mono">{c.code}</td>
                  <td className="p-4">{c.type === 'percent' ? 'Phần trăm' : 'Cố định'}</td>
                  <td className="p-4">
                    {c.type === 'percent' ? `${c.value}%` : `${c.value.toLocaleString('vi-VN')}đ`}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        c.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {c.isActive ? 'Hoạt động' : 'Tắt'}
                    </span>
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
