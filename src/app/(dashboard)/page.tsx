"use client";

import { useEffect, useState } from "react";
import { api, endpoints } from "@/lib/api";

export default function DashboardPage() {
  const [stats, setStats] = useState({ totalOrders: 0, totalProducts: 0 });

  useEffect(() => {
    Promise.all([
      api.get(endpoints.orders({ limit: 1 })),
      api.get(endpoints.products({ limit: 1 })),
    ])
      .then(([ordersRes, productsRes]) => {
        setStats({
          totalOrders: ordersRes.data?.total ?? 0,
          totalProducts: productsRes.data?.total ?? 0,
        });
      })
      .catch(() => {});
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-8">Tổng quan</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm">
            Tổng đơn hàng
          </h3>
          <p className="text-2xl font-bold mt-1">{stats.totalOrders}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm">
            Tổng sản phẩm
          </h3>
          <p className="text-2xl font-bold mt-1">{stats.totalProducts}</p>
        </div>
      </div>
    </div>
  );
}
