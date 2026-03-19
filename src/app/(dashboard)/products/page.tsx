"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  useProductsAdmin,
  useCategoriesAdmin,
  useDeleteProduct,
} from "@/hooks/useApi";
import { ProductDetailModal } from "@/components/products/ProductDetailModal";

const PAGE_SIZE = 10;

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [viewingProductId, setViewingProductId] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [category, setCategory] = useState("");
  const [isActive, setIsActive] = useState<string>("");
  const [isFeatured, setIsFeatured] = useState<string>("");
  const [isNewArrival, setIsNewArrival] = useState<string>("");

  const { data, isLoading } = useProductsAdmin({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    category: category || undefined,
    isActive: isActive || undefined,
    isFeatured: isFeatured || undefined,
    isNewArrival: isNewArrival || undefined,
  });

  const { data: categories = [] } = useCategoriesAdmin();
  const deleteProduct = useDeleteProduct();

  const products = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Xóa sản phẩm "${name}"?`)) return;
    try {
      await deleteProduct.mutateAsync(id);
    } catch {
      alert("Xóa thất bại");
    }
  };

  const clearFilters = () => {
    setSearch("");
    setSearchInput("");
    setCategory("");
    setIsActive("");
    setIsFeatured("");
    setIsNewArrival("");
    setPage(1);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sản phẩm</h1>
        <Link
          href="/products/new"
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg"
        >
          Thêm sản phẩm
        </Link>
      </div>

      {/* Bộ lọc & tìm kiếm */}
      <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <form
          onSubmit={handleSearch}
          className="flex flex-wrap gap-3 items-end"
        >
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium mb-1">Tìm kiếm</label>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tên, mã SP, mô tả..."
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-sm"
            />
          </div>
          <div className="w-40">
            <label className="block text-sm font-medium mb-1">Danh mục</label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-sm"
            >
              <option value="">Tất cả</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="w-32">
            <label className="block text-sm font-medium mb-1">Trạng thái</label>
            <select
              value={isActive}
              onChange={(e) => {
                setIsActive(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-sm"
            >
              <option value="">Tất cả</option>
              <option value="true">Hiển thị</option>
              <option value="false">Ẩn</option>
            </select>
          </div>
          <div className="w-28">
            <label className="block text-sm font-medium mb-1">Nổi bật</label>
            <select
              value={isFeatured}
              onChange={(e) => {
                setIsFeatured(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-sm"
            >
              <option value="">Tất cả</option>
              <option value="true">Có</option>
            </select>
          </div>
          <div className="w-28">
            <label className="block text-sm font-medium mb-1">Mới</label>
            <select
              value={isNewArrival}
              onChange={(e) => {
                setIsNewArrival(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-sm"
            >
              <option value="">Tất cả</option>
              <option value="true">Có</option>
            </select>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm"
          >
            Tìm
          </button>
          <button
            type="button"
            onClick={clearFilters}
            className="px-4 py-2 border rounded-lg dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
          >
            Xóa lọc
          </button>
        </form>
      </div>

      {isLoading ? (
        <p>Đang tải...</p>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="text-left p-4 w-16">Ảnh</th>
                <th className="text-left p-4 w-24">Mã SP</th>
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
                  <td className="p-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                      {p.sku || "-"}
                    </span>
                  </td>
                  <td
                    className="p-4 max-w-[180px]"
                    onClick={() => setViewingProductId(p._id)}
                  >
                    <p className="font-medium line-clamp-2 cursor-pointer hover:underline">
                      {p.name}
                    </p>
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
                    {/* {p.compareAtPrice && p.compareAtPrice > p.price && (
                      <span className="ml-2 text-sm text-gray-400 line-through">
                        {new Intl.NumberFormat("vi-VN").format(
                          p.compareAtPrice,
                        )}
                        đ
                      </span>
                    )} */}
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
                    <button
                      onClick={() => setViewingProductId(p._id)}
                      className="text-blue-600 hover:underline"
                    >
                      Xem
                    </button>
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

      <ProductDetailModal
        productId={viewingProductId}
        onClose={() => setViewingProductId(null)}
      />

      {/* Phân trang */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Hiển thị {(page - 1) * PAGE_SIZE + 1}–
            {Math.min(page * PAGE_SIZE, total)} / {total} sản phẩm
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600"
            >
              Trước
            </button>
            <span className="px-3 py-1 text-sm">
              Trang {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600"
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
