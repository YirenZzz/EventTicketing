'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

type Ticket = {
  id: number;
  purchased: boolean;
  checkedIn: boolean;
};

type TicketType = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  tickets: Ticket[];
};

type PurchasedTicket = {
  id: number;
  finalPrice: number;
};

const ticketTiers = ['Basic', 'VIP', 'Early Bird', 'Student', 'Other'];

export default function TicketManager({
  eventId,
  initialTicketTypes,
  purchasedTickets,
}: {
  eventId: number;
  initialTicketTypes: TicketType[];
  purchasedTickets: PurchasedTicket[];
}) {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [ticketTypes, setTicketTypes] = useState<TicketType[]>(initialTicketTypes);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState('');
  const [editNameError, setEditNameError] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ name: '', price: '', quantity: '' });

  const totalRevenue = useMemo(() => {
    return purchasedTickets.reduce((sum, pt) => sum + pt.finalPrice, 0);
  }, [purchasedTickets]);

  if (!userId) return <p className="text-gray-500">Loading user session...</p>;

  const validateInput = (n: string, p: string, q: string) => {
    if (!n || !p || !q) return 'All fields are required.';
    const priceVal = parseFloat(p);
    const qtyVal = parseInt(q);
    if (isNaN(priceVal) || isNaN(qtyVal)) return 'Price and quantity must be numbers.';
    if (priceVal < 0) return 'Price must be non-negative.';
    if (qtyVal <= 0) return 'Quantity must be greater than 0.';
    return '';
  };

  const handleCreate = async () => {
    const error = validateInput(name, price, quantity);
    if (error) {
      setNameError(error);
      return;
    }

    const isDuplicate = ticketTypes.some(
      (tt) => tt.name.toLowerCase() === name.toLowerCase()
    );
    if (isDuplicate) {
      setNameError('Ticket type already exists.');
      return;
    }

    setLoading(true);
    setNameError('');

    try {
      const res = await fetch(`/api/organizers/${userId}/events/${eventId}/ticket-types`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          price: parseFloat(price),
          quantity: parseInt(quantity),
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const { ticketType } = await res.json();
      setTicketTypes((prev) => [...prev, ticketType]);
      setName('');
      setPrice('');
      setQuantity('');
    } catch {
      setNameError('Create failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this ticket type?')) return;
    try {
      const res = await fetch(
        `/api/organizers/${userId}/events/${eventId}/ticket-types/${id}`,
        { method: 'DELETE' }
      );
      const result = await res.json();
      if (!res.ok) {
        alert(result?.error ?? 'Delete failed');
        return;
      }
      setTicketTypes((prev) => prev.filter((tt) => tt.id !== id));
    } catch {
      alert('An unexpected error occurred while deleting.');
    }
  };

  const handleEdit = (tt: TicketType) => {
    const sold = (tt.tickets ?? []).filter((t) => t.purchased).length;
    if (sold > 0) {
      alert('This ticket type has already been sold and cannot be edited.');
      return;
    }
    setEditingId(tt.id);
    setEditForm({
      name: tt.name,
      price: tt.price.toString(),
      quantity: tt.quantity.toString(),
    });
    setEditNameError('');
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    const error = validateInput(editForm.name, editForm.price, editForm.quantity);
    if (error) {
      setEditNameError(error);
      return;
    }

    const isDuplicate = ticketTypes.some(
      (tt) => tt.id !== editingId && tt.name.toLowerCase() === editForm.name.toLowerCase()
    );
    if (isDuplicate) {
      setEditNameError('Ticket type already exists.');
      return;
    }

    const res = await fetch(`/api/organizers/${userId}/events/${eventId}/ticket-types/${editingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: editForm.name,
        price: parseFloat(editForm.price),
        quantity: parseInt(editForm.quantity),
      }),
    });

    if (!res.ok) return alert('Update failed');
    const { ticketType } = await res.json();
    setTicketTypes((prev) => prev.map((tt) => (tt.id === ticketType.id ? ticketType : tt)));
    setEditingId(null);
    setEditNameError('');
  };

  return (
    <div className="bg-white border rounded p-6 shadow-sm mt-6 space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-800">🎟️ Ticket Types</h3>
        <p className="text-sm text-gray-700 font-medium">
          💰 Total Revenue: <span className="text-purple-700">CA${totalRevenue.toFixed(2)}</span>
        </p>
      </div>

      {/* Create Form */}
      <div className="bg-gray-50 p-4 rounded border">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Add New Ticket Type</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setNameError('');
            }}
            className="border rounded px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Select Tier</option>
            {ticketTiers.map((tier) => (
              <option key={tier} value={tier}>{tier}</option>
            ))}
          </select>
          <Input placeholder="Price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
          <Input placeholder="Quantity" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        </div>
        {nameError && <p className="text-red-500 text-sm mt-2">{nameError}</p>}
        <Button className="mt-4" onClick={handleCreate} disabled={loading}>
          {loading ? 'Creating...' : 'Add Ticket Type'}
        </Button>
      </div>

      {/* Ticket List */}
      <div className="space-y-4">
        {ticketTypes.length === 0 ? (
          <p className="text-gray-500">No ticket types available.</p>
        ) : (
          ticketTypes.map((tt) => {
            const sold = tt.tickets.filter((t) => t.purchased).length;
            const checkedIn = tt.tickets.filter((t) => t.purchased && t.checkedIn).length;
            const percent = sold > 0 ? Math.round((checkedIn / sold) * 100) : 0;
            const remaining = tt.quantity - sold;

            return (
              <div key={tt.id} className="border rounded px-4 py-3 shadow-sm bg-white">
                {editingId === tt.id ? (
                  <>
                    <div className="grid grid-cols-3 gap-2">
                      <select
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="border rounded px-2 py-1 text-sm text-gray-700"
                      >
                        <option value="">Select Tier</option>
                        {ticketTiers.map((tier) => (
                          <option key={tier} value={tier}>{tier}</option>
                        ))}
                      </select>
                      <Input value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} />
                      <Input value={editForm.quantity} onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })} />
                    </div>
                    {editNameError && <p className="text-red-500 text-sm mt-1">{editNameError}</p>}
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" onClick={handleSaveEdit}>Save</Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between items-center">
                    <div>
                      <Link
                        href={`/dashboard/organizer/${userId}/events/${eventId}/tickets_type/${tt.id}`}
                        className="text-lg font-semibold underline text-purple-700"
                      >
                        {tt.name}
                      </Link>
                      <p className="text-sm text-gray-600">
                        CA${tt.price.toFixed(2)} · {sold} sold / {tt.quantity} total · {remaining} left
                      </p>
                      <p className="text-sm text-green-600">
                        ✅ {checkedIn} checked-in / {sold} sold
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(tt)}>Edit</Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(tt.id)}>Delete</Button>
                    </div>
                  </div>
                )}
                <Progress value={percent} className="h-2 mt-2 rounded bg-gray-200" />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}