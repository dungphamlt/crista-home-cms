"use client";

import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { CategoryForm } from "@/components/categories/CategoryForm";

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/categories" className="text-gray-500 hover:text-gray-700">
          ← Quay lại
        </Link>
        <h1 className="text-2xl font-bold">Sửa danh mục</h1>
      </div>
      <CategoryForm categoryId={id} onSuccess={() => router.push("/categories")} />
    </div>
  );
}
