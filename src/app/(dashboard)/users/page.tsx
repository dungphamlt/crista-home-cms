"use client";

import { useState } from "react";
import Image from "next/image";
import {
  useCustomersAdmin,
  type CustomerUserRecord,
  cmsUserRecordId,
} from "@/hooks/useApi";
import { UserDetailModal } from "@/components/users/UserDetailModal";
import { CreateAdminModal } from "@/components/users/CreateAdminModal";

const PAGE_SIZE = 20;

function displayName(u: CustomerUserRecord): string {
  return u.fullName || u.name || u.username || u.email || cmsUserRecordId(u);
}

function getAvatarUrl(u: CustomerUserRecord): string | undefined {
  const r = u as Record<string, unknown>;
  const v = u.avatar ?? r.avatar_url ?? r.avatarUrl;
  return typeof v === "string" && v.trim().length > 0 ? v.trim() : undefined;
}

function normalizeRole(role?: string): string {
  return (role ?? "user").toLowerCase().trim();
}

function roleLabel(role?: string): string {
  const r = normalizeRole(role);
  if (r === "admin") return "Admin";
  if (r === "partner") return "Partner";
  return "User";
}

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<CustomerUserRecord | null>(null);
  const [currentTab, setCurrentTab] = useState<"user" | "partner">("user");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreatePartnerOpen, setIsCreatePartnerOpen] = useState(false);

  const { data, isLoading, isError } = useCustomersAdmin({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
  });

  const rows = (data?.data ?? []).filter(
    (u) => normalizeRole(u.role) === currentTab,
  );

  const totalPages = data?.totalPages ?? 1;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
          <p className="text-sm text-gray-500 mt-1">
            {currentTab === "user"
              ? "Danh sách khách hàng đăng ký qua web/app"
              : "Danh sách đối tác (Partner) có quyền xem giá sỉ"}
          </p>
        </div>
        {currentTab === "partner" && (
          <button
            onClick={() => setIsCreatePartnerOpen(true)}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium"
          >
            + Thêm Partner
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b dark:border-gray-700 mb-6">
        <button
          onClick={() => {
            setCurrentTab("user");
            setPage(1);
          }}
          className={`px-6 py-3 cursor-pointer text-sm font-semibold transition-colors border-b-2 ${
            currentTab === "user"
              ? "border-amber-600 text-amber-600"
              : "border-transparent text-gray-600 hover:text-gray-900 dark:hover:text-gray-300"
          }`}
        >
          Người dùng
        </button>
        <button
          onClick={() => {
            setCurrentTab("partner");
            setPage(1);
          }}
          className={`px-6 py-3 cursor-pointer text-sm font-semibold transition-colors border-b-2 ${
            currentTab === "partner"
              ? "border-amber-600 text-amber-600"
              : "border-transparent text-gray-600 hover:text-gray-900 dark:hover:text-gray-300"
          }`}
        >
          Partner
        </button>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <form
          onSubmit={handleSearch}
          className="flex flex-wrap gap-2 items-center"
        >
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tên, Email hoặc Username..."
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
      </div>

      {isLoading ? (
        <p className="text-gray-600 dark:text-gray-400">Đang tải...</p>
      ) : isError ? (
        <p className="text-red-600 dark:text-red-400">
          Không tải được danh sách. Kiểm tra API GET /users/admin/users.
        </p>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="text-left p-4 font-semibold">Tên / Email</th>
                    <th className="text-left p-4 font-semibold">Vai trò</th>
                    <th className="text-left p-4 font-semibold">
                      Số điện thoại
                    </th>
                    <th className="text-left p-4 font-semibold">Avatar</th>
                    <th className="text-left p-4 font-semibold">Ngày tạo</th>
                    <th className="text-right p-4 font-semibold">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="p-8 text-center text-gray-500 dark:text-gray-400"
                      >
                        Chưa có người dùng trên trang này.
                      </td>
                    </tr>
                  ) : (
                    rows.map((u) => {
                      const avatarUrl = getAvatarUrl(u);
                      return (
                        <tr
                          key={cmsUserRecordId(u)}
                          className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/50"
                        >
                           <td className="p-4">
                             <div className="font-medium">{displayName(u)}</div>
                             {(u.email || u.username) && (
                               <div className="text-sm text-gray-500 dark:text-gray-400">
                                 {u.email || u.username}
                               </div>
                             )}
                           </td>
                          <td className="p-4">
                            <span className="text-sm px-2 py-1 rounded bg-gray-100 dark:bg-gray-700">
                              {roleLabel(u.role)}
                            </span>
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
                                  {(u.name || u.email || "?").charAt(0)}
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
        open={isCreatePartnerOpen}
        onClose={() => setIsCreatePartnerOpen(false)}
        role="partner"
      />
    </div>
  );
}
