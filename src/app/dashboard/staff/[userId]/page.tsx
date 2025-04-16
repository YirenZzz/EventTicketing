"use client";

import React, { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { OrganizerShell } from "@/components/layout/OrganizerShell";
import { StatCard } from "@/components/ui/StatCard";
import { StepCard } from "@/components/ui/StepCard";
import { EventCard } from "@/components/ui/EventCard";
import {
  ShoppingCart,
  Users,
  CreditCard,
  Wallet,
  Eye,
  FileCheck,
  QrCode,
  BarChart3,
  ListPlus,
} from "lucide-react";

import { Html5QrcodeScanner } from "html5-qrcode";

export default function StaffDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const userId = params?.userId?.toString();

  useEffect(() => {
    if (status === "loading") return;

    const sessionUserId = String(session?.user?.id);
    const isAuthorized =
      session?.user?.role === "Staff" && sessionUserId === userId;

    if (!isAuthorized) {
      router.replace("/login");
    }
  }, [session, status, userId, router]);

  if (status === "loading") return null;

  const sessionUserId = String(session?.user?.id);
  if (session?.user?.role !== "Staff" || sessionUserId !== userId) {
    return null; // unauthorized
  }

  return (
    <OrganizerShell>
      <h1 className="text-3xl font-bold mb-6">
        Welcome back, {session.user.name} 👋
      </h1>

      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h2 className="text-lg font-semibold mb-4">
          🚀 Prepare for staff duties
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StepCard
            title="Check-in"
            description="Scan attendee QR codes to validate tickets."
            actionLabel="Go to Check-in"
            onClick={() => router.push(`/dashboard/staff/${userId}/checkin`)}
            //icon={QrCode}
          />
        </div>
      </div>

      <div className="mt-10 space-y-4">
        <EventCard
          event={{
            id: "1",
            name: "AI Summit 2025",
            startDate: "2025-05-20T10:00:00Z",
            endDate: "2025-05-20T12:00:00Z",
            status: "Draft",
          }}
        />
        <EventCard
          event={{
            id: "2",
            name: "Startup Expo",
            startDate: "2025-06-10T10:00:00Z",
            endDate: "2025-06-10T15:00:00Z",
            status: "Live",
          }}
        />
      </div>
      {/* <CheckInScanner /> */}
    </OrganizerShell>
  );
}
