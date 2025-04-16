'use client';

import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import { Button } from '@/components/ui/button';


ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function EventReport({
  eventId,
  userId,
}: {
  eventId: number;
  userId: string;
}) {
  const [summary, setSummary] = useState<{
    totalTickets: number;
    soldTickets: number;
    checkedIn: number;
  } | null>(null);

  const [checkinStats, setCheckinStats] = useState<
    { ticketTypeId: number; name: string; total: number; sold: number; checkedIn: number }[]
  >([]);

  const [eventAttendanceRates, setEventAttendanceRates] = useState<
    { eventId: number; name: string; attendanceRate: number }[]
  >([]);

  useEffect(() => {
    async function fetchData() {
      const res1 = await fetch(`/api/organizers/${userId}/events/${eventId}/summary`);
      // const res2 = await fetch(`/api/organizers/${userId}/events/${eventId}/checkin-summary`);
      const res3 = await fetch(`/api/organizers/${userId}/events`);

      if (res1.ok) {
        const data = await res1.json();
        setSummary(data);
      }

      // if (res2.ok) {
      //   const { stats } = await res2.json();
      //   setCheckinStats(stats);
      // }

      if (res3.ok) {
        const { events } = await res3.json();
        const rates = events.map((e: any) => {
          const attendanceRate =
            e.totalTickets > 0 ? (e.checkedIn / e.totalTickets) * 100 : 0;
          return {
            eventId: e.id,
            name: e.name,
            attendanceRate: parseFloat(attendanceRate.toFixed(1)),
          };
        });
        setEventAttendanceRates(rates);
      }
    }

    fetchData();
  }, [userId, eventId]);

  const downloadCSV = () => {
    const rows = [
      ['Ticket Type', 'Total', 'Sold', 'Checked-In'],
      ...checkinStats.map((s) => [s.name, s.total, s.sold, s.checkedIn]),
    ];

    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `checkin_stats_event_${eventId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!summary) return <p className="text-gray-500">Loading report...</p>;

  return (
    <div className="space-y-10">
      {/* Overall Attendance Rate by Event */}
      <div className="border rounded p-6 bg-gray-50 space-y-4">
        <h3 className="text-lg font-semibold">Attendance Rate by Event</h3>
        {eventAttendanceRates.length === 0 ? (
          <p className="text-sm text-gray-500">No event attendance data.</p>
        ) : (
          <div className="max-w-2xl">
            <Bar
              data={{
                labels: eventAttendanceRates.map((e) => e.name),
                datasets: [
                  {
                    label: 'Attendance Rate (%)',
                    data: eventAttendanceRates.map((e) => e.attendanceRate),
                    backgroundColor: '#6366F1',
                    borderRadius: 6,
                  },
                ],
              }}
              options={{
                indexAxis: 'y',
                scales: {
                  x: {
                    min: 0,
                    max: 100,
                    ticks: {
                      callback: (v) => `${v}%`,
                      font: { size: 14 },
                      color: '#4B5563',
                    },
                    grid: { color: '#E5E7EB' },
                  },
                  y: {
                    ticks: { font: { size: 14 }, color: '#6B7280' },
                    grid: { display: false },
                  },
                },
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      label: (ctx) => `${ctx.raw}%`,
                    },
                  },
                },
              }}
            />
          </div>
        )}
      </div>

      {/* Selected Event Details */}
      <div className="border rounded p-6 bg-gray-50 space-y-6">
      <div className="w-64">
              <Select
                value={selectedEventId?.toString()}
                onValueChange={(value) => setSelectedEventId(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select event" />
                </SelectTrigger>
                <SelectContent>
                  {eventList.map((event) => (
                    <SelectItem key={event.id} value={event.id.toString()}>
                      {event.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
        
        {/* Summary Text */}
        <div className="space-y-1 text-base text-gray-800">
          <p><strong>Total Tickets:</strong> {summary.totalTickets}</p>
          <p><strong>Sold Tickets:</strong> {summary.soldTickets}</p>
          <p><strong>Checked-In:</strong> {summary.checkedIn}</p>
        </div>
        
        {/* Summary Chart */}
        <div className="mt-6 max-w-md">
          <Bar
            data={{
              labels: ['Total', 'Sold', 'Checked-In'],
              datasets: [
                {
                  label: 'Tickets',
                  data: [summary.totalTickets, summary.soldTickets, summary.checkedIn],
                  backgroundColor: ['#7C3AED99', '#22C55E99', '#3B82F699'],
                  borderColor: ['#7C3AED', '#22C55E', '#3B82F6'],
                  borderWidth: 1,
                  borderRadius: 8,
                  barPercentage: 0.5,
                  categoryPercentage: 0.6,
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: {
                x: {
                  ticks: { font: { size: 14 }, color: '#4B5563' },
                  grid: { display: false },
                },
                y: {
                  beginAtZero: true,
                  ticks: { font: { size: 14 }, color: '#6B7280' },
                  grid: { color: '#E5E7EB' },
                },
              },
            }}
          />
        </div>

        {/* Check-In by Ticket Type */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Check-in Stats by Ticket Type</h3>
            <Button size="sm" onClick={downloadCSV}>Export CSV</Button>
          </div>

          {checkinStats.length === 0 ? (
            <p className="text-sm text-gray-500">No ticket type data available.</p>
          ) : (
            checkinStats.map((s) => (
              <div key={s.ticketTypeId} className="p-4 bg-white border rounded shadow-sm">
                <p className="font-semibold text-purple-700">{s.name}</p>
                <p className="text-sm text-gray-600">
                  Total: {s.total} | Sold: {s.sold} | Checked-In: {s.checkedIn}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}