'use client';

import { useEffect, useState } from 'react';
import { api, endpoints } from '@/lib/api';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  processing: 'Đang xử lý',
  shipping: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<
    { _id: string; orderCode: string; total: number; status: string; customerName: string; createdAt: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(endpoints.orders({ limit: 50 }))
      .then((res) => setOrders(res.data?.data || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.post(endpoints.orderStatus(id), { status });
      setOrders((prev) =>
        prev.map((o) => (o._id === id ? { ...o, status } : o))
      );
    } catch {
      alert('Cập nhật thất bại');
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-8">Đơn hàng</h1>
      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="text-left p-4">Mã đơn</th>
                <th className="text-left p-4">Khách hàng</th>
                <th className="text-left p-4">Tổng tiền</th>
                <th className="text-left p-4">Trạng thái</th>
                <th className="text-right p-4">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="p-4 font-mono">{o.orderCode}</td>
                  <td className="p-4">{o.customerName}</td>
                  <td className="p-4">{new Intl.NumberFormat('vi-VN').format(o.total)}đ</td>
                  <td className="p-4">
                    <select
                      value={o.status}
                      onChange={(e) => updateStatus(o._id, e.target.value)}
                      className="px-2 py-1 border rounded dark:bg-gray-700"
                    >
                      {Object.entries(STATUS_LABELS).map(([v, l]) => (
                        <option key={v} value={v}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4 text-right">-</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
