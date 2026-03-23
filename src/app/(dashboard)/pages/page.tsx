"use client";

import { useState } from "react";
import Link from "next/link";
import {
  usePages,
  useDeletePage,
} from "@/hooks/useApi";
import { PageDetailModal } from "@/components/pages/PageDetailModal";

const PAGE_SIZE = 10;

function stripHtml(html: string, maxLen = 80): string {
  if (!html) return "-";
  const text = html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  return text.length > maxLen ? `${text.slice(0, maxLen)}...` : text || "-";
}

export default function PagesPage() {
  const [page, setPage] = useState(1);
  const [viewingPageId, setViewingPageId] = useState<string | null>(null);
  const { data, isLoading } = usePages({ page, limit: PAGE_SIZE });
  const deletePage = useDeletePage();

  const pages = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Xóa trang "${name}"?`)) return;
    try {
      await deletePage.mutateAsync(id);
    } catch {
      alert("Xóa thất bại");
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Trang</h1>
        <Link
          href="/pages/new"
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg"
        >
          Thêm trang
        </Link>
      </div>

      {isLoading ? (
        <p>Đang tải...</p>
      ) : pages.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center text-gray-500">
          Chưa có trang. Nhấn &quot;Thêm trang&quot; để tạo mới.
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="text-left p-4">Tên</th>
                  <th className="text-left p-4">Slug</th>
                  <th className="text-left p-4 max-w-[300px]">Nội dung</th>
                  <th className="text-right p-4">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {pages.map((p) => (
                  <tr
                    key={p._id}
                    className="border-t border-gray-200 dark:border-gray-700"
                  >
                    <td className="p-4 font-medium">{p.name}</td>
                    <td className="p-4 text-gray-500">{p.slug || "-"}</td>
                    <td className="p-4 text-gray-500 text-sm max-w-[300px] truncate">
                      {stripHtml(p.content || "")}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => setViewingPageId(p._id)}
                        className="text-blue-600 hover:underline"
                      >
                        Xem
                      </button>
                      <Link
                        href={`/pages/${p._id}`}
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

          <PageDetailModal
            pageId={viewingPageId}
            onClose={() => setViewingPageId(null)}
          />

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Hiển thị {(page - 1) * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE, total)} / {total} trang
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
        </>
      )}
    </div>
  );
}
