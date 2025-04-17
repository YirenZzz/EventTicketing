'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/ui/use-toast';
import AttendeeShell from '@/components/layout/AttendeeShell';
import { ShieldCheck, User, KeyRound, History, Save } from 'lucide-react';

export default function AccountPage() {
  const router = useRouter();
  const { data: session, update: updateSession, status } = useSession();
  const { toast } = useToast();
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);

  // Load initial user data when session is available
  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || '',
        email: session.user.email || ''
      });
    }
  }, [session]);

  // Countdown timer for redirect
  useEffect(() => {
    if (redirectCountdown !== null) {
      if (redirectCountdown <= 0) {
        // Construct the proper URL format that matches login redirect pattern
        const userRole = (session?.user?.role || 'attendee').toLowerCase();
        const userId = session?.user?.id || '1';
        router.push(`/dashboard/${userRole}/${userId}`);
      } else {
        const timer = setTimeout(() => {
          setRedirectCountdown(redirectCountdown - 1);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [redirectCountdown, router, session]);

  // Form input change handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create form data object to send
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);

      // Send data to API
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        body: formDataToSend,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update profile');
      }

      const updatedUser = await response.json();
      
      // Update session with new user data
      await updateSession({
        ...session,
        user: {
          ...session?.user,
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role
        },
      });

      // Force refresh to update UI
      router.refresh();
      
      toast({
        title: "Success",
        description: "Profile updated successfully. Redirecting to dashboard...",
      });
      
      // Start countdown for redirect
      setRedirectCountdown(3);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <AttendeeShell>
        <div className="flex justify-center p-6">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-purple-700 border-t-transparent"></div>
        </div>
      </AttendeeShell>
    );
  }

  return (
    <AttendeeShell>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="h-8 w-8 text-purple-700" />
          <h1 className="text-2xl font-bold">🔐 Account Settings</h1>
        </div>
        
        {redirectCountdown !== null && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-md flex items-center justify-between">
            <span>Redirecting to dashboard in {redirectCountdown} seconds...</span>
            <button
              onClick={() => {
                const userRole = (session?.user?.role || 'attendee').toLowerCase();
                const userId = session?.user?.id || '1';
                router.push(`/dashboard/${userRole}/${userId}`);
              }}
              className="text-green-700 underline"
            >
              Go now
            </button>
          </div>
        )}
        
        <div className="bg-white shadow rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-400" />
                  <label htmlFor="name" className="block text-sm font-medium">👤 Name</label>
                </div>
                <input
                  id="name"
                  name="name"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-400" />
                  <label htmlFor="email" className="block text-sm font-medium">📧 Email</label>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  placeholder="Your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="flex items-center justify-center w-full py-2 px-4 bg-purple-700 text-white rounded-md hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </form>
        </div>
        
        {/* Additional options */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-medium">Additional Settings</h3>
          </div>
          
          <div className="px-6 py-2">
            <button 
              onClick={() => toast({ title: "Coming Soon", description: "Change password feature will be available soon" })}
              className="flex w-full items-center py-3 px-3 text-left text-sm rounded-md hover:bg-gray-50"
            >
              <KeyRound className="h-5 w-5 mr-3 text-gray-400" />
              <span>🔐 Change Password</span>
            </button>
            
            <button 
              onClick={() => toast({ title: "Coming Soon", description: "Login history feature will be available soon" })}
              className="flex w-full items-center py-3 px-3 text-left text-sm rounded-md hover:bg-gray-50"
            >
              <History className="h-5 w-5 mr-3 text-gray-400" />
              <span>📜 Login History</span>
            </button>
            
            <button 
              onClick={() => toast({ title: "Coming Soon", description: "Security settings feature will be available soon" })}
              className="flex w-full items-center py-3 px-3 text-left text-sm rounded-md hover:bg-gray-50"
            >
              <ShieldCheck className="h-5 w-5 mr-3 text-gray-400" />
              <span>🛡 Security Settings (2FA, Devices)</span>
            </button>
          </div>
        </div>
      </div>
    </AttendeeShell>
  );
}