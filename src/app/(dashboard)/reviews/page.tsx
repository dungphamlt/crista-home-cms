'use client';

import { useEffect, useState } from 'react';
import { api, endpoints } from '@/lib/api';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<
    { _id: string; customerName: string; rating: number; content: string; isApproved: boolean }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(endpoints.reviews())
      .then((res) => setReviews(res.data?.data || []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, []);

  const approve = async (id: string) => {
    try {
      await api.post(endpoints.reviewApprove(id));
      setReviews((prev) =>
        prev.map((r) => (r._id === id ? { ...r, isApproved: true } : r))
      );
    } catch {
      alert('Duyệt thất bại');
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-8">Đánh giá</h1>
      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div
              key={r._id}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 flex justify-between items-start"
            >
              <div>
                <p className="font-medium">{r.customerName}</p>
                <p className="text-yellow-500">{'★'.repeat(r.rating)}</p>
                <p className="text-gray-600 dark:text-gray-400 mt-1">{r.content}</p>
              </div>
              {!r.isApproved && (
                <button
                  onClick={() => approve(r._id)}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                >
                  Duyệt
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
