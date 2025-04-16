import Topbar from './Topbar';
import Sidebar from './Sidebar';
import { ReactNode } from 'react';

export function OrganizerShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 bg-gray-50 p-10 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}