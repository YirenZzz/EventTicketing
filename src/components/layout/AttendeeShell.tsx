import { useState } from 'react';
import { ReactNode } from 'react';
import Topbar from './Topbar';
import Sidebar from './Sidebar';

export default function AttendeeShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  return (
    <div className="flex min-h-screen">
      <div className={`${sidebarOpen ? 'block' : 'hidden'} lg:block`}>
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col">
        <Topbar toggleSidebar={toggleSidebar} />
        <main className="flex-1 bg-gray-50 p-10 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}