"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [role, setRole] = useState("Attendee"); // 新增：角色选择
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Submit registrition
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPass) {
      setError("Password and Confirm Password do not match.");
      return;
    }

    setLoading(true);

    try {
      // /api/users and send role
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // params required by backends
          name,
          email,
          password,
          role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create user");
      } else {
        setSuccess("Signup successful! You can now log in.");
        // jump to /login, optional
        // router.push("/login");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen">
      {/* white background on the left */}
      <section className="w-full md:w-1/2 flex flex-col justify-center px-6 md:px-12 lg:px-24 bg-white">
        <div className="max-w-md mx-auto">
          {/* Logo */}
          <div className="flex items-center mb-8">
            {/* <h1 className="text-2xl font-bold">hi.events</h1> */}
            <h1 className="text-3xl font-bold text-purple-600">
              Event Ticket System
            </h1>
          </div>

          {/* Title and instruction */}
          <h2 className="text-2xl font-semibold mb-2">
            Create an account <span className="wave-emoji">👋</span>
          </h2>
          <p className="text-gray-600 mb-6">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              Log in
            </Link>
          </p>

          {/* error or success */}
          {error && (
            <p className="bg-red-100 text-red-600 p-2 rounded mb-4 text-sm">
              {error}
            </p>
          )}
          {success && (
            <p className="bg-green-100 text-green-600 p-2 rounded mb-4 text-sm">
              {success}
            </p>
          )}

          {/* register */}
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  className="border rounded w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
                  placeholder="John"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  className="border rounded w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
                  placeholder="Smith"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div> */}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                className="border rounded w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  className="border rounded w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  className="border rounded w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
                  placeholder="Confirm password"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Role Selection：Organizer/Staff/Attendee */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Your Role
              </label>
              <select
                className="border rounded w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="Organizer">Organizer</option>
                <option value="Staff">Staff</option>
                <option value="Attendee">Attendee</option>
              </select>
            </div>

            {/* register button */}
            <button
              type="submit"
              disabled={loading}
              className="bg-pink-500 hover:bg-pink-600 text-white w-full py-2 rounded mb-4"
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </form>
          <p className="text-sm text-gray-500 mb-6">
            By registering you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </section>

      {/* bg on the right */}
      <section className="hidden md:flex md:w-1/2 bg-gradient-to-r from-purple-400 via-pink-500 to-pink-600 text-white flex-col justify-center px-10">
        <div className="max-w-md">
          <h3 className="text-2xl font-bold mb-4">Instant Setup</h3>
          <p className="mb-6">Create and customize your event in minutes</p>
          <h3 className="text-2xl font-bold mb-4">No CC Required</h3>
          <p className="mb-6">Get started for free, no subscription fees</p>
          <h3 className="text-2xl font-bold mb-4">Manage All in One Place</h3>
          <p className="mb-6">Ticket sales, check-ins, analytics, and more</p>
        </div>
      </section>
    </main>
  );
}
