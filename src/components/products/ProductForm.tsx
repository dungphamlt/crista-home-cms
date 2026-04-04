"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { api, endpoints } from "@/lib/api";
import { postService } from "@/services/postService";
import { useCategoriesAdmin, useProduct, useSaveProduct } from "@/hooks/useApi";

const CkEditor = dynamic(() => import("@/components/ckeditor"), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded animate-pulse flex items-center justify-center">
      Đang tải editor...
    </div>
  ),
});

type Variant = {
  name: string;
  value?: string;
  sku?: string;
  images: string[];
  stock: number;
};
type ProductFormData = {
  sku: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  images: string[];
  coverImage: string;
  price: string;
  categories: string[];
  stock: string;
  isActive: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  order: string;
  variants: Variant[];
};

const emptyVariant: Variant = {
  name: "",
  value: "",
  sku: "",
  images: [],
  stock: 0,
};

type UploadTarget =
  | null
  | { kind: "gallery" }
  | { kind: "cover" }
  | { kind: "variant"; index: number };

export function ProductForm({
  productId,
  onSuccess,
}: {
  productId?: string;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<ProductFormData>({
    sku: "",
    name: "",
    slug: "",
    description: "",
    shortDescription: "",
    images: [],
    coverImage: "",
    price: "",
    categories: [],
    stock: "0",
    isActive: true,
    isFeatured: true,
    isNewArrival: true,
    order: "0",
    variants: [],
  });
  const [uploadTarget, setUploadTarget] = useState<UploadTarget>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const variantUploadIndexRef = useRef<number | null>(null);
  const variantFileInputRef = useRef<HTMLInputElement>(null);

  const { data: categories = [] } = useCategoriesAdmin();
  const { data: product, isLoading: fetching } = useProduct(productId);

  useEffect(() => {
    if (product) {
      setForm({
        sku: product.sku || "",
        name: product.name || "",
        slug: product.slug || "",
        description: product.description || "",
        shortDescription: product.shortDescription || "",
        images: product.images || [],
        coverImage: product.coverImage || "",
        price: String(product.price ?? ""),
        categories: (product.categories || []).map(
          (c: { _id: string }) => c._id,
        ),
        stock: String(product.stock ?? 0),
        isActive: product.isActive ?? true,
        isFeatured: product.isFeatured ?? false,
        isNewArrival: product.isNewArrival ?? false,
        order: String(product.order ?? 0),
        variants: (product.variants || []).length
          ? product.variants.map((v: Variant & { image?: string }) => {
              const legacy = v as { images?: string[]; image?: string };
              const imgs = Array.isArray(legacy.images)
                ? legacy.images
                : legacy.image
                  ? [legacy.image]
                  : [];
              return {
                name: v.name || "",
                value: v.value || "",
                sku: v.sku || "",
                images: imgs,
                stock: v.stock ?? 0,
              };
            })
          : [],
      });
    }
  }, [product]);

  const update = (key: keyof ProductFormData, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const addVariant = () => {
    update("variants", [...form.variants, { ...emptyVariant }]);
  };

  const removeVariant = (i: number) => {
    update(
      "variants",
      form.variants.filter((_, idx) => idx !== i),
    );
  };

  const updateVariant = (i: number, patch: Partial<Variant>) => {
    const next = [...form.variants];
    next[i] = { ...next[i], ...patch };
    update("variants", next);
  };

  const removeVariantImage = (variantIndex: number, imageIndex: number) => {
    const next = [...form.variants];
    const imgs = [...(next[variantIndex]?.images || [])];
    imgs.splice(imageIndex, 1);
    next[variantIndex] = { ...next[variantIndex], images: imgs };
    update("variants", next);
  };

  const uploadImageFiles = async (
    files: FileList | null,
  ): Promise<string[]> => {
    if (!files?.length) return [];
    const urls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) continue;
      const res = await postService.uploadImage(file);
      if (res.success && res.data?.url) {
        urls.push(res.data.url);
      }
    }
    return urls;
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files?.length || uploadTarget) return;
    setUploadTarget({ kind: "gallery" });
    try {
      const urls = await uploadImageFiles(files);
      if (urls.length) {
        update("images", [...form.images, ...urls]);
      }
    } finally {
      setUploadTarget(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleCoverUpload = async (files: FileList | null) => {
    if (!files?.length || uploadTarget) return;
    setUploadTarget({ kind: "cover" });
    try {
      const urls = await uploadImageFiles(files);
      if (urls[0]) {
        update("coverImage", urls[0]);
      }
    } finally {
      setUploadTarget(null);
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  };

  const handleVariantImagesUpload = async (files: FileList | null) => {
    const idx = variantUploadIndexRef.current;
    if (idx == null || !files?.length || uploadTarget) return;
    setUploadTarget({ kind: "variant", index: idx });
    try {
      const urls = await uploadImageFiles(files);
      if (urls.length) {
        setForm((prev) => {
          const next = [...prev.variants];
          next[idx] = {
            ...next[idx],
            images: [...(next[idx]?.images || []), ...urls],
          };
          return { ...prev, variants: next };
        });
      }
    } finally {
      setUploadTarget(null);
      variantUploadIndexRef.current = null;
      if (variantFileInputRef.current) variantFileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    update(
      "images",
      form.images.filter((_, i) => i !== index),
    );
  };

  const saveProduct = useSaveProduct(productId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        sku: form.sku || undefined,
        name: form.name,
        slug: form.slug || undefined,
        description: form.description || undefined,
        shortDescription: form.shortDescription || undefined,
        images: form.images,
        coverImage: form.coverImage.trim() || undefined,
        price: parseInt(form.price, 10) || 0,
        categories: form.categories,
        stock: parseInt(form.stock, 10) || 0,
        isActive: form.isActive,
        isFeatured: form.isFeatured,
        isNewArrival: form.isNewArrival,
        order: parseInt(form.order, 10) || 0,
        variants: form.variants
          .filter((v) => v.name.trim())
          .map((v) => ({
            name: v.name.trim(),
            value: v.value?.trim() || undefined,
            sku: v.sku?.trim() || undefined,
            images: v.images,
            stock: v.stock,
          })),
      };

      await saveProduct.mutateAsync(payload);
      onSuccess();
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : "Lưu thất bại";
      alert(msg || "Lưu thất bại");
    } finally {
      setLoading(false);
    }
  };

  if (productId && fetching) {
    return <p className="text-gray-500">Đang tải...</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <div>
        <label className="block font-medium mb-2">Mã sản phẩm</label>
        <input
          type="text"
          value={form.sku}
          onChange={(e) => update("sku", e.target.value)}
          required
          placeholder="VD: SP001"
          className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
        />
      </div>
      <div>
        <label className="block font-medium mb-2">Tên sản phẩm *</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          required
          className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
        />
      </div>
      <div>
        <label className="block font-medium mb-2">
          Slug (để trống = tự tạo)
        </label>
        <input
          type="text"
          value={form.slug}
          onChange={(e) => update("slug", e.target.value)}
          placeholder="ten-san-pham"
          className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
        />
      </div>
      <div>
        <label className="block font-medium mb-2">Mô tả ngắn</label>
        <textarea
          value={form.shortDescription}
          onChange={(e) => update("shortDescription", e.target.value)}
          rows={2}
          className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
        />
      </div>
      <div>
        <label className="block font-medium mb-2">Mô tả chi tiết</label>
        <div className="[&_.ck-editor]:min-h-[200px] [&_.ck-content]:min-h-[200px]">
          <CkEditor
            editorData={form.description}
            setEditorData={(html) => update("description", html)}
          />
        </div>
      </div>
      <div>
        <label className="block font-medium mb-2">Ảnh sản phẩm</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleImageUpload(e.target.files)}
          className="hidden"
        />
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            e.currentTarget.classList.add("ring-2", "ring-amber-500");
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.currentTarget.classList.remove("ring-2", "ring-amber-500");
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.classList.remove("ring-2", "ring-amber-500");
            handleImageUpload(e.dataTransfer.files);
          }}
          className={`border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-amber-500 hover:bg-amber-50/50 dark:hover:bg-amber-900/10 transition-colors ${
            uploadTarget ? "pointer-events-none opacity-70" : ""
          }`}
        >
          {uploadTarget?.kind === "gallery" ? (
            <p className="text-gray-600 dark:text-gray-300 flex items-center justify-center gap-2">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
              Đang tải lên...
            </p>
          ) : (
            <p className="text-gray-500">
              Kéo thả ảnh vào đây hoặc{" "}
              <span className="text-amber-600 font-medium">chọn ảnh</span>
            </p>
          )}
        </div>
        {form.images.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-3">
            {form.images.map((url, i) => (
              <div
                key={url}
                className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 group"
              >
                <Image
                  src={url}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="80px"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-sm transition-opacity"
                >
                  Xóa
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        <label className="block font-medium mb-2">
          Ảnh bìa / hero (tùy chọn)
        </label>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          Dùng làm ảnh đại diện khi biến thể chưa có ảnh — storefront có thể ưu
          tiên ảnh biến thể khi chọn màu.
        </p>
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleCoverUpload(e.target.files)}
          className="hidden"
        />
        <div
          onClick={() => coverInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            e.currentTarget.classList.add("ring-2", "ring-amber-500");
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.currentTarget.classList.remove("ring-2", "ring-amber-500");
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.classList.remove("ring-2", "ring-amber-500");
            handleCoverUpload(e.dataTransfer.files);
          }}
          className={`border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-amber-500 hover:bg-amber-50/50 dark:hover:bg-amber-900/10 transition-colors ${
            uploadTarget ? "pointer-events-none opacity-70" : ""
          }`}
        >
          {uploadTarget?.kind === "cover" ? (
            <p className="text-gray-600 dark:text-gray-300 flex items-center justify-center gap-2">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
              Đang tải lên...
            </p>
          ) : (
            <p className="text-gray-500">
              Kéo thả ảnh bìa vào đây hoặc{" "}
              <span className="text-amber-600 font-medium">chọn ảnh</span>
            </p>
          )}
        </div>
        {form.coverImage ? (
          <div className="mt-3 flex flex-wrap gap-3">
            <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 group">
              <Image
                src={form.coverImage}
                alt=""
                fill
                className="object-cover"
                sizes="80px"
                unoptimized
              />
              <button
                type="button"
                onClick={() => update("coverImage", "")}
                disabled={!!uploadTarget}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-sm transition-opacity disabled:pointer-events-none disabled:opacity-0"
              >
                Xóa
              </button>
            </div>
          </div>
        ) : null}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-medium mb-2">Giá (VNĐ) *</label>
          <input
            type="number"
            value={form.price}
            onChange={(e) => update("price", e.target.value)}
            required
            min={0}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
          />
        </div>
        <div>
          <label className="block font-medium mb-2">Tồn kho</label>
          <input
            type="number"
            value={form.stock}
            onChange={(e) => update("stock", e.target.value)}
            min={0}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
          />
        </div>
      </div>
      <div>
        <label className="block font-medium mb-2">Danh mục</label>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <label key={c._id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.categories.includes(c._id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    update("categories", [...form.categories, c._id]);
                  } else {
                    update(
                      "categories",
                      form.categories.filter((id) => id !== c._id),
                    );
                  }
                }}
              />
              <span>{c.name}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <input
          ref={variantFileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleVariantImagesUpload(e.target.files)}
        />
        <label className="block font-medium mb-2">Biến thể</label>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          Mỗi biến thể có mã SKU riêng và gallery ảnh riêng (ví dụ mỗi màu một
          bộ ảnh).
        </p>
        {form.variants.map((v, i) => (
          <div
            key={i}
            className="mb-4 p-4 bg-gray-50 dark:bg-gray-800/80 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Tên *
                </label>
                <input
                  placeholder="VD: Xanh lá"
                  value={v.name}
                  onChange={(e) => updateVariant(i, { name: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border rounded"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Giá trị / nhãn
                </label>
                <input
                  placeholder="VD: (Xanh lá)"
                  value={v.value || ""}
                  onChange={(e) => updateVariant(i, { value: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border rounded"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Mã SKU biến thể
                </label>
                <input
                  placeholder="VD: 60234-G"
                  value={v.sku || ""}
                  onChange={(e) => updateVariant(i, { sku: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border rounded font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Tồn kho
                </label>
                <input
                  type="number"
                  min={0}
                  value={v.stock}
                  onChange={(e) =>
                    updateVariant(i, {
                      stock: parseInt(e.target.value, 10) || 0,
                    })
                  }
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border rounded"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-2">
                Ảnh biến thể (gallery)
              </label>
              <div className="flex flex-wrap gap-2 items-center">
                {v.images.map((url, imgIdx) => (
                  <div
                    key={`${url}-${imgIdx}`}
                    className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 group shrink-0"
                  >
                    <Image
                      src={url}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="64px"
                      unoptimized
                    />
                    <button
                      type="button"
                      onClick={() => removeVariantImage(i, imgIdx)}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs"
                    >
                      Xóa
                    </button>
                  </div>
                ))}
                {uploadTarget?.kind === "variant" &&
                uploadTarget.index === i ? (
                  <div className="w-16 h-16 border-2 border-dashed border-amber-400 dark:border-amber-600 rounded-lg flex flex-col items-center justify-center gap-1 text-[10px] text-amber-700 dark:text-amber-400 bg-amber-50/80 dark:bg-amber-950/30 shrink-0">
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
                    Đang tải...
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      variantUploadIndexRef.current = i;
                      variantFileInputRef.current?.click();
                    }}
                    disabled={!!uploadTarget}
                    className="w-16 h-16 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-400 text-xl hover:border-amber-500 hover:text-amber-600 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    +
                  </button>
                )}
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => removeVariant(i)}
                className="text-sm text-red-600 hover:underline"
              >
                Xóa biến thể
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addVariant}
          className="text-amber-600 font-semibold hover:bg-amber-500/30 text-sm px-4 py-2 bg-amber-500/20 cursor-pointer rounded-lg"
        >
          + Thêm biến thể
        </button>
      </div>
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => update("isActive", e.target.checked)}
          />
          Hiển thị
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.isFeatured}
            onChange={(e) => update("isFeatured", e.target.checked)}
          />
          Nổi bật
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.isNewArrival}
            onChange={(e) => update("isNewArrival", e.target.checked)}
          />
          Sản phẩm mới
        </label>
      </div>
      <div>
        <label className="block font-medium mb-2">Thứ tự</label>
        <input
          type="number"
          value={form.order}
          onChange={(e) => update("order", e.target.value)}
          min={0}
          className="w-24 px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
        />
      </div>
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-lg"
        >
          {loading ? "Đang lưu..." : "Lưu"}
        </button>
      </div>
    </form>
  );
}
