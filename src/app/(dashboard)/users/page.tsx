"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useUsersAdmin, type AdminUser } from "@/hooks/useApi";
import { UserDetailModal } from "@/components/users/UserDetailModal";

const PAGE_SIZE = 20;

function displayName(u: AdminUser): string {
  return u.fullName || u.name || u.email || u._id;
}

function isAdminUser(u: AdminUser): boolean {
  const r = u as Record<string, unknown>;
  const role = u.role ?? r.role;
  if (typeof role === "string" && role.toLowerCase().trim() === "admin") {
    return true;
  }
  if (r.isAdmin === true) return true;
  const ut = r.userType ?? r.user_type;
  if (typeof ut === "string" && ut.toLowerCase().trim() === "admin") {
    return true;
  }
  return false;
}

function getAvatarUrl(u: AdminUser): string | undefined {
  const r = u as Record<string, unknown>;
  const v = u.avatar ?? r.avatar_url ?? r.avatarUrl;
  return typeof v === "string" && v.trim().length > 0 ? v.trim() : undefined;
}

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<AdminUser | null>(null);

  const { data, isLoading, isError } = useUsersAdmin({
    page,
    limit: PAGE_SIZE,
  });

  const rows = data?.data ?? [];
  const visibleRows = useMemo(
    () => rows.filter((u) => !isAdminUser(u)),
    [rows],
  );
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Người dùng</h1>
      </div>

      {isLoading ? (
        <p className="text-gray-600 dark:text-gray-400">Đang tải...</p>
      ) : isError ? (
        <p className="text-red-600 dark:text-red-400">
          Không tải được danh sách. Kiểm tra API GET /users/admin.
        </p>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="text-left p-4 font-semibold">Tên / Email</th>
                    <th className="text-left p-4 font-semibold">
                      Số điện thoại
                    </th>
                    <th className="text-left p-4 font-semibold">Avatar</th>
                    <th className="text-left p-4 font-semibold">Ngày tạo</th>
                    <th className="text-right p-4 font-semibold">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="p-8 text-center text-gray-500 dark:text-gray-400"
                      >
                        Chưa có dữ liệu user.
                      </td>
                    </tr>
                  ) : (
                    visibleRows.map((u) => {
                      const avatarUrl = getAvatarUrl(u);
                      return (
                        <tr
                          key={u._id}
                          className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/50"
                        >
                          <td className="p-4">
                            <div className="font-medium">{displayName(u)}</div>
                            {u.email && (
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {u.email}
                              </div>
                            )}
                          </td>
                          <td className="p-4 text-gray-700 dark:text-gray-300">
                            {u.phone ?? "—"}
                          </td>
                          <td className="p-4">
                            {avatarUrl ? (
                              <div className="relative h-10 w-10 overflow-hidden rounded-full border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-900 shrink-0">
                                <Image
                                  src={avatarUrl}
                                  alt=""
                                  width={96}
                                  height={96}
                                  className="h-10 w-10 object-cover"
                                  sizes="40px"
                                  quality={92}
                                />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-400 text-xs">
                                <span className="text-blue-500 font-semibold text-lg uppercase">
                                  {u.name?.charAt(0)}
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="p-4 text-gray-700 dark:text-gray-300 text-sm">
                            {u.createdAt
                              ? new Intl.DateTimeFormat("vi-VN", {
                                  dateStyle: "medium",
                                  timeStyle: "short",
                                }).format(new Date(u.createdAt))
                              : "—"}
                          </td>
                          <td className="p-4 text-right">
                            <button
                              type="button"
                              onClick={() => setSelected(u)}
                              className="px-3 py-1.5 text-sm bg-amber-600 hover:bg-amber-700 text-white rounded-lg"
                            >
                              Xem chi tiết
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-4 py-2 rounded-lg border dark:border-gray-600 disabled:opacity-40"
              >
                Trước
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Trang {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-4 py-2 rounded-lg border dark:border-gray-600 disabled:opacity-40"
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}

      <UserDetailModal user={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
