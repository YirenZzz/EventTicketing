"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AppShell from "@/components/layout/AppShell";

type Promo = {
  id: number;
  code: string;
  type: "percentage" | "fixed";
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
  event: {
    id: number;
    name: string;
    startDate?: string;
    endDate?: string;
  };
  promos: Promo[];
  ticketTypes: TicketType[];
};

type PromoForm = {
  code: string;
  type: "percentage" | "fixed";
  amount: string;
  ticketTypeId: string;
  maxUsage: string;
  startDate: string;
  endDate: string;
};

export default function OrganizerGroupedPromoPage() {
  const params = useParams();
  const userId = params.userId?.toString();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [data, setData] = useState<EventPromos[]>([]);
  const [filteredData, setFilteredData] = useState<EventPromos[]>([]);
  const [newPromoForms, setNewPromoForms] = useState<Record<number, PromoForm>>(
    {}
  );
  const [isCreating, setIsCreating] = useState<Record<number, boolean>>({});
  const [editingPromo, setEditingPromo] = useState<{
    eventId: number;
    promoId: number;
  } | null>(null);
  const [editForm, setEditForm] = useState<PromoForm | null>(null);
  const [loading, setLoading] = useState(true);

  // Get status from URL params or default to "UPCOMING"
  const status = searchParams.get("status") || "UPCOMING";

  useEffect(() => {
    if (!userId) return;
    fetchAllPromos();
  }, [userId]);

  // Apply filters when status or data changes
  useEffect(() => {
    if (data.length > 0) {
      filterData();
    }
  }, [status, data]);

  // Filter the data based on status
  const filterData = () => {
    let filtered = [...data];

    // Filter by status (UPCOMING or ENDED)
    if (status === "UPCOMING") {
      filtered = filtered.filter((item) => {
        // Check if event has not ended or has no end date
        const now = new Date();
        return !item.event.endDate || new Date(item.event.endDate) > now;
      });
    } else if (status === "ENDED") {
      filtered = filtered.filter((item) => {
        // Check if event has ended
        const now = new Date();
        return item.event.endDate && new Date(item.event.endDate) <= now;
      });
    }

    setFilteredData(filtered);
    setLoading(false);
  };

  // Update URL parameters when filters change
  const updateSearchParams = (key: string, value: string) => {
    const paramsObj = new URLSearchParams(searchParams.toString());
    paramsObj.set(key, value);
    // Use the current path instead of a hardcoded one to avoid 404 errors
    const currentPath = window.location.pathname;
    router.push(`${currentPath}?${paramsObj.toString()}`);
  };

  async function fetchAllPromos() {
    setLoading(true);
    const res = await fetch(`/api/organizers/${userId}/events`);
    const json = await res.json();
    const events = Array.isArray(json) ? json : (json.events ?? json.data);
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
          event: {
            id: evt.id,
            name: evt.name,
            startDate: evt.startDate,
            endDate: evt.endDate,
          },
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
        code: "",
        type: "percentage",
        amount: "",
        ticketTypeId: "",
        maxUsage: "",
        startDate: "",
        endDate: "",
      };
    });
    setNewPromoForms(form);
    setIsCreating(creation);
    setEditingPromo(null);
    setEditForm(null);
  }

  function handleInputChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    eventId: number
  ) {
    const { name, value } = e.target;
    setNewPromoForms((prev) => ({
      ...prev,
      [eventId]: { ...prev[eventId], [name]: value },
    }));
  }

  async function handleSave(eventId: number) {
    const form = newPromoForms[eventId];
    // Make sure we have at least the required fields before submitting
    if (!form.code || !form.amount) {
      alert("Code and amount are required fields");
      return;
    }

    try {
      const res = await fetch(
        `/api/organizers/${userId}/events/${eventId}/promos`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            // Ensure we're explicitly sending the eventId in the body as well
            eventId: eventId,
            // Make sure amount is a number
            amount: Number(form.amount),
            // Convert maxUsage to number if present
            maxUsage: form.maxUsage ? Number(form.maxUsage) : undefined,
            // Convert ticketTypeId to number if present
            ticketTypeId: form.ticketTypeId
              ? Number(form.ticketTypeId)
              : undefined,
          }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        console.error(
          "Error creating promo code:",
          errorData || res.statusText
        );
        alert("Failed to create promo code. See console for details.");
        return;
      }

      await fetchAllPromos();
    } catch (error) {
      console.error("Error creating promo code:", error);
      alert("An error occurred while creating the promo code");
    }
  }

  async function handleDelete(eventId: number, promoId: number) {
    if (!confirm("Confirm delete?")) return;
    const res = await fetch(
      `/api/organizers/${userId}/events/${eventId}/promos/${promoId}`,
      {
        method: "DELETE",
      }
    );
    if (!res.ok) return;
    await fetchAllPromos();
  }

  function handleEditStart(p: Promo, eventId: number) {
    setEditingPromo({ eventId, promoId: p.id });
    setEditForm({
      code: p.code,
      type: p.type,
      amount: String(p.amount),
      ticketTypeId: String(p.ticketType?.id ?? ""),
      maxUsage: p.maxUsage?.toString() ?? "",
      startDate: p.startDate?.slice(0, 16) ?? "",
      endDate: p.endDate?.slice(0, 16) ?? "",
    });
  }

  async function handleEditSave(eventId: number, promoId: number) {
    if (!editForm) return;
    const res = await fetch(
      `/api/organizers/${userId}/events/${eventId}/promos/${promoId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      }
    );
    if (!res.ok) return;
    await fetchAllPromos();
  }

  return (
    <AppShell>
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            🎁 Promo Codes by Event
          </h1>

          {/* Status filter buttons - black style, no bullets */}
          <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg shadow-sm">
            {["UPCOMING", "ENDED"].map((s) => (
              <Button
                key={s}
                variant={status === s ? "default" : "ghost"}
                size="sm"
                onClick={() => updateSearchParams("status", s)}
                className={
                  status === s
                    ? "bg-gray-900 hover:bg-black text-white"
                    : "text-gray-700 hover:text-gray-900"
                }
              >
                {s.charAt(0) + s.slice(1).toLowerCase()}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center p-12 bg-white rounded-lg shadow-sm">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-gray-800"></div>
            <p className="mt-4 text-gray-500">Loading events...</p>
          </div>
        ) : filteredData.length === 0 ? (
          <Card className="border-0 shadow-md rounded-lg bg-white">
            <CardContent className="pt-6">
              <div className="text-center p-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  No Events Found
                </h3>
                <p className="text-gray-500">
                  No {status.toLowerCase()} events with promo codes available.
                </p>
                <Button
                  variant="outline"
                  className="mt-6 border-gray-300 text-gray-700 hover:bg-gray-50"
                  onClick={fetchAllPromos}
                >
                  Refresh Events
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {filteredData.map(({ event, promos, ticketTypes }) => {
              const form = newPromoForms[event.id];
              const creating = isCreating[event.id];

              return (
                <Card
                  key={event.id}
                  className="border-0 shadow-md rounded-lg mb-8 overflow-hidden hover:shadow-lg transition-all"
                >
                  <CardHeader className="bg-white border-b py-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                      <div>
                        <CardTitle className="text-xl text-gray-800">
                          {event.name}
                        </CardTitle>
                        {event.startDate && (
                          <p className="text-sm text-gray-500 mt-1">
                            {format(new Date(event.startDate), "MMM d, yyyy")}
                            {event.endDate && (
                              <>
                                {" "}
                                -{" "}
                                {format(new Date(event.endDate), "MMM d, yyyy")}
                              </>
                            )}
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        className="bg-gray-900 hover:bg-black text-white"
                        onClick={() => {
                          if (!creating) {
                            setIsCreating((prev) => ({
                              ...prev,
                              [event.id]: true,
                            }));
                          }
                        }}
                      >
                        + New Promo Code
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-left">
                          <tr>
                            <th className="px-4 py-3 text-gray-600 font-medium">
                              Code
                            </th>
                            <th className="px-4 py-3 text-gray-600 font-medium">
                              Type
                            </th>
                            <th className="px-4 py-3 text-gray-600 font-medium">
                              Amount
                            </th>
                            <th className="px-4 py-3 text-gray-600 font-medium">
                              Applies To
                            </th>
                            <th className="px-4 py-3 text-gray-600 font-medium">
                              Usage
                            </th>
                            <th className="px-4 py-3 text-gray-600 font-medium">
                              Validity
                            </th>
                            <th className="px-4 py-3 text-gray-600 font-medium">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {promos.map((p) =>
                            editingPromo?.promoId === p.id &&
                            editingPromo.eventId === event.id &&
                            editForm ? (
                              <tr key={p.id} className="border-t bg-gray-50">
                                <td className="px-3 py-3">
                                  <input
                                    name="code"
                                    value={editForm.code}
                                    onChange={(e) =>
                                      setEditForm({
                                        ...editForm,
                                        code: e.target.value,
                                      })
                                    }
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none shadow-sm"
                                  />
                                </td>
                                <td className="px-3 py-3">
                                  <select
                                    name="type"
                                    value={editForm.type}
                                    onChange={(e) =>
                                      setEditForm({
                                        ...editForm,
                                        type: e.target.value as
                                          | "percentage"
                                          | "fixed",
                                      })
                                    }
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none shadow-sm"
                                  >
                                    <option value="percentage">
                                      Percentage
                                    </option>
                                    <option value="fixed">Fixed</option>
                                  </select>
                                </td>
                                <td className="px-3 py-3">
                                  <input
                                    name="amount"
                                    value={editForm.amount}
                                    onChange={(e) =>
                                      setEditForm({
                                        ...editForm,
                                        amount: e.target.value,
                                      })
                                    }
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none shadow-sm"
                                  />
                                </td>
                                <td className="px-3 py-3">
                                  <select
                                    name="ticketTypeId"
                                    value={editForm.ticketTypeId}
                                    onChange={(e) =>
                                      setEditForm({
                                        ...editForm,
                                        ticketTypeId: e.target.value,
                                      })
                                    }
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none shadow-sm"
                                  >
                                    <option value="">All</option>
                                    {ticketTypes.map((tt) => (
                                      <option key={tt.id} value={tt.id}>
                                        {tt.name}
                                      </option>
                                    ))}
                                  </select>
                                </td>
                                <td className="px-3 py-3">
                                  <input
                                    name="maxUsage"
                                    value={editForm.maxUsage}
                                    onChange={(e) =>
                                      setEditForm({
                                        ...editForm,
                                        maxUsage: e.target.value,
                                      })
                                    }
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none shadow-sm"
                                  />
                                </td>
                                <td className="px-3 py-3">
                                  <div className="flex flex-col gap-2">
                                    <input
                                      type="datetime-local"
                                      name="startDate"
                                      value={editForm.startDate}
                                      onChange={(e) =>
                                        setEditForm({
                                          ...editForm,
                                          startDate: e.target.value,
                                        })
                                      }
                                      className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none shadow-sm"
                                    />
                                    <input
                                      type="datetime-local"
                                      name="endDate"
                                      value={editForm.endDate}
                                      onChange={(e) =>
                                        setEditForm({
                                          ...editForm,
                                          endDate: e.target.value,
                                        })
                                      }
                                      className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none shadow-sm"
                                    />
                                  </div>
                                </td>
                                <td className="px-3 py-3">
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      className="bg-gray-900 hover:bg-black text-white"
                                      onClick={() =>
                                        handleEditSave(event.id, p.id)
                                      }
                                    >
                                      Save
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="border-gray-300"
                                      onClick={() => setEditingPromo(null)}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ) : (
                              <tr
                                key={p.id}
                                className="border-t hover:bg-gray-50 transition-colors duration-150"
                              >
                                <td className="px-4 py-3.5 font-medium">
                                  <span className="font-mono bg-gray-100 py-1 px-2 rounded text-sm border border-gray-200">
                                    {p.code}
                                  </span>
                                </td>
                                <td className="px-4 py-3.5 capitalize text-gray-700">
                                  {p.type}
                                </td>
                                <td className="px-4 py-3.5">
                                  <span
                                    className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                                      p.type === "percentage"
                                        ? "bg-green-100 text-green-800 ring-1 ring-green-200"
                                        : "bg-blue-100 text-blue-800 ring-1 ring-blue-200"
                                    }`}
                                  >
                                    {p.type === "percentage"
                                      ? `${p.amount}%`
                                      : `$${p.amount}`}
                                  </span>
                                </td>
                                <td className="px-4 py-3.5">
                                  {p.ticketType?.name ? (
                                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                      {p.ticketType.name}
                                    </span>
                                  ) : (
                                    <span className="text-gray-600">
                                      All Ticket Types
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-3.5">
                                  <span className="inline-flex items-center gap-1">
                                    <span className="font-medium">
                                      {p.usageCount}
                                    </span>
                                    {p.maxUsage ? (
                                      <span className="text-xs text-gray-500 bg-gray-100 px-1 py-0.5 rounded">
                                        / {p.maxUsage}
                                      </span>
                                    ) : (
                                      <span className="text-xs text-gray-500 italic ml-1">
                                        unlimited
                                      </span>
                                    )}
                                  </span>
                                </td>
                                <td className="px-4 py-3.5 text-gray-600">
                                  <div className="flex flex-col text-sm">
                                    <div className="flex items-center gap-1.5 mb-1">
                                      <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                                      <span className="font-medium">
                                        Start:
                                      </span>
                                      {p.startDate
                                        ? format(
                                            new Date(p.startDate),
                                            "MMM d, yyyy"
                                          )
                                        : "—"}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="w-2 h-2 rounded-full bg-gray-600"></span>
                                      <span className="font-medium">End:</span>
                                      {p.endDate
                                        ? format(
                                            new Date(p.endDate),
                                            "MMM d, yyyy"
                                          )
                                        : "—"}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3.5">
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                                      onClick={() =>
                                        handleEditStart(p, event.id)
                                      }
                                    >
                                      Edit
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                                      onClick={() =>
                                        handleDelete(event.id, p.id)
                                      }
                                    >
                                      Delete
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            )
                          )}

                          {creating && (
                            <tr className="bg-gray-50 border-t border-gray-200">
                              <td className="px-3 py-3">
                                <input
                                  name="code"
                                  value={form.code}
                                  placeholder="SPRING2025"
                                  onChange={(e) =>
                                    handleInputChange(e, event.id)
                                  }
                                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none font-mono shadow-sm"
                                />
                              </td>
                              <td className="px-3 py-3">
                                <select
                                  name="type"
                                  value={form.type}
                                  onChange={(e) =>
                                    handleInputChange(e, event.id)
                                  }
                                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none shadow-sm"
                                >
                                  <option value="percentage">Percentage</option>
                                  <option value="fixed">Fixed</option>
                                </select>
                              </td>
                              <td className="px-3 py-3">
                                <input
                                  name="amount"
                                  value={form.amount}
                                  placeholder="10"
                                  onChange={(e) =>
                                    handleInputChange(e, event.id)
                                  }
                                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none shadow-sm"
                                />
                              </td>
                              <td className="px-3 py-3">
                                <select
                                  name="ticketTypeId"
                                  value={form.ticketTypeId}
                                  onChange={(e) =>
                                    handleInputChange(e, event.id)
                                  }
                                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none shadow-sm"
                                >
                                  <option value="">All Ticket Types</option>
                                  {ticketTypes.map((tt) => (
                                    <option key={tt.id} value={tt.id}>
                                      {tt.name}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-3 py-3">
                                <input
                                  name="maxUsage"
                                  value={form.maxUsage}
                                  placeholder="100"
                                  onChange={(e) =>
                                    handleInputChange(e, event.id)
                                  }
                                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none shadow-sm"
                                />
                              </td>
                              <td className="px-3 py-3">
                                <div className="flex flex-col gap-2">
                                  <div className="relative">
                                    <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 font-medium">
                                      Start:
                                    </div>
                                    <input
                                      type="datetime-local"
                                      name="startDate"
                                      value={form.startDate}
                                      onChange={(e) =>
                                        handleInputChange(e, event.id)
                                      }
                                      className="w-full pl-14 pr-2 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none shadow-sm"
                                    />
                                  </div>
                                  <div className="relative">
                                    <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 font-medium">
                                      End:
                                    </div>
                                    <input
                                      type="datetime-local"
                                      name="endDate"
                                      value={form.endDate}
                                      onChange={(e) =>
                                        handleInputChange(e, event.id)
                                      }
                                      className="w-full pl-14 pr-2 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none shadow-sm"
                                    />
                                  </div>
                                </div>
                              </td>
                              <td className="px-3 py-3">
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    className="bg-gray-900 hover:bg-black text-white"
                                    onClick={() => handleSave(event.id)}
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-gray-300"
                                    onClick={() =>
                                      setIsCreating((p) => ({
                                        ...p,
                                        [event.id]: false,
                                      }))
                                    }
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
