import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("admin_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      // localStorage.removeItem("admin_token");
      // window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

export const endpoints = {
  login: () => "/auth/login",
  categories: (withCount?: boolean) =>
    `/categories${withCount ? "?withCount=true" : ""}`,
  categoriesAdmin: () => "/categories/admin/all",
  category: (id: string) => `/categories/${id}`,
  products: (params?: Record<string, string | number>) => {
    if (!params || Object.keys(params).length === 0) return "/products";
    const search = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params).map(([k, v]) => [k, String(v)]),
      ),
    ).toString();
    return `/products?${search}`;
  },
  productsAdmin: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    isActive?: boolean;
    isFeatured?: boolean;
    isNewArrival?: boolean;
  }) => {
    const p = params || {};
    const search = new URLSearchParams(
      Object.entries(p)
        .filter(([, v]) => v != null && v !== "")
        .map(([k, v]) => [k, String(v)]),
    ).toString();
    return `/products/admin${search ? `?${search}` : ""}`;
  },
  product: (id: string) => `/products/${id}`,
  orders: (params?: { page?: number; limit?: number; status?: string }) => {
    const p = params || {};
    const search = new URLSearchParams(
      Object.entries(p)
        .filter(([, v]) => v != null)
        .map(([k, v]) => [k, String(v)]),
    ).toString();
    return `/orders${search ? `?${search}` : ""}`;
  },
  orderStatus: (id: string) => `/orders/${id}/status`,
  coupons: (params?: { page?: number; limit?: number }) => {
    const p = params || {};
    const search = new URLSearchParams(
      Object.entries(p)
        .filter(([, v]) => v != null)
        .map(([k, v]) => [k, String(v)]),
    ).toString();
    return `/coupons${search ? `?${search}` : ""}`;
  },
  coupon: (id: string) => `/coupons/${id}`,
  banners: () => "/banners",
  bannersAdmin: () => "/banners/admin/all",
  blogs: (page?: number) => `/blogs${page ? `?page=${page}` : ""}`,
  blogsAdmin: (page?: number) => `/blogs/admin${page ? `?page=${page}` : ""}`,
  blog: (id: string) => `/blogs/${id}`,
  reviews: (params?: { page?: number; product?: string }) => {
    const p = params || {};
    const search = new URLSearchParams(
      Object.entries(p)
        .filter(([, v]) => v != null)
        .map(([k, v]) => [k, String(v)]),
    ).toString();
    return `/reviews${search ? `?${search}` : ""}`;
  },
  reviewApprove: (id: string) => `/reviews/${id}/approve`,
};
