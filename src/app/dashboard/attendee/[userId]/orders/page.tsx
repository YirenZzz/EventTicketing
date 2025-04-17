'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format, isValid } from 'date-fns'; // Added isValid import
import { 
  Receipt, 
  FileText, 
  ArrowLeft, 
  CreditCard, 
  Calendar, 
  Clock, 
  X,
  ChevronRight,
  Download,
  ExternalLink
} from 'lucide-react';
import AttendeeShell from '@/components/layout/AttendeeShell';

// Define interfaces based on your Prisma schema
interface Payment {
  id: number;
  paymentMethod: string;
  transactionId?: string;
  amount: number;
  status: string;
  paymentDate: Date | string; // Accept string or Date
  orderId: number;
}

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  quantity: number;
  totalAmount: number;
  createdAt: Date | string; // Accept string or Date
  userId: number;
  ticketId: number;
  
  // Relations (populated)
  ticket?: {
    id: number;
    name: string;
    price: number;
    event: {
      id: number;
      name: string;
      startDate: Date | string; // Accept string or Date
      location?: string;
    }
  };
  payment?: Payment;
}

export default function OrdersPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Helper function to safely format dates
  const safeFormatDate = (date: Date | string | undefined | null, formatString: string): string => {
    if (!date) return 'N/A';
    
    // Convert to Date object if it's a string
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if date is valid before formatting
    if (!isValid(dateObj)) return 'Invalid date';
    
    try {
      return format(dateObj, formatString);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Error formatting date';
    }
  };
  
  // Check if user is authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);
  
  // Fetch orders from the API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/orders');
        
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        
        const data = await response.json();
        
        // Process orders data - we won't immediately convert to Date objects here
        // to avoid potential issues with invalid dates
        setOrders(data.orders);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError('Failed to load orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (status === 'authenticated') {
      fetchOrders();
    }
  }, [status]);
  
  // Handle pay now button
  const handlePayNow = (orderId: number) => {
    router.push(`/checkout/${orderId}`);
  };
  
  // Handle cancel order
  const handleCancelOrder = async (orderId: number) => {
    if (!confirm('Are you sure you want to cancel this order?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to cancel order');
      }
      
      // Refresh orders after cancellation
      const updatedOrders = orders.map(order => 
        order.id === orderId ? { ...order, status: 'CANCELLED' } : order
      );
      setOrders(updatedOrders);
      
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Failed to cancel order. Please try again.');
    }
  };
  
  // Handle download receipt
  const handleDownloadReceipt = (orderId: number) => {
    window.open(`/api/orders/${orderId}/receipt`, '_blank');
  };
  
  // Get order badge based on status
  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">✅ Paid</span>;
      case 'PENDING':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">⏳ Pending</span>;
      case 'CANCELLED':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">❌ Cancelled</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };
  
  // Display loading state
  if (loading) {
    return (
      <AttendeeShell>
        <div className="flex items-center justify-center h-60">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </AttendeeShell>
    );
  }
  
  // Get user ID for the back link
  const userId = session?.user?.id || "1";
  const userRole = (session?.user?.role || "attendee").toLowerCase();
  
  return (
    <AttendeeShell>
      <div className="space-y-6">
        {/* Back to Dashboard Link */}
        <Link href={`/dashboard/${userRole}/${userId}`} className="inline-flex items-center text-primary hover:text-primary-dark transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Receipt className="h-8 w-8" />
            My Orders
          </h1>
        </div>
        
        {/* Orders List */}
        <div className="space-y-4">
          {orders.length > 0 ? (
            orders.map((order) => (
              <div key={order.id} className="border rounded-lg overflow-hidden bg-white shadow-sm">
                <div className="p-4 flex flex-col space-y-4">
                  {/* Order Header */}
                  <div className="flex flex-col md:flex-row justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">🧾 Order: {order.orderNumber}</h3>
                        {getOrderStatusBadge(order.status)}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mt-1">
                        Ordered on {safeFormatDate(order.createdAt, "MMMM d, yyyy")}
                      </p>
                    </div>
                    
                    <div className="mt-2 md:mt-0">
                      <p className="text-xl font-bold text-primary">
                        ${order.totalAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Order Details */}
                  {order.ticket && order.ticket.event && (
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="flex flex-col md:flex-row justify-between">
                        <div>
                          <p className="font-medium">🎭 Event: {order.ticket.event.name}</p>
                          <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>🗓️ {safeFormatDate(order.ticket.event.startDate, "MMMM d, yyyy")}</span>
                          </div>
                          {order.ticket.event.location && (
                            <div className="flex items-center text-sm text-muted-foreground mt-1">
                              <span>📍 {order.ticket.event.location}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-2 md:mt-0">
                          <p className="text-sm">
                            <span className="font-medium">🎟️ Ticket:</span> {order.ticket.name}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">🔢 Quantity:</span> {order.quantity}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">💰 Price:</span> ${order.ticket.price.toFixed(2)} each
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex flex-wrap justify-end gap-2 mt-2">
                    {order.status === 'PAID' && (
                      <>
                        <Link 
                          href={`/orders/${order.id}/invoice`}
                          className="flex items-center px-3 py-1.5 border rounded-md text-sm hover:bg-gray-50"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          View Invoice
                        </Link>
                        
                        <button 
                          onClick={() => handleDownloadReceipt(order.id)}
                          className="flex items-center px-3 py-1.5 border rounded-md text-sm hover:bg-gray-50"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Receipt
                        </button>
                        
                        <Link 
                          href={`/tickets/${order.id}`}
                          className="flex items-center px-3 py-1.5 bg-primary text-white rounded-md text-sm hover:bg-primary-dark"
                        >
                          <ChevronRight className="h-4 w-4 mr-2" />
                          View Ticket
                        </Link>
                      </>
                    )}
                    
                    {order.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          className="flex items-center px-3 py-1.5 border border-red-300 text-red-700 rounded-md text-sm hover:bg-red-50"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </button>
                        
                        <button
                          onClick={() => handlePayNow(order.id)}
                          className="flex items-center px-3 py-1.5 bg-primary text-white rounded-md text-sm hover:bg-primary-dark"
                        >
                          <CreditCard className="h-4 w-4 mr-2" />
                          Pay Now
                        </button>
                      </>
                    )}
                    
                    {/* For cancelled orders, maybe show a "Re-order" button */}
                    {order.status === 'CANCELLED' && (
                      <Link
                        href={`/activity/${order.ticket?.event.id}`}
                        className="flex items-center px-3 py-1.5 border rounded-md text-sm hover:bg-gray-50"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Event
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-gray-50 border-dashed border-2 rounded-lg p-10 flex flex-col items-center justify-center text-center">
              <div className="h-12 w-12 text-gray-400 mb-4">📝</div>
              <h3 className="text-lg font-medium mb-2">No orders yet</h3>
              <p className="text-gray-500 max-w-sm mb-6">
                You haven't placed any orders yet. Browse events and get your tickets today!
              </p>
              <Link href="/activity" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">
                Browse Events
              </Link>
            </div>
          )}
        </div>
      </div>
    </AttendeeShell>
  );
}