"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSavePage } from "@/hooks/useApi";
import CkEditor from "@/components/ckeditor";

export default function NewPagePage() {
  const router = useRouter();
  const savePage = useSavePage();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await savePage.mutateAsync({
        name,
        slug: slug || undefined,
        content: content || undefined,
      });
      router.push("/pages");
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : "Tạo trang thất bại";
      alert(msg || "Tạo trang thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/pages" className="text-gray-500 hover:text-gray-700">
          ← Quay lại
        </Link>
        <h1 className="text-2xl font-bold">Thêm trang</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        <div>
          <label className="block font-medium mb-2">Tên trang *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="VD: Giới thiệu"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
          />
        </div>
        <div>
          <label className="block font-medium mb-2">Slug</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="gioi-thieu"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
          />
        </div>
        <div>
          <label className="block font-medium mb-2">Nội dung</label>
          <CkEditor editorData={content} setEditorData={setContent} />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-lg"
        >
          {loading ? "Đang lưu..." : "Tạo trang"}
        </button>
      </form>
    </div>
  );
}
