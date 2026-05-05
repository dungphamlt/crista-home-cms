"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { isTokenAdminRole } from "@/lib/auth-storage";
import {
  useAdminsAdmin,
  type AdminListItem,
  cmsUserRecordId,
} from "@/hooks/useApi";
import { UserDetailModal } from "@/components/users/UserDetailModal";
import { CreateAdminModal } from "@/components/users/CreateAdminModal";

const PAGE_SIZE = 20;

function displayName(u: AdminListItem): string {
  return u.name?.trim() || u.email || u.id;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { token, isReady } = useAuth();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<AdminListItem | null>(null);
  const [createAdminOpen, setCreateAdminOpen] = useState(false);

  const canAccess = token ? isTokenAdminRole(token) : false;

  useEffect(() => {
    if (!isReady || !token) return;
    if (!canAccess) router.replace("/users");
  }, [isReady, token, canAccess, router]);

  const { data, isLoading, isError } = useAdminsAdmin({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    enabled: isReady && !!token && canAccess,
  });

  const rows = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  if (!isReady || !token) {
    return <p className="p-8 text-gray-500">Đang tải...</p>;
  }

  if (!canAccess) {
    return <p className="p-8 text-gray-500">Đang chuyển hướng...</p>;
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="text-2xl font-bold">Quản lý admin</h1>
        <div className="flex flex-wrap gap-2 items-center">
          <form
            onSubmit={handleSearch}
            className="flex flex-wrap gap-2 items-center"
          >
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Email hoặc tên..."
              className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 text-sm min-w-[200px]"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm"
            >
              Tìm
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                setSearch("");
                setPage(1);
              }}
              className="px-4 py-2 border rounded-lg dark:border-gray-600 text-sm"
            >
              Xóa lọc
            </button>
          </form>
          <button
            type="button"
            onClick={() => setCreateAdminOpen(true)}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-900 dark:bg-gray-600 dark:hover:bg-gray-500 text-white rounded-lg text-sm shrink-0"
          >
            + Thêm admin
          </button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-gray-600 dark:text-gray-400">Đang tải...</p>
      ) : isError ? (
        <p className="text-red-600 dark:text-red-400">
          Không tải được danh sách. Kiểm tra API GET /users/admin/admins.
        </p>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px]">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="text-left p-4 font-semibold">Tên / Email</th>
                    <th className="text-left p-4 font-semibold">Vai trò</th>
                    <th className="text-left p-4 font-semibold">Ngày tạo</th>
                    <th className="text-right p-4 font-semibold">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="p-8 text-center text-gray-500 dark:text-gray-400"
                      >
                        Chưa có tài khoản admin.
                      </td>
                    </tr>
                  ) : (
                    rows.map((u) => {
                      return (
                        <tr
                          key={u.id}
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
                          <td className="p-4">
                            <span className="text-sm px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 capitalize">
                              {u.role}
                            </span>
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
                              Chi tiết
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

      <UserDetailModal
        user={selected}
        onClose={() => setSelected(null)}
        onUserUpdated={(u) =>
          setSelected((s) =>
            s && cmsUserRecordId(s) === cmsUserRecordId(u)
              ? { ...s, ...u }
              : s,
          )
        }
      />

      <CreateAdminModal
        open={createAdminOpen}
        onClose={() => setCreateAdminOpen(false)}
      />
    </div>
  );
}
