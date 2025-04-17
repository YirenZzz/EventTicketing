import { Bell, Menu, Search, Settings, User } from 'lucide-react';

interface TopbarProps {
  toggleSidebar: () => void;
}

export default function Topbar({ toggleSidebar }: TopbarProps) {
  return (
    <header className="bg-white shadow-sm h-16 flex items-center justify-between px-4 lg:px-6">
      {/* Mobile menu button */}
      <button
        onClick={toggleSidebar}
        className="p-2 rounded-md lg:hidden text-gray-600 hover:bg-gray-100"
      >
        <Menu className="h-6 w-6" />
      </button>
      {/* Search bar */}
      <div className="relative max-w-md w-full mx-4 hidden md:block">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
          type="text"
          placeholder="Search..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>
      {/* Right side icons */}
      <div className="flex items-center space-x-4">
        <button className="p-1 rounded-full text-gray-600 hover:bg-gray-100">
          <Bell className="h-6 w-6" />
        </button>
        <button className="p-1 rounded-full text-gray-600 hover:bg-gray-100">
          <Settings className="h-6 w-6" />
        </button>
        <div className="h-8 w-8 rounded-full bg-purple-700 flex items-center justify-center text-white">
          <User className="h-5 w-5" />
        </div>
      </div>
    </header>
  );
}