'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format, isValid } from 'date-fns'; // Added isValid for date checking
import { ArrowLeft, Download, Printer } from 'lucide-react';
import { use } from 'react';
import AttendeeShell from '@/components/layout/AttendeeShell';

interface Invoice {
  order: {
    id: number;
    orderNumber: string;
    status: string;
    quantity: number;
    totalAmount: number;
    createdAt: Date | string;
    userId: number;
    ticketId: number;
    
    ticket: {
      id: number;
      name: string;
      price: number;
      event: {
        id: number;
        name: string;
        startDate: Date | string;
        location?: string;
      }
    };
    payment?: {
      id: number;
      paymentMethod: string;
      transactionId?: string;
      amount: number;
      status: string;
      paymentDate: Date | string;
    };
    user: {
      name: string;
      email: string;
    }
  }
}

export default function InvoicePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  // Unwrap params using React.use()
  const unwrappedParams = use(params);
  const orderId = unwrappedParams.id;
  
  const [invoice, setInvoice] = useState<Invoice | null>(null);
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
  
  // Fetch invoice data
  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/orders/${orderId}/invoice`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch invoice');
        }
        
        const data = await response.json();
        
        // Simply pass the data without date conversion
        setInvoice(data);
      } catch (error) {
        console.error('Error fetching invoice:', error);
        setError('Failed to load invoice. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (status === 'authenticated') {
      fetchInvoice();
    }
  }, [orderId, status]);
  
  // Print invoice
  const handlePrint = () => {
    window.print();
  };
  
  // Download receipt
  const handleDownloadReceipt = () => {
    window.open(`/api/orders/${orderId}/receipt`, '_blank');
  };
  
  // Display loading state
  if (loading || status === 'loading') {
    return (
      <AttendeeShell>
        <div className="flex items-center justify-center h-60">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </AttendeeShell>
    );
  }
  
  // Display error state
  if (error) {
    return (
      <AttendeeShell>
        <div className="container max-w-4xl py-6">
          <Link href="/orders" className="inline-flex items-center text-primary hover:text-primary-dark transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Link>
          
          <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="h-12 w-12 text-red-500 mx-auto mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-red-700">Error Loading Invoice</h2>
            <p className="mt-2 text-red-600">{error}</p>
          </div>
        </div>
      </AttendeeShell>
    );
  }
  
  // Display not found state
  if (!invoice) {
    return (
      <AttendeeShell>
        <div className="container max-w-4xl py-6">
          <Link href="/orders" className="inline-flex items-center text-primary hover:text-primary-dark transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Link>
          
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <div className="h-12 w-12 text-yellow-500 mx-auto mb-4">🔍</div>
            <h2 className="text-xl font-semibold">Invoice Not Found</h2>
            <p className="mt-2 text-gray-600">The invoice you're looking for doesn't exist or you don't have permission to view it.</p>
          </div>
        </div>
      </AttendeeShell>
    );
  }
  
  const order = invoice.order;
  
  return (
    <AttendeeShell>
      <div className="container max-w-4xl py-6">
        {/* Navigation and Actions */}
        <div className="flex justify-between items-center print:hidden">
          <Link href="/orders" className="inline-flex items-center text-primary hover:text-primary-dark transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Link>
          
          <div className="flex space-x-3">
            <button 
              onClick={handlePrint}
              className="flex items-center px-3 py-1.5 border rounded-md text-sm hover:bg-gray-50"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </button>
            
            <button 
              onClick={handleDownloadReceipt}
              className="flex items-center px-3 py-1.5 border rounded-md text-sm hover:bg-gray-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </button>
          </div>
        </div>
        
        {/* Invoice Content */}
        <div className="mt-6 bg-white shadow rounded-lg overflow-hidden p-8">
          {/* Header */}
          <div className="flex justify-between border-b pb-4">
            <div>
              <h1 className="text-2xl font-bold">INVOICE</h1>
              <p className="text-gray-600">{order.orderNumber}</p>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-primary">EVENT APP</div>
              <p className="text-sm text-gray-600">123 Event Street</p>
              <p className="text-sm text-gray-600">San Francisco, CA 94103</p>
              <p className="text-sm text-gray-600">contact@eventapp.com</p>
            </div>
          </div>
          
          {/* Billing & Order Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8">
            <div>
              <h2 className="font-semibold text-gray-700 mb-2">Bill To:</h2>
              <p className="font-medium">{order.user.name}</p>
              <p className="text-gray-600">{order.user.email}</p>
            </div>
            
            <div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Invoice Date:</p>
                  <p className="font-medium">{safeFormatDate(order.createdAt, 'MMMM d, yyyy')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Date:</p>
                  <p className="font-medium">{order.payment ? safeFormatDate(order.payment.paymentDate, 'MMMM d, yyyy') : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Order Status:</p>
                  <p className="font-medium">{order.status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Method:</p>
                  <p className="font-medium">{order.payment?.paymentMethod || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Order Details */}
          <table className="w-full border-collapse mt-8">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Description</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Event Date</th>
                <th className="py-3 px-4 text-right font-semibold text-gray-700 border-b">Quantity</th>
                <th className="py-3 px-4 text-right font-semibold text-gray-700 border-b">Price</th>
                <th className="py-3 px-4 text-right font-semibold text-gray-700 border-b">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-4 px-4 border-b">
                  <div className="font-medium">{order.ticket.event.name}</div>
                  <div className="text-sm text-gray-600">Ticket: {order.ticket.name}</div>
                </td>
                <td className="py-4 px-4 border-b">
                  {safeFormatDate(order.ticket.event.startDate, 'MMMM d, yyyy')}
                </td>
                <td className="py-4 px-4 text-right border-b">
                  {order.quantity}
                </td>
                <td className="py-4 px-4 text-right border-b">
                  ${order.ticket.price.toFixed(2)}
                </td>
                <td className="py-4 px-4 text-right border-b font-medium">
                  ${(order.ticket.price * order.quantity).toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
          
          {/* Total */}
          <div className="mt-8 text-right">
            <div className="text-gray-600">Subtotal: ${(order.ticket.price * order.quantity).toFixed(2)}</div>
            <div className="text-xl font-bold text-primary mt-2">Total: ${order.totalAmount.toFixed(2)}</div>
          </div>
          
          {/* Footer */}
          <div className="mt-16 text-center text-sm text-gray-600 border-t pt-8">
            <p>Thank you for your business!</p>
            <p className="mt-1">If you have any questions concerning this invoice, please contact support@eventapp.com</p>
          </div>
        </div>
      </div>
    </AttendeeShell>
  );
}