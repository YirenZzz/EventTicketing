"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import io from "socket.io-client";
import AppShell from "@/components/layout/AppShell";
import {
  Ticket,
  Tag,
  Calendar,
  User,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  RefreshCw,
  Filter,
  PieChart,
} from "lucide-react";

let socket: ReturnType<typeof io> | null = null;

export default function TicketTypeLivePage() {
  const { userId, eventId, ticketTypeId } = useParams() as {
    userId: string;
    eventId: string;
    ticketTypeId: string;
  };

  const [ticketType, setTicketType] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [filterStatus, setFilterStatus] = useState<
    "all" | "purchased" | "available"
  >("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchTicketType = async () => {
    setIsRefreshing(true);
    const res = await fetch(
      `/api/organizers/${userId}/events/${eventId}/ticket-types/${ticketTypeId}`,
      { cache: "no-store" }
    );
    if (!res.ok) {
      setIsRefreshing(false);
      return;
    }
    const { ticketType } = await res.json();
    setTicketType(ticketType);
    setLoading(false);
    setLastUpdated(new Date());
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchTicketType();
  }, [userId, eventId, ticketTypeId]);

  // Listen for ticketPurchased event
  useEffect(() => {
    if (!socket) {
      socket = io("/", { path: "/api/socket_io" });
    }

    const handler = (payload: { ticketTypeId: number }) => {
      if (payload.ticketTypeId === Number(ticketTypeId)) {
        fetchTicketType();
      }
    };

    socket.on("ticketPurchased", handler);
    return () => socket?.off("ticketPurchased", handler);
  }, [ticketTypeId]);

  // Loading state with skeleton UI
  if (loading) {
    return (
      <AppShell>
        <div className="max-w-6xl mx-auto p-6">
          <div className="animate-pulse">
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <div className="h-7 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-md p-4">
                  <div className="h-5 bg-gray-200 rounded w-1/2 mb-3"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!ticketType) {
    return (
      <AppShell>
        <div className="max-w-6xl mx-auto p-6 text-center">
          <div className="bg-white rounded-xl shadow-md p-8">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Ticket Type Not Found</h2>
            <p className="text-gray-600 mb-6">
              Unable to load the requested ticket type information.
            </p>
            <button
              onClick={fetchTicketType}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition shadow-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  // Calculate statistics
  const totalTickets = ticketType.quantity;
  const soldTickets = ticketType.tickets.filter(
    (t: any) => !!t.purchasedTicket
  ).length;
  const availableTickets = totalTickets - soldTickets;
  const checkedInTickets = ticketType.tickets.filter(
    (t: any) => t.checkedIn
  ).length;

  // Filter and search tickets
  const filteredTickets = ticketType.tickets.filter((t: any) => {
    // Filter by status
    if (filterStatus === "purchased" && !t.purchasedTicket) return false;
    if (filterStatus === "available" && t.purchasedTicket) return false;

    // Search by code or purchaser name
    if (searchTerm) {
      const code = t.code.toLowerCase();
      const name = t.purchasedTicket?.user?.name?.toLowerCase() || "";
      return (
        code.includes(searchTerm.toLowerCase()) ||
        name.includes(searchTerm.toLowerCase())
      );
    }

    return true;
  });

  const handleRefresh = () => {
    fetchTicketType();
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        {/* Header Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center mb-2 sm:mb-0">
                <Tag className="h-5 w-5 mr-2" />
                <h1 className="text-xl font-bold">{ticketType.name}</h1>
              </div>
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{ticketType.event.name}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-4">
            <div className="p-3 text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Total Tickets
              </p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {totalTickets}
              </p>
            </div>

            <div className="p-3 text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Sold
              </p>
              <div className="flex items-center justify-center mt-1">
                <p className="text-2xl font-bold text-green-600">
                  {soldTickets}
                </p>
                <span className="text-xs text-gray-500 ml-1">
                  ({Math.round((soldTickets / totalTickets) * 100)}%)
                </span>
              </div>
            </div>

            <div className="p-3 text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Available
              </p>
              <div className="flex items-center justify-center mt-1">
                <p className="text-2xl font-bold text-blue-600">
                  {availableTickets}
                </p>
                <span className="text-xs text-gray-500 ml-1">
                  ({Math.round((availableTickets / totalTickets) * 100)}%)
                </span>
              </div>
            </div>

            <div className="p-3 text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Checked In
              </p>
              <div className="flex items-center justify-center mt-1">
                <p className="text-2xl font-bold text-amber-600">
                  {checkedInTickets}
                </p>
                <span className="text-xs text-gray-500 ml-1">
                  (
                  {soldTickets
                    ? Math.round((checkedInTickets / soldTickets) * 100)
                    : 0}
                  %)
                </span>
              </div>
            </div>
          </div>

          <div className="px-6 pb-4 flex justify-between items-center text-sm text-gray-500">
            <div className="flex items-center">
              <PieChart className="h-4 w-4 mr-1" />
              <span>Live data updates automatically</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="ml-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                title="Refresh data"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshing ? "animate-spin text-purple-600" : "text-gray-500"}`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative flex-grow max-w-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by code or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
              />
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                <Filter className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-sm text-gray-500 mr-2">Filter:</span>
              </div>
              <div className="flex rounded-md shadow-sm">
                <button
                  onClick={() => setFilterStatus("all")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-l-md ${
                    filterStatus === "all"
                      ? "bg-purple-600 text-white"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterStatus("purchased")}
                  className={`px-3 py-1.5 text-xs font-medium ${
                    filterStatus === "purchased"
                      ? "bg-purple-600 text-white"
                      : "bg-white border-t border-b border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Sold
                </button>
                <button
                  onClick={() => setFilterStatus("available")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-r-md ${
                    filterStatus === "available"
                      ? "bg-purple-600 text-white"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Available
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tickets List */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <Ticket className="w-5 h-5 text-purple-600 mr-2" />
              Tickets ({filteredTickets.length})
            </h2>
          </div>

          {filteredTickets.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No tickets match your current filters
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredTickets.map((t: any) => {
                const purchased = !!t.purchasedTicket;
                const purchaser = purchased
                  ? t.purchasedTicket.user.name
                  : "N/A";
                const purchaseTime = purchased
                  ? new Date(t.purchasedTicket.createdAt).toLocaleString()
                  : "N/A";

                return (
                  <li
                    key={t.code}
                    className="px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                      <div className="mb-2 sm:mb-0">
                        <div className="flex items-center">
                          <Ticket className="h-5 w-5 text-purple-600 mr-2" />
                          <p className="font-semibold text-gray-800">
                            {t.code}
                          </p>
                        </div>

                        <div className="sm:hidden flex flex-wrap gap-2 mt-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              purchased
                                ? "bg-green-100 text-green-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {purchased ? "Sold" : "Available"}
                          </span>

                          {purchased && (
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                t.checkedIn
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {t.checkedIn ? "Checked In" : "Not Checked In"}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="hidden sm:block">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              purchased
                                ? "bg-green-100 text-green-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {purchased ? "Sold" : "Available"}
                          </span>
                        </div>

                        <div className="flex items-start sm:items-center">
                          <User className="h-4 w-4 text-gray-400 mr-1 mt-0.5 sm:mt-0" />
                          <span className="truncate max-w-[120px]">
                            {purchaser}
                          </span>
                        </div>

                        <div className="flex items-start sm:items-center">
                          <Clock className="h-4 w-4 text-gray-400 mr-1 mt-0.5 sm:mt-0" />
                          <span className="truncate max-w-[120px]">
                            {purchaseTime}
                          </span>
                        </div>

                        <div className="flex items-start sm:items-center">
                          {t.checkedIn ? (
                            <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                          ) : (
                            <XCircle className="h-4 w-4 text-gray-400 mr-1" />
                          )}
                          <span>
                            {t.checkedIn ? "Checked In" : "Not Checked In"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </AppShell>
  );
}
