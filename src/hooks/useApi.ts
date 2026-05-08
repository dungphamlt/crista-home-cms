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
  usersAdminCustomers: (params?: Record<string, unknown>) =>
    ["users", "admin", "customers", params ?? {}] as const,
  usersAdminAdmins: (params?: Record<string, unknown>) =>
    ["users", "admin", "admins", params ?? {}] as const,
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
    wholesalePrice?: number;
    bulkWholesalePrice?: number;
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
  wholesalePrice?: number;
  bulkWholesalePrice?: number;
  categories: string[];
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  order: number;
  variants: ProductVariantPayload[];
};

/** Admin từ GET /users/admin/admins — shape cố định */
export type AdminListItem = {
  id: string;
  username?: string;
  name?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
};

/** Khách / partner từ GET /users/admin/users — có thể có thêm field (hiển thị modal chi tiết) */
export type CustomerUser = {
  _id?: string;
  id?: string;
  email?: string;
  username?: string;
  name?: string;
  fullName?: string;
  phone?: string;
  avatar?: string;
  role?: string;
  googleId?: string;
  facebookId?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CustomerUserRecord = CustomerUser & Record<string, unknown>;

export type CmsUserDetail = CustomerUserRecord | AdminListItem;

/** ID dùng cho PATCH /users/admin/:id (BE có thể trả `id` hoặc `_id`) */
export function cmsUserRecordId(u: { id?: string; _id?: string }): string {
  const v = u.id ?? u._id;
  if (typeof v === "string" && v.length > 0) return v;
  if (v != null) return String(v);
  return "";
}

type CustomersAdminResponse = {
  data: CustomerUserRecord[];
  total: number;
  totalPages: number;
};

type AdminsAdminResponse = {
  data: AdminListItem[];
  total: number;
  totalPages: number;
};

function normalizeAdminListItem(raw: unknown): AdminListItem | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const id = String(o.id ?? o._id ?? "");
  if (!id) return null;
  return {
    id,
    username: typeof o.username === "string" ? o.username : undefined,
    name: typeof o.name === "string" ? o.name : undefined,
    role: String(o.role ?? "admin"),
    createdAt: String(o.createdAt ?? ""),
    updatedAt: String(o.updatedAt ?? ""),
  };
}

function normalizeCustomerUser(raw: unknown): CustomerUserRecord {
  if (!raw || typeof raw !== "object") return { _id: "" };
  const o = { ...(raw as Record<string, unknown>) };
  const idStr = String(o._id ?? o.id ?? "");
  if (idStr) {
    o._id = idStr;
    o.id = idStr;
  }
  return o as CustomerUserRecord;
}

function normalizeCustomersAdminPayload(raw: unknown): CustomersAdminResponse {
  if (Array.isArray(raw)) {
    const data = raw.map(normalizeCustomerUser);
    return {
      data,
      total: data.length,
      totalPages: 1,
    };
  }
  if (raw && typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    const arr = Array.isArray(o.data) ? o.data : [];
    const data = arr
      .map(normalizeCustomerUser)
      .filter((u) => cmsUserRecordId(u).length > 0);
    return {
      data,
      total: Number(o.total ?? data.length),
      totalPages: Number(o.totalPages ?? 1),
    };
  }
  return { data: [], total: 0, totalPages: 1 };
}

function normalizeAdminsAdminPayload(raw: unknown): AdminsAdminResponse {
  if (Array.isArray(raw)) {
    const data = raw
      .map(normalizeAdminListItem)
      .filter((x): x is AdminListItem => x != null);
    return {
      data,
      total: data.length,
      totalPages: 1,
    };
  }
  if (raw && typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    const arr = Array.isArray(o.data) ? o.data : [];
    const data = arr
      .map(normalizeAdminListItem)
      .filter((x): x is AdminListItem => x != null);
    return {
      data,
      total: Number(o.total ?? data.length),
      totalPages: Number(o.totalPages ?? 1),
    };
  }
  return { data: [], total: 0, totalPages: 1 };
}

function customersAdminQueryParams(params: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const { page = 1, limit = 20, search } = params;
  return {
    page,
    limit,
    ...(search?.trim() ? { search: search.trim() } : {}),
  };
}

export function useCustomersAdmin(
  params: {
    page?: number;
    limit?: number;
    search?: string;
    enabled?: boolean;
  } = {},
) {
  const { enabled = true, ...rest } = params;
  const queryParams = customersAdminQueryParams(rest);

  return useQuery({
    queryKey: queryKeys.usersAdminCustomers(queryParams),
    queryFn: async (): Promise<CustomersAdminResponse> => {
      const res = await api.get(endpoints.usersAdminCustomers(queryParams));
      return normalizeCustomersAdminPayload(res.data);
    },
    enabled,
  });
}

function adminsAdminQueryParams(params: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}) {
  const { page = 1, limit = 20, search, role } = params;
  return {
    page,
    limit,
    ...(search?.trim() ? { search: search.trim() } : {}),
    ...(role?.trim() ? { role: role.trim() } : {}),
  };
}

export function useAdminsAdmin(params: {
  page?: number;
  limit?: number;
  search?: string;
  enabled?: boolean;
} = {}) {
  const { enabled = true, ...rest } = params;
  const queryParams = adminsAdminQueryParams(rest);

  return useQuery({
    queryKey: queryKeys.usersAdminAdmins(queryParams),
    queryFn: async (): Promise<AdminsAdminResponse> => {
      const res = await api.get(endpoints.usersAdminAdmins(queryParams));
      return normalizeAdminsAdminPayload(res.data);
    },
    enabled,
  });
}

export type CreateAdminPayload = {
  username: string;
  password: string;
  name?: string;
  role?: string;
};

export function useCreateAdminUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateAdminPayload) => {
      if (body.role === "partner") {
        return api.post(endpoints.usersAdminCreatePartner(), {
          username: (body.username || "").trim(),
          password: body.password,
          name: body.name?.trim() || undefined,
        });
      }
      return api.post(endpoints.usersAdminCreate(), {
        username: (body.username || "").trim(),
        password: body.password,
        role: body.role || "admin",
        name: body.name?.trim() || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", "admin"] });
    },
  });
}

export function useUpdateUserRoleAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      api.patch(endpoints.userAdmin(id), { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", "admin"] });
    },
  });
}

export function useSetUserPasswordAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      api.patch(endpoints.userAdminPassword(id), { password }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", "admin"] });
    },
  });
}

export function useUpdateMyAdminPassword() {
  return useMutation({
    mutationFn: (body: { currentPassword: string; newPassword: string }) =>
      api.patch(endpoints.userAdminMePassword(), body),
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
