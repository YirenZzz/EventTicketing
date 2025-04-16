'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Routes that should NOT show layout
  const hideLayoutRoutes = ['/', '/login', '/signup', '/forgot-password'];

  // Check if current pathname starts with any of the hidden routes
  const shouldHideLayout = hideLayoutRoutes.some((route) =>
    pathname === route || pathname.startsWith(route + '/')
  );

  return shouldHideLayout ? (
    <>{children}</>
  ) : (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">{children}</main>
      </div>
    </div>
  );
}