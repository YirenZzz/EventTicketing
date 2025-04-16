//已改




"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen">
      {/* 左侧内容区域 */}
      <section className="w-full md:w-1/2 flex flex-col justify-center items-center px-6 md:px-12 lg:px-24 bg-white">
        <div className="max-w-md text-center">
          {/* Logo 或标题 */}
          <h1 className="text-3xl md:text-4xl font-bold mb-6">
            Welcome to our Event Ticketing System!
          </h1>
          <p className="text-gray-600 mb-8">
            Simplify your event ticketing, scheduling, and check-in all in one place.
          </p>

          {/* 两个大按钮：Login / Signup */}
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            <Link
              href="/login"
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded font-medium text-center"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded font-medium text-center"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </section>

      {/* 右侧渐变背景区域 */}
      <section className="hidden md:flex md:w-1/2 bg-gradient-to-r from-purple-400 via-pink-500 to-pink-600 text-white flex-col justify-center px-10">
        <div className="max-w-md">
          <h3 className="text-2xl font-bold mb-4">Ticketing Made Easy</h3>
          <p className="mb-6">
            Manage ticket sales, discount codes, waitlists, and more – all in one platform.
          </p>
          <h3 className="text-2xl font-bold mb-4">Smooth Check-in Process</h3>
          <p className="mb-6">
            QR code scanning, real-time validation, and offline mode to ensure a stress-free event.
          </p>
          <h3 className="text-2xl font-bold mb-4">Analytics Dashboard</h3>
          <p className="mb-6">
            Track attendance, ticket revenue, and gain insights with easy exports for further analysis.
          </p>
        </div>
      </section>
    </main>
  );
}

















