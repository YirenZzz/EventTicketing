'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';

export default function Topbar() {
  const { data: session } = useSession();
  const userName = session?.user?.name || session?.user?.email || 'U';
  const initial = userName.charAt(0).toUpperCase();

  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="w-full bg-purple-800 h-14 flex items-center justify-between px-6 text-white shadow relative">
      <div className="text-lg font-semibold tracking-wide">Event Management</div>

      <div className="relative">
        <div
          className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-sm font-bold cursor-pointer"
          onClick={() => setShowMenu((prev) => !prev)}
        >
          {initial}
        </div>

        {showMenu && (
          <div className="absolute right-0 mt-2 w-32 bg-white text-black rounded shadow z-50">
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}