"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCategoriesAdmin } from "@/hooks/useApi";
import { CategoryEditModal } from "@/components/categories/CategoryEditModal";

type Category = {
  _id: string;
  name: string;
  slug?: string;
  image?: string;
  parent?: { _id: string; name: string } | null;
};

export default function CategoriesPage() {
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const { data: categories = [], isLoading } = useCategoriesAdmin();

  const getDepth = (c: Category): number => {
    if (!c.parent) return 0;
    const parent = categories.find(
      (p) => p._id === (c.parent as { _id: string })?._id,
    );
    return parent ? 1 + getDepth(parent) : 0;
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Danh mục</h1>
        <div className="flex gap-2">
          <Link
            href="/categories/new"
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg"
          >
            Thêm danh mục
          </Link>
        </div>
      </div>
      {isLoading ? (
        <p>Đang tải...</p>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="text-left p-4 w-16">Ảnh</th>
                <th className="text-left p-4">Tên</th>
                <th className="text-left p-4">Slug</th>
                <th className="text-left p-4">Danh mục cha</th>
                <th className="text-right p-4">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr
                  key={c._id}
                  className="border-t border-gray-200 dark:border-gray-700"
                >
                  <td className="p-4">
                    {c.image ? (
                      <div className="relative w-12 h-12 rounded overflow-hidden bg-gray-100 dark:bg-gray-700">
                        <Image
                          src={c.image}
                          alt={c.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-400 text-xs">
                        N/A
                      </div>
                    )}
                  </td>
                  <td
                    className="p-4"
                    style={{ paddingLeft: `${16 + getDepth(c) * 24}px` }}
                  >
                    <span className={!c.parent ? "font-semibold" : ""}>
                      {c.name}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500">{c.slug}</td>
                  <td className="p-4 text-gray-500">
                    {c.parent &&
                    typeof c.parent === "object" &&
                    "name" in c.parent
                      ? (c.parent as { name: string }).name
                      : "-"}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setEditingCategoryId(c._id)}
                      className="text-amber-600 hover:underline"
                    >
                      Sửa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CategoryEditModal
        categoryId={editingCategoryId}
        onClose={() => setEditingCategoryId(null)}
      />
    </div>
  );
}
