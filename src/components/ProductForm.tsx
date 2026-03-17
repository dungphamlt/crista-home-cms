"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { api, endpoints } from "@/lib/api";
import { postService } from "@/services/postService";

const CkEditor = dynamic(() => import("@/components/ckeditor"), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded animate-pulse flex items-center justify-center">
      Đang tải editor...
    </div>
  ),
});

type Variant = { name: string; value?: string; image?: string; stock: number };
type ProductFormData = {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  images: string[];
  price: string;
  compareAtPrice: string;
  categories: string[];
  stock: string;
  isActive: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  order: string;
  variants: Variant[];
};

const emptyVariant: Variant = { name: "", value: "", image: "", stock: 0 };

export function ProductForm({
  productId,
  onSuccess,
}: {
  productId?: string;
  onSuccess: () => void;
}) {
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!productId);
  const [form, setForm] = useState<ProductFormData>({
    name: "",
    slug: "",
    description: "",
    shortDescription: "",
    images: [],
    price: "",
    compareAtPrice: "",
    categories: [],
    stock: "0",
    isActive: true,
    isFeatured: false,
    isNewArrival: false,
    order: "0",
    variants: [],
  });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api
      .get(endpoints.categoriesAdmin())
      .then((res) => setCategories(res.data || []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (productId) {
      api
        .get(endpoints.product(productId))
        .then((res) => {
          const p = res.data;
          setForm({
            name: p.name || "",
            slug: p.slug || "",
            description: p.description || "",
            shortDescription: p.shortDescription || "",
            images: p.images || [],
            price: String(p.price ?? ""),
            compareAtPrice: String(p.compareAtPrice ?? ""),
            categories: (p.categories || []).map((c: { _id: string }) => c._id),
            stock: String(p.stock ?? 0),
            isActive: p.isActive ?? true,
            isFeatured: p.isFeatured ?? false,
            isNewArrival: p.isNewArrival ?? false,
            order: String(p.order ?? 0),
            variants: (p.variants || []).length
              ? p.variants.map((v: Variant) => ({
                  name: v.name || "",
                  value: v.value || "",
                  image: v.image || "",
                  stock: v.stock ?? 0,
                }))
              : [],
          });
        })
        .catch(() => {})
        .finally(() => setFetching(false));
    }
  }, [productId]);

  const update = (key: keyof ProductFormData, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const addVariant = () => {
    update("variants", [...form.variants, { ...emptyVariant }]);
  };

  const removeVariant = (i: number) => {
    update(
      "variants",
      form.variants.filter((_, idx) => idx !== i)
    );
  };

  const updateVariant = (i: number, key: keyof Variant, value: string | number) => {
    const next = [...form.variants];
    next[i] = { ...next[i], [key]: value };
    update("variants", next);
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files?.length || uploading) return;
    setUploading(true);
    const urls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) continue;
      const res = await postService.uploadImage(file);
      if (res.success && res.data?.url) {
        urls.push(res.data.url);
      }
    }
    if (urls.length) {
      update("images", [...form.images, ...urls]);
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    update(
      "images",
      form.images.filter((_, i) => i !== index)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        slug: form.slug || undefined,
        description: form.description || undefined,
        shortDescription: form.shortDescription || undefined,
        images: form.images,
        price: parseInt(form.price, 10) || 0,
        compareAtPrice: form.compareAtPrice ? parseInt(form.compareAtPrice, 10) : undefined,
        categories: form.categories,
        stock: parseInt(form.stock, 10) || 0,
        isActive: form.isActive,
        isFeatured: form.isFeatured,
        isNewArrival: form.isNewArrival,
        order: parseInt(form.order, 10) || 0,
        variants: form.variants.filter((v) => v.name.trim()),
      };

      if (productId) {
        await api.put(endpoints.product(productId), payload);
      } else {
        await api.post("/products", payload);
      }
      onSuccess();
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data
              ?.message
          : "Lưu thất bại";
      alert(msg || "Lưu thất bại");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <p className="text-gray-500">Đang tải...</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
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
        <label className="block font-medium mb-2">Slug (để trống = tự tạo)</label>
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
          className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-amber-500 hover:bg-amber-50/50 dark:hover:bg-amber-900/10 transition-colors"
        >
          {uploading ? (
            <p className="text-gray-500">Đang tải lên...</p>
          ) : (
            <p className="text-gray-500">
              Kéo thả ảnh vào đây hoặc <span className="text-amber-600 font-medium">chọn ảnh</span>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <label className="block font-medium mb-2">Giá so sánh (VNĐ)</label>
          <input
            type="number"
            value={form.compareAtPrice}
            onChange={(e) => update("compareAtPrice", e.target.value)}
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
                      form.categories.filter((id) => id !== c._id)
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
        <label className="block font-medium mb-2">Biến thể</label>
        {form.variants.map((v, i) => (
          <div
            key={i}
            className="flex gap-2 items-center mb-2 p-2 bg-gray-50 dark:bg-gray-800 rounded"
          >
            <input
              placeholder="Tên (ví dụ: Màu đỏ)"
              value={v.name}
              onChange={(e) => updateVariant(i, "name", e.target.value)}
              className="flex-1 px-3 py-1 bg-white dark:bg-gray-700 border rounded"
            />
            <input
              placeholder="Giá trị (ví dụ: Đỏ)"
              value={v.value || ""}
              onChange={(e) => updateVariant(i, "value", e.target.value)}
              className="flex-1 px-3 py-1 bg-white dark:bg-gray-700 border rounded"
            />
            <input
              type="number"
              placeholder="Tồn kho"
              value={v.stock}
              onChange={(e) => updateVariant(i, "stock", parseInt(e.target.value, 10) || 0)}
              className="w-20 px-3 py-1 bg-white dark:bg-gray-700 border rounded"
            />
            <button
              type="button"
              onClick={() => removeVariant(i)}
              className="text-red-600 hover:underline"
            >
              Xóa
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addVariant}
          className="text-amber-600 hover:underline text-sm"
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
