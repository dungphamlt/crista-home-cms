"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useProduct } from "@/hooks/useApi";

type ProductDetailModalProps = {
  productId: string | null;
  onClose: () => void;
};

export function ProductDetailModal({ productId, onClose }: ProductDetailModalProps) {
  const { data: product, isLoading } = useProduct(productId ?? undefined, !!productId);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (productId) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [productId, onClose]);

  if (!productId) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold">Chi tiết sản phẩm</h2>
          <div className="flex gap-2">
            <Link
              href={`/products/${productId}`}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm"
            >
              Sửa
            </Link>
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded-lg dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
            >
              Đóng
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <p className="text-gray-500">Đang tải...</p>
          ) : product ? (
            <>
              <div className="flex gap-6">
                <div className="shrink-0">
                  {product.images?.[0] ? (
                    <div className="relative w-48 h-48 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="192px"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="w-48 h-48 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-400">
                      Không có ảnh
                    </div>
                  )}
                  {product.images && product.images.length > 1 && (
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {product.images.slice(1, 5).map((url: string, i: number) => (
                        <div
                          key={i}
                          className="relative w-12 h-12 rounded overflow-hidden bg-gray-100 dark:bg-gray-700"
                        >
                          <Image
                            src={url}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="48px"
                            unoptimized
                          />
                        </div>
                      ))}
                      {product.images.length > 5 && (
                        <span className="text-sm text-gray-500 self-center">
                          +{product.images.length - 5}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold mb-2">{product.name}</h3>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    {product.sku && (
                      <p>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Mã SP:</span>{" "}
                        {product.sku}
                      </p>
                    )}
                    {product.slug && (
                      <p>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Slug:</span>{" "}
                        {product.slug}
                      </p>
                    )}
                    <p>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Giá:</span>{" "}
                      <span className="text-red-600 font-medium">
                        {new Intl.NumberFormat("vi-VN").format(product.price ?? 0)}đ
                      </span>
                      {product.compareAtPrice && product.compareAtPrice > (product.price ?? 0) && (
                        <span className="ml-2 line-through">
                          {new Intl.NumberFormat("vi-VN").format(product.compareAtPrice)}đ
                        </span>
                      )}
                    </p>
                    <p>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Tồn kho:</span>{" "}
                      {product.stock ?? 0}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          product.isActive
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                        }`}
                      >
                        {product.isActive ? "Hiển thị" : "Ẩn"}
                      </span>
                      {product.isFeatured && (
                        <span className="px-2 py-1 rounded text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                          Nổi bật
                        </span>
                      )}
                      {product.isNewArrival && (
                        <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                          Mới
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {product.shortDescription && (
                <div>
                  <h4 className="font-medium mb-1 text-gray-700 dark:text-gray-300">Mô tả ngắn</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{product.shortDescription}</p>
                </div>
              )}

              {product.description && (
                <div>
                  <h4 className="font-medium mb-1 text-gray-700 dark:text-gray-300">Mô tả chi tiết</h4>
                  <div
                    className="text-sm text-gray-600 dark:text-gray-400 prose prose-sm dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                </div>
              )}

              {product.categories && product.categories.length > 0 && (
                <div>
                  <h4 className="font-medium mb-1 text-gray-700 dark:text-gray-300">Danh mục</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.categories.map((c: { _id: string; name: string }) => (
                      <span
                        key={c._id}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm"
                      >
                        {c.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {product.variants && product.variants.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-300">Biến thể</h4>
                  <div className="border rounded-lg dark:border-gray-600 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100 dark:bg-gray-700">
                        <tr>
                          <th className="text-left p-3">Tên</th>
                          <th className="text-left p-3">Giá trị</th>
                          <th className="text-right p-3">Tồn kho</th>
                        </tr>
                      </thead>
                      <tbody>
                        {product.variants.map((v: { name: string; value?: string; stock?: number }, i: number) => (
                          <tr key={i} className="border-t dark:border-gray-600">
                            <td className="p-3">{v.name}</td>
                            <td className="p-3">{v.value || "-"}</td>
                            <td className="p-3 text-right">{v.stock ?? 0}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-500">Không tìm thấy sản phẩm</p>
          )}
        </div>
      </div>
    </div>
  );
}
