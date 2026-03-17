"use client";

import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ProductForm } from "@/components/ProductForm";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/products" className="text-gray-500 hover:text-gray-700">
          ← Quay lại
        </Link>
        <h1 className="text-2xl font-bold">Sửa sản phẩm</h1>
      </div>
      <ProductForm
        productId={id}
        onSuccess={() => router.push("/products")}
      />
    </div>
  );
}
