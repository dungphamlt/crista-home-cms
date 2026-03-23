"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePage } from "@/hooks/useApi";

type PageDetailModalProps = {
  pageId: string | null;
  onClose: () => void;
};

export function PageDetailModal({ pageId, onClose }: PageDetailModalProps) {
  const { data: page, isLoading } = usePage(pageId ?? undefined, !!pageId);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (pageId) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [pageId, onClose]);

  if (!pageId) return null;

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
          <h2 className="text-xl font-bold">Chi tiết trang</h2>
          <div className="flex gap-2">
            <Link
              href={`/pages/${pageId}`}
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
          ) : page ? (
            <>
              {page.content ? (
                <div
                  className="prose prose-sm dark:prose-invert max-w-none ck-content"
                  dangerouslySetInnerHTML={{ __html: page.content }}
                />
              ) : (
                <p className=" italic">Chưa có nội dung</p>
              )}
            </>
          ) : (
            <p className="">Không tìm thấy trang</p>
          )}
        </div>
      </div>
    </div>
  );
}
