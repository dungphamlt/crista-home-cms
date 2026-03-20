"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { CategoryForm } from "@/components/categories/CategoryForm";

export default function NewCategoryPage() {
  const router = useRouter();

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/categories" className="text-gray-500 hover:text-gray-700">
          ← Quay lại
        </Link>
        <h1 className="text-2xl font-bold">Thêm danh mục</h1>
      </div>
      <CategoryForm onSuccess={() => router.push("/categories")} />
    </div>
  );
}
