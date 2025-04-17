'use client';

import { use, useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import AppShell from '@/components/layout/AppShell';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function OrganizerReportPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = use(params);

  const [eventList, setEventList] = useState<{ id: number; name: string }[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
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
  const [eventRevenues, setEventRevenues] = useState<
    { eventId: number; name: string; totalRevenue: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchAll() {
      try {
        const res = await fetch(`/api/organizers/${userId}/events`);
        if (!res.ok) throw new Error('Failed to fetch events');
        const data = await res.json();
        const events = data.data || [];

        setEventList(events.map((e: any) => ({ id: e.id, name: e.name })));
        if (events.length > 0) setSelectedEventId(events[0].id);

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

        const revenues = events.map((e: any) => {
          const revenue = (e.ticketTypes || []).reduce((sum: number, tt: any) => {
            const sold = (tt.tickets || []).filter((t: any) => t.purchased).length;
            return sum + (tt.price || 0) * sold;
          }, 0);
          return {
            eventId: e.id,
            name: e.name,
            totalRevenue: revenue,
          };
        });
        setEventRevenues(revenues);
      } catch (err) {
        console.error(err);
        setError('Unable to load event data');
        setEventList([]);
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, [userId]);

  useEffect(() => {
    async function fetchDetails() {
      if (!selectedEventId) return;

      const res1 = await fetch(`/api/organizers/${userId}/events/${selectedEventId}/summary`);
      if (res1.ok) {
        const data = await res1.json();
        setSummary(data);
      }
    }

    fetchDetails();
  }, [userId, selectedEventId]);

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
    a.download = `checkin_stats_event_${selectedEventId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppShell>
      <div className="p-6 space-y-10">
        <h1 className="text-2xl font-bold">📊 Event Report</h1>

        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <>
            {/* Attendance Rate for All Events */}
            <div className="border rounded p-6 bg-gray-50 space-y-4">
              <h3 className="text-lg font-semibold">Attendance Rate by Event</h3>
              {eventAttendanceRates.length === 0 ? (
                <p className="text-sm text-gray-500">No data available.</p>
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
            
            {/* Total Revenue by Event */}
<div className="border rounded p-6 bg-gray-50 space-y-4">
  <h3 className="text-lg font-semibold">Total Revenue by Event</h3>
  {eventRevenues.length === 0 ? (
    <p className="text-sm text-gray-500">No data available.</p>
  ) : (
    <div className="max-w-2xl">
      <Bar
        data={{
          labels: eventRevenues.map((e) => e.name),
          datasets: [
            {
              label: 'Total Revenue (CAD)',
              data: eventRevenues.map((e) => e.totalRevenue),
              backgroundColor: '#F2AE4E',
              borderRadius: 6,
            },
          ],
        }}
        options={{
          indexAxis: 'y',
          scales: {
            x: {
              beginAtZero: true,
              ticks: {
                callback: (v) => `$${v}`,
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
                label: (ctx) => `$${ctx.raw}`,
              },
            },
          },
        }}
      />
    </div>
  )}
</div>

            {/* Selected Event Section */}
            {summary && (
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

                {/* Summary text */}
                <div className="space-y-1 text-base text-gray-800">
                  <p><strong>Total Tickets:</strong> {summary.totalTickets}</p>
                  <p><strong>Sold Tickets:</strong> {summary.soldTickets}</p>
                  <p><strong>Checked-In:</strong> {summary.checkedIn}</p>
                </div>

                {/* Bar Chart */}
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

                {/* TicketType Breakdown */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Check-in Stats by Ticket Type</h3>
                    <Button size="sm" onClick={downloadCSV}>Export CSV</Button>
                  </div>

                  {checkinStats.length === 0 ? (
                    <p className="text-sm text-gray-500">No ticket type data.</p>
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
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}