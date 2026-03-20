"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { postService } from "@/services/postService";
import { useCategoriesAdmin, useCategory, useSaveCategory } from "@/hooks/useApi";

type CategoryFormData = {
  name: string;
  slug: string;
  parent: string;
  image: string;
};

export function CategoryForm({
  categoryId,
  onSuccess,
}: {
  categoryId?: string;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<CategoryFormData>({
    name: "",
    slug: "",
    parent: "",
    image: "",
  });

  const { data: categories = [] } = useCategoriesAdmin();
  const { data: category, isLoading: fetching } = useCategory(categoryId);
  const saveCategory = useSaveCategory(categoryId);

  useEffect(() => {
    if (category) {
      setForm({
        name: category.name || "",
        slug: category.slug || "",
        parent:
          typeof category.parent === "object" && category.parent
            ? (category.parent as { _id: string })._id
            : "",
        image: category.image || "",
      });
    }
  }, [category]);

  const update = (key: keyof CategoryFormData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files?.length || uploading) return;
    setUploading(true);
    const file = files[0];
    if (file?.type.startsWith("image/")) {
      const res = await postService.uploadImage(file);
      if (res.success && res.data?.url) {
        update("image", res.data.url);
      }
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = () => update("image", "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        slug: form.slug || undefined,
        parent: form.parent || undefined,
        image: form.image || undefined,
      };
      await saveCategory.mutateAsync(payload);
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

  if (categoryId && fetching) {
    return <p className="text-gray-500">Đang tải...</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      <div>
        <label className="block font-medium mb-2">Ảnh danh mục</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
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
          {form.image ? (
            <div className="relative w-32 h-32 mx-auto rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 group">
              <Image
                src={form.image}
                alt=""
                fill
                className="object-cover"
                sizes="128px"
                unoptimized
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage();
                }}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-sm transition-opacity"
              >
                Xóa
              </button>
            </div>
          ) : uploading ? (
            <p className="text-gray-500">Đang tải lên...</p>
          ) : (
            <p className="text-gray-500">
              Kéo thả ảnh vào đây hoặc{" "}
              <span className="text-amber-600 font-medium">chọn ảnh</span>
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block font-medium mb-2">Tên danh mục *</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          required
          className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
        />
      </div>

      <div>
        <label className="block font-medium mb-2">Slug</label>
        <input
          type="text"
          value={form.slug}
          onChange={(e) => update("slug", e.target.value)}
          placeholder="ten-danh-muc"
          className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
        />
      </div>

      <div>
        <label className="block font-medium mb-2">Danh mục cha</label>
        <select
          value={form.parent}
          onChange={(e) => update("parent", e.target.value)}
          className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
        >
          <option value="">Không có</option>
          {categories
            .filter((c) => c._id !== categoryId)
            .map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
        </select>
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
