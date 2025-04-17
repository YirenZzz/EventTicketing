'use client';

import React, { useState, useEffect } from 'react';
import { HelpCircle, ChevronRight, Mail, PhoneCall } from 'lucide-react';
import SearchBackHeader from '@/components/layout/SearchBackHeader';

export default function HelpCenter() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFaqs, setFilteredFaqs] = useState<Array<{question: string, answer: string}>>([]); 

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

  // Filter FAQs based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredFaqs(faqs);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = faqs.filter(faq => 
        faq.question.toLowerCase().includes(query) || 
        faq.answer.toLowerCase().includes(query)
      );
      setFilteredFaqs(filtered);
    }
  }, [searchQuery]);

  // Initialize filtered FAQs with all FAQs
  useEffect(() => {
    setFilteredFaqs(faqs);
  }, []);

  const toggleFaq = (index: number) => {
    if (expandedFaq === index) {
      setExpandedFaq(null);
    } else {
      setExpandedFaq(index);
    }
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="flex-1 overflow-auto">
      <SearchBackHeader
        title="Help Center"
        searchPlaceholder="Search help topics..."
        onSearchChange={handleSearchChange}
        searchValue={searchQuery}
      />

      <div className="bg-purple-50 py-12">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-purple-800 mb-4">📖 Help Center</h1>
          <p className="text-lg text-purple-700 max-w-2xl mx-auto">
            Find answers to frequently asked questions and get the support you need
          </p>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4 max-w-3xl mx-auto">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => (
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
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No FAQs found matching your search criteria.</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="w-full max-w-3xl mx-auto mb-12">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-4 text-purple-700">Contact Support</h2>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-purple-600 mr-3" />
                <span>support@ticketevents.com</span>
              </div>
              <div className="flex items-center">
                <PhoneCall className="h-5 w-5 text-purple-600 mr-3" />
                <span>+1 (555) 123-4567</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}