"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  type CmsUserDetail,
  cmsUserRecordId,
  useSetUserPasswordAdmin,
  useUpdateUserRoleAdmin,
} from "@/hooks/useApi";

type UserDetailModalProps = {
  user: CmsUserDetail | null;
  onClose: () => void;
  onUserUpdated?: (u: CmsUserDetail) => void;
};

const ROLE_OPTIONS = [
  { value: "user", label: "User" },
  { value: "admin", label: "Admin" },
  { value: "partner", label: "Partner" },
];

function normalizeRole(role?: string): string {
  return (role ?? "user").trim().toLowerCase();
}

/** CMS chỉ cho đặt lại mật khẩu admin / partner (không áp dụng khách `user`). */
function canAdminSetPassword(role?: string): boolean {
  const r = normalizeRole(role);
  return r === "admin" || r === "partner";
}

function isSensitiveFieldKey(k: string): boolean {
  const lower = k.toLowerCase();
  if (lower === "__v") return true;
  if (lower.includes("password") || lower.includes("hash")) return true;
  return false;
}

function axiosMessage(err: unknown): string {
  const r = err as { response?: { data?: { message?: string } } };
  return r.response?.data?.message ?? "Thất bại";
}

const KEY_LABELS: Record<string, string> = {
  _id: "ID",
  id: "ID",
  email: "Email",
  name: "Tên",
  fullName: "Họ tên",
  phone: "Số điện thoại",
  avatar: "Ảnh đại diện",
  role: "Vai trò",
  googleId: "Google ID",
  facebookId: "Facebook ID",
  google_id: "Google ID",
  facebook_id: "Facebook ID",
  createdAt: "Ngày tạo",
  updatedAt: "Cập nhật",
};

/** Field thường chứa URL ảnh (camelCase / snake_case) */
const IMAGE_FIELD_KEYS = new Set([
  "avatar",
  "image",
  "photo",
  "picture",
  "thumbnail",
  "cover",
  "coverUrl",
  "banner",
  "profileImage",
  "profilePicture",
  "avatarUrl",
  "avatar_url",
  "profile_image",
  "cover_image",
]);

function isHttpUrl(s: string): boolean {
  return /^https?:\/\//i.test(s.trim());
}

function hasImageExtensionInUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return /\.(jpe?g|png|gif|webp|svg|avif|bmp|ico)(\?.*)?$/i.test(u.pathname);
  } catch {
    return /\.(jpe?g|png|gif|webp|svg|avif|bmp|ico)(\?|$)/i.test(url);
  }
}

function shouldRenderAsImage(
  fieldKey: string,
  value: unknown,
): value is string {
  if (typeof value !== "string") return false;
  const s = value.trim();
  if (!s || !isHttpUrl(s)) return false;
  if (IMAGE_FIELD_KEYS.has(fieldKey)) return true;
  return hasImageExtensionInUrl(s);
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "Có" : "Không";
  if (typeof value === "object") {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }
  const s = String(value);
  if (/^\d{4}-\d{2}-\d{2}T/.test(s)) {
    try {
      return new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(s));
    } catch {
      return s;
    }
  }
  return s;
}

function FieldValue({ fieldKey, value }: { fieldKey: string; value: unknown }) {
  if (shouldRenderAsImage(fieldKey, value)) {
    const label = KEY_LABELS[fieldKey] ?? fieldKey;
    return (
      <div className="flex flex-col gap-2 min-w-0">
        <div className="relative h-32 w-32 max-w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-900">
          <Image
            src={value}
            alt={label}
            fill
            className="object-contain"
            sizes="(max-width: 640px) 128px, 256px"
            quality={92}
          />
        </div>
      </div>
    );
  }

  return (
    <span className="wrap-break-word whitespace-pre-wrap">
      {formatValue(value)}
    </span>
  );
}

export function UserDetailModal({
  user,
  onClose,
  onUserUpdated,
}: UserDetailModalProps) {
  const updateRole = useUpdateUserRoleAdmin();
  const setPassword = useSetUserPasswordAdmin();
  const [roleDraft, setRoleDraft] = useState("user");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (user) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [user, onClose]);

  useEffect(() => {
    if (user) {
      setRoleDraft((user.role ?? "user").trim() || "user");
      setNewPassword("");
      setConfirmPassword("");
    }
  }, [user]);

  if (!user) return null;

  const showPasswordReset = canAdminSetPassword(user.role);

  const entries = Object.entries(user as Record<string, unknown>).filter(
    ([k]) => !isSensitiveFieldKey(k),
  );

  const handleSaveRole = async () => {
    const recordId = cmsUserRecordId(user);
    if (!recordId) return;
    try {
      await updateRole.mutateAsync({ id: recordId, role: roleDraft });
      onUserUpdated?.({ ...user, role: roleDraft });
      alert("Đã cập nhật vai trò");
    } catch (e) {
      alert(axiosMessage(e));
    }
  };

  const handleSavePassword = async () => {
    if (!canAdminSetPassword(user.role)) return;
    if (newPassword.length < 8) {
      alert("Mật khẩu tối thiểu 8 ký tự");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("Mật khẩu xác nhận không khớp");
      return;
    }
    const recordId = cmsUserRecordId(user);
    if (!recordId) return;
    try {
      await setPassword.mutateAsync({ id: recordId, password: newPassword });
      setNewPassword("");
      setConfirmPassword("");
      alert("Đã đặt mật khẩu mới");
    } catch (e) {
      alert(axiosMessage(e));
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold">Chi tiết user</h2>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded-lg dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
          >
            Đóng
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <dl className="space-y-3 text-sm">
            {entries.map(([key, value]) => (
              <div
                key={key}
                className="grid grid-cols-[minmax(0,7.5rem)_1fr] gap-3 border-b border-gray-100 dark:border-gray-700 pb-3 last:border-0"
              >
                <dt className="text-gray-500 dark:text-gray-400 shrink-0">
                  {KEY_LABELS[key] ?? key}
                </dt>
                <dd className="font-medium">
                  <FieldValue fieldKey={key} value={value} />
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Vai trò (CMS)
              </h3>
              <div className="flex flex-wrap gap-2 items-end">
                <select
                  value={roleDraft}
                  onChange={(e) => setRoleDraft(e.target.value)}
                  className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-sm min-w-[10rem]"
                >
                  {ROLE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleSaveRole}
                  disabled={
                    updateRole.isPending ||
                    roleDraft.trim() === String(user.role ?? "user").trim()
                  }
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-lg text-sm"
                >
                  {updateRole.isPending ? "Đang lưu..." : "Lưu vai trò"}
                </button>
              </div>
            </div>
            {showPasswordReset ? (
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Đặt mật khẩu
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Ghi đè mật khẩu đăng nhập (tối thiểu 8 ký tự). Người dùng sẽ
                  đăng nhập bằng mật khẩu mới.
                </p>
                <div className="space-y-2 max-w-md">
                  <input
                    type="password"
                    autoComplete="new-password"
                    placeholder="Mật khẩu mới"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-sm"
                  />
                  <input
                    type="password"
                    autoComplete="new-password"
                    placeholder="Nhập lại mật khẩu"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleSavePassword}
                    disabled={setPassword.isPending}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-900 dark:bg-gray-600 dark:hover:bg-gray-500 disabled:opacity-50 text-white rounded-lg text-sm"
                  >
                    {setPassword.isPending ? "Đang lưu..." : "Lưu mật khẩu"}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Đặt lại mật khẩu không áp dụng cho tài khoản khách (role User).
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
