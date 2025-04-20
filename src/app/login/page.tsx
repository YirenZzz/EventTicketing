"use client";

import { useState } from "react";
import { getSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Attendee");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      email,
      password,
      role,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError(result.error);
    } else {
      const session = await getSession();
      const userId = session?.user?.id;
      const userRole = session?.user?.role?.toLowerCase(); // toLowerCase for URL

      if (userId && userRole) {
        router.push(`/dashboard/${userRole}/${userId}`);
      } else {
        setError("Failed to retrieve session info.");
      }
    }
  };

  return (
    <main className="flex min-h-screen">
      {/* 左侧表单 */}
      <section className="w-full md:w-1/2 flex flex-col justify-center px-6 md:px-12 lg:px-24 bg-white">
        <div className="max-w-md mx-auto">
          <div className="flex items-center mb-8">
            {/* <img src="/your-logo.png" alt="Logo" className="h-8 w-8 mr-2" /> */}
            <h1 className="text-3xl font-bold text-purple-600">
              Event Ticket System
            </h1>
          </div>

          <h2 className="text-2xl font-semibold mb-2">
            Welcome back <span className="wave-emoji">👋</span>
          </h2>
          <p className="text-gray-600 mb-6">
            Don't have an account?{" "}
            <a href="/signup" className="text-blue-600 hover:underline">
              Sign up
            </a>
          </p>

          {error && (
            <p className="bg-red-100 text-red-600 p-2 rounded mb-4 text-sm">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email *
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border rounded w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
                required
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password *
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border rounded w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
                required
              />
            </div>

            <div className="mb-6">
              <a href="#" className="text-sm text-blue-600 hover:underline">
                Forgot password?
              </a>
            </div>

            <div className="mb-4">
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Select Your Role
              </label>
              <select
                id="role"
                className="border rounded w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="Organizer">Organizer</option>
                <option value="Staff">Staff</option>
                <option value="Attendee">Attendee</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-pink-500 hover:bg-pink-600 text-white w-full py-2 rounded mb-4"
            >
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>
        </div>
      </section>

      {/* Intro on the right */}
      <section className="hidden md:flex md:w-1/2 bg-gradient-to-r from-purple-400 via-pink-500 to-pink-600 text-white flex-col justify-center px-10">
        <div className="max-w-md">
          <h3 className="text-2xl font-bold mb-4">Smart Dashboard</h3>
          <p className="mb-6">
            Track revenue, page views, and sales with detailed analytics and
            exportable reports
          </p>
          <h3 className="text-2xl font-bold mb-4">Complete Store</h3>
          <p className="mb-6">
            Sell merchandise alongside tickets with integrated tax and promo
            code support
          </p>
          <h3 className="text-2xl font-bold mb-4">Brand Control</h3>
          <p className="mb-6">
            Customize your event page and widget design to match your brand
            perfectly
          </p>
        </div>
      </section>
    </main>
  );
}
