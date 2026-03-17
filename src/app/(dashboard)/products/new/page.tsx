"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ProductForm } from "@/components/ProductForm";

export default function NewProductPage() {
  const router = useRouter();

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/products" className="text-gray-500 hover:text-gray-700">
          ← Quay lại
        </Link>
        <h1 className="text-2xl font-bold">Thêm sản phẩm</h1>
      </div>
      <ProductForm
        onSuccess={() => router.push("/products")}
      />
    </div>
  );
}
