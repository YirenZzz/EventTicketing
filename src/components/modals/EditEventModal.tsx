'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';

export default function EditEventModal({
  open,
  onClose,
  event,
}: {
  open: boolean;
  onClose: () => void;
  event: any; // must include: id, name, description, startDate, endDate, organizerId
}) {
  const { data: session } = useSession();
  const [name, setName] = useState(event.name);
  const [description, setDescription] = useState(event.description || '');
  const [location, setLocation] = useState(event.location || '');
  const [startDate, setStartDate] = useState(event.startDate.slice(0, 16));
  const [endDate, setEndDate] = useState(event.endDate.slice(0, 16));
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!session?.user?.id) {
      alert('You are not logged in.');
      return;
    }

    const organizerId = session.user.id;

    setLoading(true);
    const res = await fetch(
      `/api/organizers/${organizerId}/events/${event.id}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          location,
          startDate,
          endDate,
        }),
      }
    );

    if (res.ok) {
      onClose();
      window.location.reload();
    } else {
      alert('Failed to update event');
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl w-full">
        <DialogHeader>
          <DialogTitle className="text-2xl">Edit Event</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Event Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>Description</Label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded border px-3 py-2"
              rows={4}
            />
          </div>
          <div>
            <Label>Location</Label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter location"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Date</Label>
              <Input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <Button
            onClick={handleUpdate}
            disabled={loading}
            className="w-full bg-purple-700 text-white"
          >
            {loading ? 'Updating...' : 'Update'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}