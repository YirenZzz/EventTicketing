'use client';

import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';

export default function CheckInStats({ eventId }: { eventId: string }) {
  const [total, setTotal] = useState(0);
  const [checked, setChecked] = useState(0);

  useEffect(() => {
    fetch(`/api/events/${eventId}/checkin-summary`)
      .then((res) => res.json())
      .then((data) => {
        setTotal(data.total);
        setChecked(data.checked);
      });
  }, [eventId]);

  const percent = total > 0 ? Math.round((checked / total) * 100) : 0;

  return (
    <div className="bg-white border rounded p-4 shadow-sm">
      <h3 className="text-lg font-bold mb-2">🟢 Real-Time Check-In</h3>
      <p className="text-sm text-gray-600 mb-2">
        {checked} of {total} attendees checked in ({percent}%)
      </p>
      <Progress value={percent} className="h-2" />
    </div>
  );
}