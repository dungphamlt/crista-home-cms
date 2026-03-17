"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { api, endpoints } from "@/lib/api";

type Product = {
  _id: string;
  name: string;
  slug?: string;
  price: number;
  compareAtPrice?: number;
  images?: string[];
  shortDescription?: string;
  stock?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  categories?: { _id: string; name: string }[];
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = () => {
    api
      .get(endpoints.productsAdmin({ limit: 50 }))
      .then((res) => setProducts(res.data?.data || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Xóa sản phẩm "${name}"?`)) return;
    try {
      await api.delete(endpoints.product(id));
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch {
      alert("Xóa thất bại");
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Sản phẩm</h1>
        <Link
          href="/products/new"
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg"
        >
          Thêm sản phẩm
        </Link>
      </div>
      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="text-left p-4 w-16">Ảnh</th>
                <th className="text-left p-4">Tên</th>
                <th className="text-left p-4">Mô tả</th>
                <th className="text-left p-4">Giá</th>
                <th className="text-left p-4">Tồn kho</th>
                <th className="text-left p-4">Trạng thái</th>
                <th className="text-right p-4">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr
                  key={p._id}
                  className="border-t border-gray-200 dark:border-gray-700"
                >
                  <td className="p-4">
                    {p.images?.[0] ? (
                      <div className="relative w-12 h-12 rounded overflow-hidden bg-gray-100">
                        <Image
                          src={p.images[0]}
                          alt={p.name}
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
                  <td className="p-4 max-w-[180px]">
                    <p className="font-medium line-clamp-2">{p.name}</p>
                  </td>
                  <td className="p-4 max-w-[200px]">
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {p.shortDescription || "-"}
                    </p>
                  </td>
                  <td className="p-4">
                    <span className="text-red-600 font-medium">
                      {new Intl.NumberFormat("vi-VN").format(p.price)}đ
                    </span>
                    {p.compareAtPrice && p.compareAtPrice > p.price && (
                      <span className="ml-2 text-sm text-gray-400 line-through">
                        {new Intl.NumberFormat("vi-VN").format(p.compareAtPrice)}đ
                      </span>
                    )}
                  </td>
                  <td className="p-4">{p.stock ?? 0}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        p.isActive
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                      }`}
                    >
                      {p.isActive ? "Hiển thị" : "Ẩn"}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <Link
                      href={`/products/${p._id}`}
                      className="text-amber-600 hover:underline"
                    >
                      Sửa
                    </Link>
                    <button
                      onClick={() => handleDelete(p._id, p.name)}
                      className="text-red-600 hover:underline"
                    >
                      Xóa
                    </button>
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
