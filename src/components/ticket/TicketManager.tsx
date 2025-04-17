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

const ticketTiers = ['Basic', 'VIP', 'Early Bird', 'Student', 'Other'];

export default function TicketManager({
  eventId,
  initialTicketTypes,
}: {
  eventId: number;
  initialTicketTypes: TicketType[];
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
    return ticketTypes.reduce((sum, tt) => {
      const sold = (tt.tickets ?? []).filter((t) => t.purchased).length;
      return sum + tt.price * sold;
    }, 0);
  }, [ticketTypes]);

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
    if (!confirm('Are you sure?')) return;
    const res = await fetch(`/api/organizers/${userId}/events/${eventId}/ticket-types/${id}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      setTicketTypes((prev) => prev.filter((tt) => tt.id !== id));
    } else {
      alert('Delete failed');
    }
  };

  const handleEdit = (tt: TicketType) => {
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
      (tt) =>
        tt.id !== editingId &&
        tt.name.toLowerCase() === editForm.name.trim().toLowerCase()
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
    <div className="bg-white border rounded p-4 shadow-sm mt-6">
      <h3 className="text-xl font-bold mb-4">🎟️ Ticket Types</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
        <select
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setNameError('');
          }}
          className="border rounded px-3 py-2 text-sm text-gray-700"
        >
          <option value="">Select Ticket Tier</option>
          {ticketTiers.map((tier) => (
            <option key={tier} value={tier}>
              {tier}
            </option>
          ))}
        </select>
        <Input placeholder="Price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
        <Input placeholder="Quantity" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
      </div>
      {nameError && <p className="text-red-500 text-sm mb-2">{nameError}</p>}

      <Button onClick={handleCreate} disabled={loading}>
        {loading ? 'Creating...' : 'Add Ticket Type'}
      </Button>

      <div className="text-gray-700 my-4">
        <p className="text-lg font-semibold">💰 Total Revenue: CA${totalRevenue.toFixed(2)}</p>
      </div>

      {ticketTypes.length === 0 ? (
        <p className="text-gray-500">No ticket types available.</p>
      ) : (
        <ul className="space-y-4">
          {ticketTypes.map((tt) => {
            const sold = (tt.tickets ?? []).filter((t) => t.purchased).length;
            const checkedIn = (tt.tickets ?? []).filter((t) => t.purchased && t.checkedIn).length;
            const percent = sold > 0 ? Math.round((checkedIn / sold) * 100) : 0;
            const remaining = tt.quantity - sold;

            return (
              <li key={tt.id} className="border rounded px-4 py-3">
                {editingId === tt.id ? (
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <select
                      value={editForm.name}
                      onChange={(e) => {
                        setEditForm({ ...editForm, name: e.target.value });
                        setEditNameError('');
                      }}
                      className="border rounded px-2 py-1 text-sm text-gray-700"
                    >
                      <option value="">Select Ticket Tier</option>
                      {ticketTiers.map((tier) => (
                        <option key={tier} value={tier}>
                          {tier}
                        </option>
                      ))}
                    </select>
                    <Input
                      value={editForm.price}
                      onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                    />
                    <Input
                      value={editForm.quantity}
                      onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
                    />
                    {editNameError && (
                      <p className="col-span-3 text-red-500 text-sm mt-1">{editNameError}</p>
                    )}
                    <div className="col-span-3 flex gap-2 mt-2">
                      <Button size="sm" onClick={handleSaveEdit}>
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingId(null);
                          setEditNameError('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <div>
                      <Link
                        href={`/dashboard/organizer/${userId}/events/${eventId}/tickets_type/${tt.id}`}
                        className="font-semibold underline hover:text-purple-600"
                      >
                        {tt.name}
                      </Link>
                      <p className="text-sm text-gray-500">
                        CA${tt.price.toFixed(2)} · {sold} sold / {tt.quantity} total · {remaining} left
                      </p>
                      <p className="text-sm text-green-600">
                        ✅ {checkedIn} checked-in / {sold} sold
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(tt)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(tt.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
                <Progress value={percent} className="h-2 mt-2" />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}