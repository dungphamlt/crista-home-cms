"use client";

import { useEffect, useState } from "react";
import { useCreateAdminUser } from "@/hooks/useApi";

type CreateAdminModalProps = {
  open: boolean;
  onClose: () => void;
};

function axiosMessage(err: unknown): string {
  const r = err as { response?: { data?: { message?: string } } };
  return r.response?.data?.message ?? "Thất bại";
}

export function CreateAdminModal({ open, onClose }: CreateAdminModalProps) {
  const createAdmin = useCreateAdminUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    if (open) {
      setEmail("");
      setPassword("");
      setName("");
    }
  }, [open]);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      document.addEventListener("keydown", esc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", esc);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      alert("Nhập email");
      return;
    }
    if (password.length < 8) {
      alert("Mật khẩu tối thiểu 8 ký tự");
      return;
    }
    try {
      await createAdmin.mutateAsync({
        email: email.trim(),
        password,
        name: name.trim() || undefined,
      });
      alert("Đã tạo tài khoản admin");
      onClose();
    } catch (err) {
      alert(axiosMessage(err));
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full overflow-hidden"
        onClick={(ev) => ev.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-bold">Thêm admin mới</h2>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 border rounded-lg dark:border-gray-600 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Đóng
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email *</label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-sm"
              placeholder="admin@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tên hiển thị</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-sm"
              placeholder="Tùy chọn"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mật khẩu *</label>
            <input
              type="password"
              required
              autoComplete="new-password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-sm"
              placeholder="Tối thiểu 8 ký tự"
            />
          </div>
          <button
            type="submit"
            disabled={createAdmin.isPending}
            className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-lg font-medium text-sm"
          >
            {createAdmin.isPending ? "Đang tạo..." : "Tạo admin"}
          </button>
        </form>
      </div>
    </div>
  );
}
