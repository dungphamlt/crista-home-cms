"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useProduct } from "@/hooks/useApi";

type ProductDetailModalProps = {
  productId: string | null;
  onClose: () => void;
};

type VariantRow = {
  name: string;
  value?: string;
  sku?: string;
  images?: string[];
  stock?: number;
  image?: string;
};

function normalizeVariantImages(v: VariantRow): string[] {
  if (Array.isArray(v.images) && v.images.length > 0) return v.images;
  if (v.image) return [v.image];
  return [];
}

function galleryForSelection(
  product: {
    coverImage?: string;
    images?: string[];
    variants?: VariantRow[];
  },
  variantIndex: number,
): string[] {
  const variants = product.variants || [];
  const v = variants[variantIndex];
  const variantImgs = v ? normalizeVariantImages(v) : [];
  if (variantImgs.length > 0) return variantImgs;
  const fallback: string[] = [];
  if (product.coverImage) fallback.push(product.coverImage);
  const rest = product.images || [];
  for (const url of rest) {
    if (url !== product.coverImage) fallback.push(url);
  }
  if (!product.coverImage && rest.length) return rest;
  return fallback;
}

export function ProductDetailModal({
  productId,
  onClose,
}: ProductDetailModalProps) {
  const { data: product, isLoading } = useProduct(
    productId ?? undefined,
    !!productId,
  );
  const [variantIdx, setVariantIdx] = useState(0);
  const [imgIdx, setImgIdx] = useState(0);

  const variants = (product?.variants || []) as VariantRow[];
  const gallery = product
    ? galleryForSelection(
        product,
        Math.min(variantIdx, Math.max(0, variants.length - 1)),
      )
    : [];
  const safeVariantIdx =
    variants.length > 0 ? Math.min(variantIdx, variants.length - 1) : 0;
  const currentVariant = variants[safeVariantIdx];
  const safeImgIdx =
    gallery.length > 0 ? Math.min(imgIdx, gallery.length - 1) : 0;
  const mainSrc = gallery[safeImgIdx] ?? gallery[0];

  useEffect(() => {
    setVariantIdx(0);
    setImgIdx(0);
  }, [productId, product?._id]);

  useEffect(() => {
    setImgIdx(0);
  }, [variantIdx, product?._id]);

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

  const goPrev = () => {
    if (gallery.length <= 1) return;
    setImgIdx((i) => (i <= 0 ? gallery.length - 1 : i - 1));
  };

  const goNext = () => {
    if (gallery.length <= 1) return;
    setImgIdx((i) => (i >= gallery.length - 1 ? 0 : i + 1));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
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
              <div className="flex flex-col md:flex-row gap-6">
                <div className="shrink-0 md:w-[min(100%,320px)]">
                  {mainSrc ? (
                    <div className="relative w-full aspect-square max-h-80 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                      <Image
                        src={mainSrc}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 320px"
                        unoptimized
                      />
                      {gallery.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              goPrev();
                            }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
                            aria-label="Ảnh trước"
                          >
                            ‹
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              goNext();
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
                            aria-label="Ảnh sau"
                          >
                            ›
                          </button>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="w-full aspect-square max-h-80 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-400">
                      Không có ảnh
                    </div>
                  )}
                  {gallery.length > 1 && (
                    <div className="flex gap-2 mt-2 flex-wrap justify-center">
                      {gallery.map((url, i) => (
                        <button
                          key={url + i}
                          type="button"
                          onClick={() => setImgIdx(i)}
                          className={`relative w-10 h-10 rounded overflow-hidden border-2 shrink-0 ${
                            i === safeImgIdx
                              ? "border-amber-500 ring-2 ring-amber-400/50"
                              : "border-transparent opacity-80 hover:opacity-100"
                          }`}
                        >
                          <Image
                            src={url}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="40px"
                            unoptimized
                          />
                        </button>
                      ))}
                    </div>
                  )}

                  {variants.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Màu / biến thể
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {variants.map((v, i) => {
                          const thumb = normalizeVariantImages(v)[0];
                          return (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setVariantIdx(i)}
                              className={`relative w-10 h-10 rounded-full overflow-hidden border-2 shrink-0 ${
                                i === safeVariantIdx
                                  ? "border-amber-500 ring-2 ring-amber-400/50"
                                  : "border-gray-300 dark:border-gray-600"
                              }`}
                              title={v.name}
                            >
                              {thumb ? (
                                <Image
                                  src={thumb}
                                  alt=""
                                  fill
                                  className="object-cover"
                                  sizes="40px"
                                  unoptimized
                                />
                              ) : (
                                <span className="absolute inset-0 flex items-center justify-center text-[10px] bg-gray-200 dark:bg-gray-600 text-gray-600">
                                  {v.name.slice(0, 2)}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold mb-1">{product.name}</h3>
                  {currentVariant && (
                    <>
                      <p className="text-gray-700 dark:text-gray-300 font-medium">
                        {currentVariant.name}
                        {currentVariant.value ? (
                          <span className="text-gray-500 font-normal">
                            {" "}
                            ({currentVariant.value})
                          </span>
                        ) : null}
                      </p>
                      {currentVariant.sku && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            Mã sản phẩm:
                          </span>{" "}
                          <span className="font-mono">
                            {currentVariant.sku}
                          </span>
                        </p>
                      )}
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Tồn kho:
                        </span>{" "}
                        <span className="tabular-nums font-medium text-gray-900 dark:text-gray-100">
                          {currentVariant.stock ?? 0}
                        </span>
                      </p>
                    </>
                  )}
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400 mt-3">
                    {product.sku && (
                      <p>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Mã SP (sản phẩm):
                        </span>{" "}
                        {product.sku}
                      </p>
                    )}
                    {product.slug && (
                      <p>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Slug:
                        </span>{" "}
                        {product.slug}
                      </p>
                    )}
                    <p>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Giá:
                      </span>{" "}
                      <span className="text-red-600 font-medium">
                        {new Intl.NumberFormat("vi-VN").format(
                          product.price ?? 0,
                        )}
                        đ
                      </span>
                    </p>
                    <p>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {variants.length > 0 ? "Tổng tồn kho:" : "Tồn kho:"}
                      </span>{" "}
                      <span className="tabular-nums">
                        {variants.length > 0
                          ? variants.reduce(
                              (sum, v) => sum + (Number(v.stock) || 0),
                              0,
                            )
                          : (product.stock ?? 0)}
                      </span>
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
                  <h4 className="font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Mô tả ngắn
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {product.shortDescription}
                  </p>
                </div>
              )}

              {product.description && (
                <div>
                  <h4 className="font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Mô tả chi tiết
                  </h4>
                  <div
                    className="text-sm text-gray-600 dark:text-gray-400 prose prose-sm dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                </div>
              )}

              {product.categories && product.categories.length > 0 && (
                <div>
                  <h4 className="font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Danh mục
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {product.categories.map(
                      (c: { _id: string; name: string }) => (
                        <span
                          key={c._id}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm"
                        >
                          {c.name}
                        </span>
                      ),
                    )}
                  </div>
                </div>
              )}

              {variants.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Bảng biến thể
                  </h4>
                  <div className="border rounded-lg dark:border-gray-600 overflow-x-auto">
                    <table className="w-full text-sm min-w-[480px]">
                      <thead className="bg-gray-100 dark:bg-gray-700">
                        <tr>
                          <th className="text-left p-3">Tên</th>
                          <th className="text-left p-3">Giá trị</th>
                          <th className="text-left p-3">SKU</th>
                          <th className="text-right p-3">Tồn</th>
                          <th className="text-left p-3">Ảnh</th>
                        </tr>
                      </thead>
                      <tbody>
                        {variants.map((v, i) => {
                          const imgs = normalizeVariantImages(v);
                          return (
                            <tr
                              key={i}
                              className="border-t dark:border-gray-600"
                            >
                              <td className="p-3">{v.name}</td>
                              <td className="p-3">{v.value || "—"}</td>
                              <td className="p-3 font-mono text-xs">
                                {v.sku || "—"}
                              </td>
                              <td className="p-3 text-right">{v.stock ?? 0}</td>
                              <td className="p-3">
                                {imgs.length}
                                {imgs.length ? " ảnh" : ""}
                              </td>
                            </tr>
                          );
                        })}
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
