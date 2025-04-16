// src/app/dashboard/staff/[userId]/page.tsx
export default function StaffDashboard({ params }: { params: { userId: string } }) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">Welcome, Staff #{params.userId}</h1>
      </div>
    );
  }