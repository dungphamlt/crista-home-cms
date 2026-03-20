"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { postService } from "@/services/postService";
import { useBanner, useSaveBanner } from "@/hooks/useApi";

type BannerFormData = {
  title: string;
  image: string;
  link: string;
  order: string;
  isActive: boolean;
};

export function BannerForm({
  bannerId,
  onSuccess,
}: {
  bannerId?: string;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<BannerFormData>({
    title: "",
    image: "",
    link: "",
    order: "0",
    isActive: true,
  });

  const { data: banner, isLoading: fetching } = useBanner(bannerId);
  const saveBanner = useSaveBanner(bannerId);

  useEffect(() => {
    if (banner) {
      setForm({
        title: banner.title || "",
        image: banner.image || "",
        link: banner.link || "",
        order: String(banner.order ?? 0),
        isActive: banner.isActive ?? true,
      });
    }
  }, [banner]);

  const update = (key: keyof BannerFormData, value: string | boolean) => {
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
        title: form.title,
        image: form.image || undefined,
        link: form.link || undefined,
        order: parseInt(form.order, 10) || 0,
        isActive: form.isActive,
      };
      await saveBanner.mutateAsync(payload);
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

  if (bannerId && fetching) {
    return <p className="text-gray-500">Đang tải...</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      <div>
        <label className="block font-medium mb-2">Ảnh banner *</label>
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
            <div className="relative w-full max-w-md h-32 mx-auto rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 group">
              <Image
                src={form.image}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 400px"
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
        <label className="block font-medium mb-2">Tiêu đề</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="Tiêu đề banner"
          className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
        />
      </div>

      <div>
        <label className="block font-medium mb-2">Link</label>
        <input
          type="url"
          value={form.link}
          onChange={(e) => update("link", e.target.value)}
          placeholder="https://..."
          className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
        />
      </div>

      <div>
        <label className="block font-medium mb-2">Thứ tự</label>
        <input
          type="number"
          value={form.order}
          onChange={(e) => update("order", e.target.value)}
          min={0}
          className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
        />
      </div>

      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => update("isActive", e.target.checked)}
          />
          Hiển thị
        </label>
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
