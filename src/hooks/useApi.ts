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
  category: (id: string) => ["category", id] as const,
  bannersAdmin: ["banners", "admin"] as const,
  banner: (id: string) => ["banner", id] as const,
  pages: (params?: Record<string, unknown>) => ["pages", params ?? {}] as const,
  page: (id: string) => ["page", id] as const,
  productsAdmin: (params?: Record<string, unknown>) =>
    ["products", "admin", params ?? {}] as const,
  product: (id: string) => ["product", id] as const,
  usersAdmin: (params?: Record<string, unknown>) =>
    ["users", "admin", params ?? {}] as const,
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
type CategoryAdmin = {
  _id: string;
  name: string;
  slug?: string;
  image?: string;
  parent?: { _id: string; name: string } | null;
};

export function useCategoriesAdmin(
  options?: Omit<UseQueryOptions<CategoryAdmin[]>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: queryKeys.categoriesAdmin,
    queryFn: async (): Promise<CategoryAdmin[]> => {
      const res = await api.get(endpoints.categoriesAdmin());
      return res.data || [];
    },
    ...options,
  });
}

// Single category
export function useCategory(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: queryKeys.category(id ?? ""),
    queryFn: async () => {
      const res = await api.get(endpoints.category(id!));
      return res.data;
    },
    enabled: !!id && enabled,
  });
}

// Save category
type CategoryPayload = {
  name: string;
  slug?: string;
  parent?: string;
  image?: string;
};

export function useSaveCategory(categoryId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CategoryPayload) =>
      categoryId
        ? api.put(endpoints.category(categoryId), payload)
        : api.post("/categories", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.categoriesAdmin });
      if (categoryId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.category(categoryId),
        });
      }
    },
  });
}

// Banners admin
export type BannerAdmin = {
  _id: string;
  title: string;
  image?: string;
  link?: string;
  order?: number;
  isActive?: boolean;
};

export function useBannersAdmin() {
  return useQuery({
    queryKey: queryKeys.bannersAdmin,
    queryFn: async (): Promise<BannerAdmin[]> => {
      const res = await api.get(endpoints.bannersAdmin());
      return res.data || [];
    },
  });
}

export function useBanner(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: queryKeys.banner(id ?? ""),
    queryFn: async () => {
      const res = await api.get(endpoints.banner(id!));
      return res.data;
    },
    enabled: !!id && enabled,
  });
}

type BannerPayload = {
  title: string;
  image?: string;
  link?: string;
  order?: number;
  isActive?: boolean;
};

export function useSaveBanner(bannerId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BannerPayload) =>
      bannerId
        ? api.put(endpoints.banner(bannerId), payload)
        : api.post("/banners", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.bannersAdmin });
      if (bannerId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.banner(bannerId) });
      }
    },
  });
}

export function useDeleteBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(endpoints.banner(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.bannersAdmin });
    },
  });
}

export function useToggleBannerActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (banner: BannerAdmin) =>
      api.put(endpoints.banner(banner._id), {
        ...banner,
        isActive: !banner.isActive,
      }),
    onSuccess: (_, banner) => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.bannersAdmin });
      queryClient.invalidateQueries({ queryKey: queryKeys.banner(banner._id) });
    },
  });
}

// Pages
type PageItem = {
  _id: string;
  name: string;
  slug?: string;
  content?: string;
};

type PagesResponse = {
  data: PageItem[];
  total: number;
  totalPages: number;
};

export function usePages(params: { page?: number; limit?: number } = {}) {
  const { page = 1, limit = 10 } = params;

  return useQuery({
    queryKey: queryKeys.pages({ page, limit }),
    queryFn: async (): Promise<PagesResponse> => {
      const res = await api.get(endpoints.pages({ page, limit }));
      const raw = res.data;
      const data = Array.isArray(raw) ? raw : (raw?.data ?? []);
      return {
        data,
        total: raw?.total ?? data.length,
        totalPages: raw?.totalPages ?? 1,
      };
    },
  });
}

export function usePage(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: queryKeys.page(id ?? ""),
    queryFn: async () => {
      const res = await api.get(endpoints.page(id!));
      return res.data;
    },
    enabled: !!id && enabled,
  });
}

type PagePayload = {
  name: string;
  slug?: string;
  content?: string;
};

export function useSavePage(pageId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PagePayload) =>
      pageId
        ? api.put(endpoints.page(pageId), payload)
        : api.post("/pages", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages"] });
      if (pageId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.page(pageId) });
      }
    },
  });
}

export function useDeletePage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(endpoints.page(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages"] });
    },
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
    coverImage?: string;
    shortDescription?: string;
    stock?: number;
    variantCount?: number;
    variants?: { stock?: number }[];
    isActive?: boolean;
    isFeatured?: boolean;
    isNewArrival?: boolean;
    categories?: { _id: string; name: string }[];
  }>;
  total: number;
  totalPages: number;
};

export function useProductsAdmin(params: ProductsAdminParams = {}) {
  const {
    page = 1,
    limit = 10,
    search,
    category,
    isActive,
    isFeatured,
    isNewArrival,
  } = params;
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

/** Khớp ProductVariant ở backend — mỗi biến thể có SKU & gallery riêng */
export type ProductVariantPayload = {
  name: string;
  value?: string;
  sku?: string;
  images: string[];
  stock: number;
};

type ProductPayload = {
  sku?: string;
  name: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  images: string[];
  /** Ảnh bìa / hero (tùy chọn) */
  coverImage?: string;
  price: number;
  categories: string[];
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  order: number;
  variants: ProductVariantPayload[];
};

/** User (khách hàng / tài khoản) từ GET /users/admin — field có thể khác tùy backend */
export type AdminUser = {
  _id: string;
  email?: string;
  name?: string;
  fullName?: string;
  phone?: string;
  avatar?: string;
  role?: string;
  /** ID tài khoản Google (OAuth) */
  googleId?: string;
  /** ID tài khoản Facebook (OAuth) */
  facebookId?: string;
  createdAt?: string;
  updatedAt?: string;
};

type UsersAdminResponse = {
  data: AdminUser[];
  total: number;
  totalPages: number;
};

function normalizeUsersAdminPayload(raw: unknown): UsersAdminResponse {
  if (Array.isArray(raw)) {
    return {
      data: raw as AdminUser[],
      total: raw.length,
      totalPages: 1,
    };
  }
  if (raw && typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    const data = Array.isArray(o.data) ? (o.data as AdminUser[]) : [];
    return {
      data,
      total: Number(o.total ?? data.length),
      totalPages: Number(o.totalPages ?? 1),
    };
  }
  return { data: [], total: 0, totalPages: 1 };
}

export function useUsersAdmin(params: { page?: number; limit?: number } = {}) {
  const { page = 1, limit = 20 } = params;

  return useQuery({
    queryKey: queryKeys.usersAdmin({ page, limit }),
    queryFn: async (): Promise<UsersAdminResponse> => {
      const res = await api.get(endpoints.usersAdmin({ page, limit }));
      return normalizeUsersAdminPayload(res.data);
    },
  });
}

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
        queryClient.invalidateQueries({
          queryKey: queryKeys.product(productId),
        });
      }
    },
  });
}
