import axios from "axios";
import { clearAuthAndRedirectToLogin } from "@/lib/auth-storage";

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
      const url = String((err.config as { url?: string })?.url ?? "");
      if (!url.includes("/auth/login")) {
        clearAuthAndRedirectToLogin();
      }
    }
    return Promise.reject(err);
  },
);

export const endpoints = {
  login: () => "/auth/login",
  categories: (params?: { withCount?: boolean; parent?: string }) => {
    const p = params || {};
    const search = new URLSearchParams(
      Object.entries(p)
        .filter(([, v]) => v != null)
        .map(([k, v]) => [k, String(v)]),
    ).toString();
    return `/categories${search ? `?${search}` : ""}`;
  },
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
  banner: (id: string) => `/banners/${id}`,
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
  pages: (params?: { page?: number; limit?: number }) => {
    const p = params || {};
    const search = new URLSearchParams(
      Object.entries(p)
        .filter(([, v]) => v != null)
        .map(([k, v]) => [k, String(v)]),
    ).toString();
    return `/pages${search ? `?${search}` : ""}`;
  },
  pageBySlug: (slug: string) => `/pages/slug/${slug}`,
  page: (id: string) => `/pages/${id}`,
  /** Danh sách user (admin) */
  usersAdmin: (params?: { page?: number; limit?: number }) => {
    const p = params || {};
    const search = new URLSearchParams(
      Object.entries(p)
        .filter(([, v]) => v != null)
        .map(([k, v]) => [k, String(v)]),
    ).toString();
    return `/users/admin${search ? `?${search}` : ""}`;
  },
};
