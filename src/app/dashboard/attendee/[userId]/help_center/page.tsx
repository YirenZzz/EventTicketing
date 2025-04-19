'use client';

import React, { useState } from 'react';
import { Search, HelpCircle, ChevronRight, Mail, PhoneCall, MessageSquare, FileText, BookOpen } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';

export default function HelpCenter() {
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

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
      question: "How do I download my ticket?",
      answer: "After purchasing, your ticket will be emailed to you. You can also log into your account, navigate to 'Your Tickets,' and download a PDF version to print or save on your device."
    },
    {
      question: "Event postponed – what now?",
      answer: "If an event is postponed, your ticket remains valid for the new date. You'll receive an email notification about the change. If you cannot attend on the new date, you may have the option to request a refund, depending on the organizer's policy. Check the event page for the latest updates."
    },
    {
      question: "What should I do if I entered the wrong email address?",
      answer: "If you made a mistake during checkout, please contact our support team as soon as possible with your order details. We'll help you update the email and resend your tickets."
    },
    {
      question: "What if I lose my QR code?",
      answer: "Don't worry! You can always log back into your account and access your tickets. From the 'Your Tickets' section, you can view your QR code again or download a new copy of your ticket."
    },
    {
      question: "Can I access my ticket on my phone?",
      answer: "Yes! After purchase, you'll get a mobile-friendly ticket in your email. You can also log into your account on your smartphone and access your ticket anytime."
    }
  ];

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter FAQs based on search
  const filteredFaqs = faqs.filter(faq => {
    if (searchTerm.trim() === '') return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      faq.question.toLowerCase().includes(searchLower) || 
      faq.answer.toLowerCase().includes(searchLower)
    );
  });

  return (
    <AppShell>
      <div className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Header + Search */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-purple-600" />
              Help Center
            </h1>
            {/* <div className="relative max-w-sm w-full">
              <Search className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search help topics..."
                className="pl-10 pr-4 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div> */}
          </div>

          <div className="bg-purple-50 py-12 rounded-lg mb-8">
            <div className="max-w-5xl mx-auto text-center">
              <h1 className="text-4xl font-bold text-purple-800 mb-4">📖 Help Center</h1>
              <p className="text-lg text-purple-700 max-w-2xl mx-auto">
                Find answers to frequently asked questions and get the support you need
              </p>
            </div>
          </div>

          <main className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold mb-6 text-center">Frequently Asked Questions</h2>
              
              {filteredFaqs.length === 0 ? (
                <div className="border-dashed border-2 rounded-lg p-10 text-center text-gray-500">
                  <HelpCircle className="w-10 h-10 mx-auto mb-4 text-gray-400" />
                  No FAQs found matching your search.
                </div>
              ) : (
                <div className="space-y-4 max-w-3xl mx-auto">
                  {filteredFaqs.map((faq, index) => (
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
              )}
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-semibold mb-4 text-purple-700">Contact Support</h2>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                {/* Email */}
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-purple-600 mr-2" />
                  <span className="text-gray-700">support@ticketevents.com</span>
                </div>
                
                {/* Phone */}
                <div className="flex items-center">
                  <PhoneCall className="h-5 w-5 text-purple-600 mr-2" />
                  <span className="text-gray-700">+1 (555) 123-4567</span>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </AppShell>
  );
}