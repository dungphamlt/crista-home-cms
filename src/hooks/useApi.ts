"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { api, endpoints } from "@/lib/api";

// Query keys
export const queryKeys = {
  dashboardStats: ["dashboard", "stats"] as const,
  categoriesAdmin: ["categories", "admin"] as const,
  productsAdmin: (params?: Record<string, unknown>) =>
    ["products", "admin", params ?? {}] as const,
  product: (id: string) => ["product", id] as const,
};

// Dashboard stats
export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.dashboardStats,
    queryFn: async () => {
      const [ordersRes, productsRes] = await Promise.all([
        api.get(endpoints.orders({ limit: 1 })),
        api.get(endpoints.products({ limit: 1 })),
      ]);
      return {
        totalOrders: ordersRes.data?.total ?? 0,
        totalProducts: productsRes.data?.total ?? 0,
      };
    },
  });
}

// Categories admin
export function useCategoriesAdmin(
  options?: Omit<UseQueryOptions<{ _id: string; name: string }[]>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: queryKeys.categoriesAdmin,
    queryFn: async () => {
      const res = await api.get(endpoints.categoriesAdmin());
      return res.data || [];
    },
    ...options,
  });
}

// Products admin (paginated, filtered)
type ProductsAdminParams = {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  isActive?: string;
  isFeatured?: string;
  isNewArrival?: string;
};

type ProductsAdminResponse = {
  data: Array<{
    _id: string;
    sku?: string;
    name: string;
    slug?: string;
    price: number;
    compareAtPrice?: number;
    images?: string[];
    shortDescription?: string;
    stock?: number;
    isActive?: boolean;
    isFeatured?: boolean;
    isNewArrival?: boolean;
    categories?: { _id: string; name: string }[];
  }>;
  total: number;
  totalPages: number;
};

export function useProductsAdmin(params: ProductsAdminParams = {}) {
  const { page = 1, limit = 10, search, category, isActive, isFeatured, isNewArrival } = params;
  const queryParams = {
    page,
    limit,
    ...(search && { search }),
    ...(category && { category }),
    ...(isActive && { isActive: isActive === "true" }),
    ...(isFeatured && { isFeatured: isFeatured === "true" }),
    ...(isNewArrival && { isNewArrival: isNewArrival === "true" }),
  };

  return useQuery({
    queryKey: queryKeys.productsAdmin(queryParams),
    queryFn: async (): Promise<ProductsAdminResponse> => {
      const res = await api.get(endpoints.productsAdmin(queryParams));
      return {
        data: res.data?.data || [],
        total: res.data?.total ?? 0,
        totalPages: res.data?.totalPages ?? 1,
      };
    },
  });
}

// Single product
export function useProduct(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: queryKeys.product(id ?? ""),
    queryFn: async () => {
      const res = await api.get(endpoints.product(id!));
      return res.data;
    },
    enabled: !!id && enabled,
  });
}

// Mutations
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(endpoints.product(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats });
    },
  });
}

type ProductPayload = {
  sku?: string;
  name: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  images: string[];
  price: number;
  compareAtPrice?: number;
  categories: string[];
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  order: number;
  variants: Array<{ name: string; value?: string; image?: string; stock: number }>;
};

export function useSaveProduct(productId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProductPayload) =>
      productId
        ? api.put(endpoints.product(productId), payload)
        : api.post("/products", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats });
      if (productId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.product(productId) });
      }
    },
  });
}
