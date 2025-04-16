'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import AppShell from '@/components/layout/AppShell';

type Promo = {
  id: number;
  code: string;
  type: 'percentage' | 'fixed';
  amount: number;
  usageCount: number;
  maxUsage?: number;
  startDate?: string;
  endDate?: string;
  ticketType?: { id: number; name: string };
};

type TicketType = {
  id: number;
  name: string;
};

type EventPromos = {
  event: { id: number; name: string };
  promos: Promo[];
  ticketTypes: TicketType[];
};

type PromoForm = {
  code: string;
  type: 'percentage' | 'fixed';
  amount: string;
  ticketTypeId: string;
  maxUsage: string;
  startDate: string;
  endDate: string;
};

export default function OrganizerGroupedPromoPage() {
  const params = useParams();
  const userId = params.userId?.toString();

  const [data, setData] = useState<EventPromos[]>([]);
  const [newPromoForms, setNewPromoForms] = useState<Record<number, PromoForm>>({});
  const [isCreating, setIsCreating] = useState<Record<number, boolean>>({});
  const [editingPromo, setEditingPromo] = useState<{ eventId: number; promoId: number } | null>(null);
  const [editForm, setEditForm] = useState<PromoForm | null>(null);

  useEffect(() => {
    if (!userId) return;
    fetchAllPromos();
  }, [userId]);

  async function fetchAllPromos() {
    const res = await fetch(`/api/organizers/${userId}/events`);
    const json = await res.json();
    const events = Array.isArray(json) ? json : json.events ?? json.data;
    if (!Array.isArray(events)) return;

    const results = await Promise.all(
      events.map(async (evt: any) => {
        const [promoRes, ticketTypeRes] = await Promise.all([
          fetch(`/api/organizers/${userId}/events/${evt.id}/promos`),
          fetch(`/api/organizers/${userId}/events/${evt.id}/ticket-types`),
        ]);
        const promos = await promoRes.json();
        const ticketTypesData = await ticketTypeRes.json();
        return {
          event: { id: evt.id, name: evt.name },
          promos,
          ticketTypes: ticketTypesData.ticketTypes ?? [],
        };
      })
    );

    setData(results);
    const creation: Record<number, boolean> = {};
    const form: Record<number, PromoForm> = {};
    results.forEach(({ event }) => {
      creation[event.id] = false;
      form[event.id] = {
        code: '',
        type: 'percentage',
        amount: '',
        ticketTypeId: '',
        maxUsage: '',
        startDate: '',
        endDate: '',
      };
    });
    setNewPromoForms(form);
    setIsCreating(creation);
    setEditingPromo(null);
    setEditForm(null);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, eventId: number) {
    const { name, value } = e.target;
    setNewPromoForms((prev) => ({ ...prev, [eventId]: { ...prev[eventId], [name]: value } }));
  }

  async function handleSave(eventId: number) {
    const form = newPromoForms[eventId];
    const res = await fetch(`/api/organizers/${userId}/events/${eventId}/promos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (!res.ok) return;
    await fetchAllPromos();
  }

  async function handleDelete(eventId: number, promoId: number) {
    if (!confirm('Confirm delete?')) return;
    const res = await fetch(`/api/organizers/${userId}/events/${eventId}/promos/${promoId}`, {
      method: 'DELETE',
    });
    if (!res.ok) return;
    await fetchAllPromos();
  }

  function handleEditStart(p: Promo, eventId: number) {
    setEditingPromo({ eventId, promoId: p.id });
    setEditForm({
      code: p.code,
      type: p.type,
      amount: String(p.amount),
      ticketTypeId: String(p.ticketType?.id ?? ''),
      maxUsage: p.maxUsage?.toString() ?? '',
      startDate: p.startDate?.slice(0, 16) ?? '',
      endDate: p.endDate?.slice(0, 16) ?? '',
    });
  }

  async function handleEditSave(eventId: number, promoId: number) {
    if (!editForm) return;
    const res = await fetch(`/api/organizers/${userId}/events/${eventId}/promos/${promoId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    });
    if (!res.ok) return;
    await fetchAllPromos();
  }

  return (
    <AppShell>
      <div className="p-6 space-y-10">
        <h1 className="text-2xl font-bold">🎁 Promo Codes by Event</h1>
        {data.map(({ event, promos, ticketTypes }) => {
          const form = newPromoForms[event.id];
          const creating = isCreating[event.id];

          return (
            <div key={event.id} className="border rounded p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Event: {event.name}</h2>
                <Button
                  size="sm"
                  onClick={() => {
                    if (!creating) {
                      setIsCreating((prev) => ({ ...prev, [event.id]: true }));
                    }
                  }}
                >
                  + New Promo Code
                </Button>
              </div>

              <table className="w-full border text-sm table-fixed">
                <thead className="bg-gray-100 text-left">
                  <tr>
                    <th className="px-4 py-2 w-[60px]">Code</th>
                    <th className="px-4 py-2 w-[60px]">Type</th>
                    <th className="px-4 py-2 w-[60px]">Amount</th>
                    <th className="px-4 py-2 w-[100px]">Applies To</th>
                    <th className="px-4 py-2 w-[80px]">Usage</th>
                    <th className="px-4 py-2 w-[200px]">Validity</th>
                    <th className="px-4 py-2 w-[100px]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {promos.map((p) =>
                    editingPromo?.promoId === p.id && editingPromo.eventId === event.id && editForm ? (
                      <tr key={p.id} className="border-t">
                        <td className="px-2 py-1"><input name="code" value={editForm.code} onChange={(e) => setEditForm({ ...editForm, code: e.target.value })} className="w-full border border-grey-400 rounded" /></td>
                        <td className="px-2 py-1">
                          <select name="type" value={editForm.type} onChange={(e) => setEditForm({ ...editForm, type: e.target.value as 'percentage' | 'fixed' })} className="border border-grey-400 rounded">
                            <option value="percentage">Percentage</option>
                            <option value="fixed">Fixed</option>
                          </select>
                        </td>
                        <td className="px-2 py-1"><input name="amount" value={editForm.amount} onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })} className="w-full border border-grey-400 rounded" /></td>
                        <td className="px-2 py-1">
                          <select name="ticketTypeId" value={editForm.ticketTypeId} onChange={(e) => setEditForm({ ...editForm, ticketTypeId: e.target.value })} className="w-full border border-grey-400 rounded">
                            <option value="">All</option>
                            {ticketTypes.map((tt) => <option key={tt.id} value={tt.id}>{tt.name}</option>)}
                          </select>
                        </td>
                        <td className="px-2 py-1"><input name="maxUsage" value={editForm.maxUsage} onChange={(e) => setEditForm({ ...editForm, maxUsage: e.target.value })} className="w-full border border-grey-400 rounded" /></td>
                        <td className="px-2 py-1">
                          <div className="flex flex-col gap-1">
                            <input type="datetime-local" name="startDate" value={editForm.startDate} onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })} />
                            <input type="datetime-local" name="endDate" value={editForm.endDate} onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })} />
                          </div>
                        </td>
                        <td className="px-2 py-1 space-x-1">
                          <Button size="sm" onClick={() => handleEditSave(event.id, p.id)}>Save</Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingPromo(null)}>Cancel</Button>
                        </td>
                      </tr>
                    ) : (
                      <tr key={p.id} className="border-t">
                        <td className="px-4 py-2">{p.code}</td>
                        <td className="px-4 py-2 capitalize">{p.type}</td>
                        <td className="px-4 py-2">{p.type === 'percentage' ? `${p.amount}%` : `$${p.amount}`}</td>
                        <td className="px-4 py-2">{p.ticketType?.name || 'All Ticket Types'}</td>
                        <td className="px-4 py-2">{p.usageCount}{p.maxUsage ? ` / ${p.maxUsage}` : ''}</td>
                        <td className="px-4 py-2">{p.startDate ? format(new Date(p.startDate), 'yyyy-MM-dd HH:mm') : '—'} – {p.endDate ? format(new Date(p.endDate), 'yyyy-MM-dd HH:mm') : '—'}</td>
                        <td className="px-4 py-2 space-x-1">
                          <Button size="sm" variant="outline" onClick={() => handleEditStart(p, event.id)}>Edit</Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(event.id, p.id)}>Delete</Button>
                        </td>
                      </tr>
                    )
                  )}

                  {creating && (
                    <tr>
                      <td className="px-2 py-1"><input name="code" value={form.code} onChange={(e) => handleInputChange(e, event.id)} className="w-full border border-grey-400 rounded" /></td>
                      <td className="px-2 py-1">
                        <select name="type" value={form.type} onChange={(e) => handleInputChange(e, event.id)} className="border border-grey-400 rounded" >
                          <option value="percentage">Percentage</option>
                          <option value="fixed">Fixed</option>
                        </select>
                      </td>
                      <td className="px-2 py-1"><input name="amount" value={form.amount} onChange={(e) => handleInputChange(e, event.id)} className="w-full border border-grey-400 rounded"/></td>
                      <td className="px-2 py-1">
                        <select name="ticketTypeId" value={form.ticketTypeId} onChange={(e) => handleInputChange(e, event.id)} className="w-full border border-grey-400 rounded">
                          <option value="">All</option>
                          {ticketTypes.map((tt) => <option key={tt.id} value={tt.id}>{tt.name}</option>)}
                        </select>
                      </td>
                      <td className="px-2 py-1"><input name="maxUsage" value={form.maxUsage} onChange={(e) => handleInputChange(e, event.id)} className="w-full border border-grey-400 rounded"/></td>
                      <td className="px-2 py-1 flex flex-col gap-1">
                        <input type="datetime-local" name="startDate" value={form.startDate} onChange={(e) => handleInputChange(e, event.id)} />
                        <input type="datetime-local" name="endDate" value={form.endDate} onChange={(e) => handleInputChange(e, event.id)} />
                      </td>
                      <td className="px-2 py-1 space-x-1">
                        <Button size="sm" onClick={() => handleSave(event.id)}>Save</Button>
                        <Button size="sm" variant="outline" onClick={() => setIsCreating((p) => ({ ...p, [event.id]: false }))}>Cancel</Button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}