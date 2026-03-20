"use client";

import { useState } from "react";
import Image from "next/image";
import {
  useBannersAdmin,
  useDeleteBanner,
  useToggleBannerActive,
  type BannerAdmin,
} from "@/hooks/useApi";
import { BannerModal } from "@/components/banners/BannerModal";

export default function BannersPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);

  const { data: banners = [], isLoading } = useBannersAdmin();
  const deleteBanner = useDeleteBanner();
  const toggleActive = useToggleBannerActive();

  const handleAdd = () => {
    setEditingBannerId(null);
    setModalOpen(true);
  };

  const handleEdit = (id: string) => {
    setEditingBannerId(id);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingBannerId(null);
  };

  const handleDelete = async (b: BannerAdmin) => {
    if (!confirm(`Xóa banner "${b.title}"?`)) return;
    try {
      await deleteBanner.mutateAsync(b._id);
    } catch {
      alert("Xóa thất bại");
    }
  };

  const handleToggleActive = async (b: BannerAdmin) => {
    try {
      await toggleActive.mutateAsync(b);
    } catch {
      alert("Cập nhật thất bại");
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Banner</h1>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg"
        >
          Thêm banner
        </button>
      </div>

      {isLoading ? (
        <p>Đang tải...</p>
      ) : banners.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center text-gray-500">
          Chưa có banner. Nhấn &quot;Thêm banner&quot; để tạo mới.
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="text-left p-4 w-24">Ảnh</th>
                <th className="text-left p-4">Tiêu đề</th>
                <th className="text-left p-4">Link</th>
                <th className="text-left p-4 w-24">Thứ tự</th>
                <th className="text-left p-4 w-28">Trạng thái</th>
                <th className="text-right p-4">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {banners.map((b) => (
                <tr
                  key={b._id}
                  className="border-t border-gray-200 dark:border-gray-700"
                >
                  <td className="p-4">
                    {b.image ? (
                      <div className="relative w-20 h-14 rounded overflow-hidden bg-gray-100 dark:bg-gray-700">
                        <Image
                          src={b.image}
                          alt={b.title || ""}
                          fill
                          className="object-cover"
                          sizes="80px"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-14 rounded bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-400 text-xs">
                        N/A
                      </div>
                    )}
                  </td>
                  <td className="p-4 font-medium">{b.title}</td>
                  <td className="p-4 text-gray-500 text-sm max-w-[200px] truncate">
                    {b.link || "-"}
                  </td>
                  <td className="p-4 text-gray-500">{b.order ?? 0}</td>
                  <td className="p-4">
                    <button
                      onClick={() => handleToggleActive(b)}
                      className={`px-2 py-1 rounded text-sm ${
                        b.isActive
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                      }`}
                    >
                      {b.isActive ? "Hiển thị" : "Ẩn"}
                    </button>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleEdit(b._id)}
                      className="text-amber-600 hover:underline"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(b)}
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

      <BannerModal
        bannerId={editingBannerId}
        isOpen={modalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
