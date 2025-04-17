'use client';

import { useSession } from 'next-auth/react';
import AppShell from '@/components/layout/AppShell';

export default function AttendeeDashboardPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  
  if (status === 'loading') {
    return (
      <AppShell>
        <div className="flex justify-center p-6">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-purple-700 border-t-transparent"></div>
        </div>
      </AppShell>
    );
  }
  
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Attendee Dashboard</h1>
          <p className="text-gray-500">
            Welcome back, {session?.user?.name || 'User'}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium mb-2">Your Events</h2>
            <p className="text-3xl font-bold">0</p>
            <p className="text-sm text-gray-500 mt-2">No events registered yet</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium mb-2">Tickets</h2>
            <p className="text-3xl font-bold">0</p>
            <p className="text-sm text-gray-500 mt-2">No tickets purchased yet</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium mb-2">Upcoming Events</h2>
            <p className="text-3xl font-bold">0</p>
            <p className="text-sm text-gray-500 mt-2">No upcoming events</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              className="p-4 border border-purple-200 rounded-md hover:bg-purple-50 flex items-center"
              onClick={() => window.location.href = '/activity'}
            >
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="font-medium">Explore Events</h3>
                <p className="text-sm text-gray-500">Find and register for upcoming events</p>
              </div>
            </button>
            
            <button 
              className="p-4 border border-purple-200 rounded-md hover:bg-purple-50 flex items-center"
              onClick={() => window.location.href = '/registration'}
            >
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="font-medium">My Registrations</h3>
                <p className="text-sm text-gray-500">View your event registrations and tickets</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}