'use client';

import React, { useState } from 'react';
import { Search, HelpCircle, ChevronRight, Mail, PhoneCall, MessageSquare, FileText, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';


export default function HelpCenter() {
  const [expandedFaq, setExpandedFaq] = useState(null);

  const toggleFaq = (index) => {
    if (expandedFaq === index) {
      setExpandedFaq(null);
    } else {
      setExpandedFaq(index);
    }
  };

  const faqs = [
    {
      question: "Didn't receive ticket?",
      answer: "If you haven't received your ticket email, please check your spam folder first. You can also log in to your account and download your tickets from the 'Your Tickets' section. If you still can't find your ticket, please contact the event organizer or our support team."
    },
    {
      question: "How to request a refund?",
      answer: "Refund policies vary by event. To request a refund, go to your Orders & Payments section, select the ticket you wish to refund, and click the 'Request Refund' button. The organizer will review your request according to their refund policy. Please note that some events may have no-refund policies or time limitations."
    },
    {
      question: "Event postponed – what now?",
      answer: "If an event is postponed, your ticket remains valid for the new date. You'll receive an email notification about the change. If you cannot attend on the new date, you may have the option to request a refund, depending on the organizer's policy. Check the event page for the latest updates."
    },
    {
      question: "How do I transfer my ticket to someone else?",
      answer: "To transfer a ticket, go to 'Your Tickets' in your account, select the ticket you want to transfer, and click 'Transfer Ticket'. Enter the recipient's email address and follow the instructions. The recipient will receive an email with instructions to claim the ticket."
    },
    {
      question: "What if I lose my QR code?",
      answer: "Don't worry! You can always log back into your account and access your tickets. From the 'Your Tickets' section, you can view your QR code again or download a new copy of your ticket."
    },
    {
      question: "Can I edit my registration information?",
      answer: "Yes, you can edit your registration information up until a certain point (usually defined by the event organizer). Go to 'Registration' in the sidebar, select the event, and click 'Edit Details' to update your information."
    }
  ];

  return (
    <AppShell>
    <div className="flex-1 overflow-auto">
      <header className="bg-white p-4 shadow-sm">
  <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
  {/* <Link href="/dashboard/attendee/1" className="inline-flex items-center text-purple-600 hover:text-purple-800 transition-colors">
      <ArrowLeft className="h-5 w-5 mr-1" />
      <span>Back to Dashboard</span>
    </Link> */}

   
  </div>
</header>

      <div className="bg-purple-50 py-12">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-purple-800 mb-4">📖 Help Center</h1>
          <p className="text-lg text-purple-700 max-w-2xl mx-auto">
            Find answers to frequently asked questions and get the support you need
          </p>
        </div>
      </div>

      {/* <div className="w-full flex justify-center">
  <div className="relative w-full max-w-2xl">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <Search className="h-5 w-5 text-gray-400" />
    </div>
    <input
      type="text"
      placeholder="Search help topics..."
      className="pl-10 pr-4 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
    />
  </div> */}
{/* </div> */}

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4 max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div 
                  className="p-4 cursor-pointer flex justify-between items-center hover:bg-gray-50"
                  onClick={() => toggleFaq(index)}
                >
                  <div className="flex items-center">
                    <HelpCircle className="h-5 w-5 text-purple-600 mr-3 flex-shrink-0" />
                    <h3 className="font-medium">{faq.question}</h3>
                  </div>
                  <ChevronRight className={`h-5 w-5 text-gray-400 transform transition-transform duration-200 flex-shrink-0 ${expandedFaq === index ? 'rotate-90' : ''}`} />
                </div>
                {expandedFaq === index && (
                  <div className="p-4 bg-gray-50 border-t border-gray-100">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-4 text-purple-700">Contact Support</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-purple-600 mr-3" />
                <span>support@ticketevents.com</span>
              </div>
              <div className="flex items-center">
                <PhoneCall className="h-5 w-5 text-purple-600 mr-3" />
                <span>+1 (555) 123-4567</span>
              </div>
              {/* <button className="mt-4 w-full flex items-center justify-center space-x-2 bg-purple-600 text-white px-4 py-3 rounded-md hover:bg-purple-700 transition-colors">
                <MessageSquare className="h-5 w-5" />
                <span>Contact Organizer</span>
              </button> */}
            </div>
          </div>
          
          {/* <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-4 text-purple-700">Resources</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-purple-600 mr-3" />
                <a href="#" className="text-purple-600 hover:underline">User Guide</a>
              </div>
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-purple-600 mr-3" />
                <a href="#" className="text-purple-600 hover:underline">Refund Policy</a>
              </div>
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-purple-600 mr-3" />
                <a href="#" className="text-purple-600 hover:underline">Terms of Service</a>
              </div>
              <button className="mt-4 w-full flex items-center justify-center space-x-2 bg-purple-600 text-white px-4 py-3 rounded-md hover:bg-purple-700 transition-colors">
                <FileText className="h-5 w-5" />
                <span>Submit Feedback</span>
              </button>
            </div>
          </div> */}
        </div>
        
        {/* <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">Can't find what you're looking for?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">Our support team is here to help you with any questions you might have about our platform.</p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button className="flex items-center justify-center space-x-2 bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 transition-colors">
              <Mail className="h-5 w-5" />
              <span>Email Support</span>
            </button>
            <button className="flex items-center justify-center space-x-2 border border-purple-600 text-purple-600 px-6 py-3 rounded-md hover:bg-purple-50 transition-colors">
              <MessageSquare className="h-5 w-5" />
              <span>Live Chat</span>
            </button>
          </div>
        </div> */}
      </main>
    </div>
    </AppShell>
  );
}