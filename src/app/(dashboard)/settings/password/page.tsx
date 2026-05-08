"use client";

import { useState } from "react";
import Link from "next/link";
import { useUpdateMyAdminPassword } from "@/hooks/useApi";
import toast from "react-hot-toast";

function getErrMessage(err: unknown): string {
  const r = err as { response?: { data?: { message?: string } } };
  return r.response?.data?.message ?? "Có lỗi xảy ra";
}

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const mutation = useUpdateMyAdminPassword();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("Mật khẩu mới cần ít nhất 8 ký tự");
      return;
    }
    if (newPassword !== confirm) {
      toast.error("Mật khẩu mới và xác nhận không khớp");
      return;
    }
    try {
      await mutation.mutateAsync({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
      toast.success("Đã đổi mật khẩu");
    } catch (err) {
      toast.error(getErrMessage(err));
    }
  };

  return (
    <div className="p-8 max-w-md">
      <div className="mb-6">
        <Link href="/" className="text-sm text-amber-600 hover:underline">
          ← Về tổng quan
        </Link>
        <h1 className="text-2xl font-bold mt-2">Đổi mật khẩu</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Dùng mật khẩu đăng nhập CMS hiện tại và mật khẩu mới (tối thiểu 8 ký tự).
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Mật khẩu hiện tại
          </label>
          <input
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Mật khẩu mới</label>
          <input
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Nhập lại mật khẩu mới
          </label>
          <input
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={8}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
          />
        </div>
        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-lg font-medium"
        >
          {mutation.isPending ? "Đang lưu..." : "Cập nhật mật khẩu"}
        </button>
      </form>
    </div>
  );
}
