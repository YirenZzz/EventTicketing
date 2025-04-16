'use client';

import { signOut } from 'next-auth/react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function LogoutPage() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' }); // 回到 login 页面
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white px-8 py-6 shadow rounded text-center space-y-4">
        <h1 className="text-xl font-semibold text-gray-800">Ready to leave?</h1>
        <p className="text-sm text-gray-500">Click below to logout from your account.</p>
        <Button variant="destructive" onClick={handleLogout}>
          Logout
        </Button>
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </div>
  );
}