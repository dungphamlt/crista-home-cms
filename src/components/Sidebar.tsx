'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

const navItems = [
  { href: '/', label: 'Tổng quan', icon: '📊' },
  { href: '/products', label: 'Sản phẩm', icon: '📦' },
  { href: '/categories', label: 'Danh mục', icon: '📁' },
  { href: '/orders', label: 'Đơn hàng', icon: '🛒' },
  { href: '/coupons', label: 'Mã giảm giá', icon: '🎫' },
  { href: '/banners', label: 'Banner', icon: '🖼️' },
  { href: '/blogs', label: 'Bài viết', icon: '📝' },
  { href: '/pages', label: 'Trang', icon: '📄' },
  { href: '/reviews', label: 'Đánh giá', icon: '⭐' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { setToken } = useAuth();

  const handleLogout = () => {
    setToken(null);
    window.location.href = '/login';
  };

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="font-bold text-lg">Crista Home</h2>
        <p className="text-sm text-gray-400">CMS Admin</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${
              pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                ? 'bg-amber-600 text-white'
                : 'hover:bg-gray-800'
            }`}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full py-2 text-left px-4 rounded-lg hover:bg-gray-800 text-red-400"
        >
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
