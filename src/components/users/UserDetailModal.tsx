"use client";

import { useEffect } from "react";
import Image from "next/image";
import type { AdminUser } from "@/hooks/useApi";

type UserDetailModalProps = {
  user: AdminUser | null;
  onClose: () => void;
};

const KEY_LABELS: Record<string, string> = {
  _id: "ID",
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

export function UserDetailModal({ user, onClose }: UserDetailModalProps) {
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

  if (!user) return null;

  const entries = Object.entries(user as Record<string, unknown>).filter(
    ([k]) => k !== "__v",
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col"
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
        </div>
      </div>
    </div>
  );
}
