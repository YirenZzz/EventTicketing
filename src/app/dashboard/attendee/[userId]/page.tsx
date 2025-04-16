// src/app/dashboard/attendee/[userId]/page.tsx
import React from 'react';

export default function AttendeeDashboard({ params }: { params: { userId: string } }) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Welcome, Attendee #{params.userId}</h1>
      <p>This is your personalized dashboard.</p>
    </div>
  );
}