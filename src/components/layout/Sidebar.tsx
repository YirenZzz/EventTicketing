"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Gauge,
  BarChart,
  Ticket,
  Percent,
  QrCode,
  Calendar,
  Inbox,
  Receipt,
  MessageSquare,
  User,
  HelpCircle,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const role = session?.user?.role?.toLowerCase(); // 'organizer' / 'staff' / 'attendee'
  const userId = session?.user?.id;

  const dashboardHref = role && userId ? `/dashboard/${role}/${userId}` : "/dashboard";
  const reportsHref = role && userId ? `/dashboard/${role}/${userId}/report` : '/dashboard';
  const eventsHref = role && userId ? `/dashboard/${role}/${userId}/events` : '/dashboard';
  const promosHref = role && userId ? `/dashboard/${role}/${userId}/promos` : '/dashboard';
  const checkinHref = role && userId ? `/dashboard/${role}/${userId}/checkin` : '/dashboard';
  // const eventsAttendeeHref = role && userId ? `/dashboard/${role}/${userId}/events` : '/dashboard';

  let navItems = [];

  if (role === "organizer") {
    navItems = [
      { name: "Dashboard", href: dashboardHref, icon: Gauge },
      { name: "Reports", href: reportsHref, icon: BarChart },
      { name: "Events", href: eventsHref, icon: Ticket },
      { name: "Promo Codes", href: promosHref, icon: Percent },
    ];
  } else if (role === "staff") {
    navItems = [
      { name: "Dashboard", href: dashboardHref, icon: Gauge },
      { name: "Events", href: eventsHref, icon: Ticket },
      { name: "Check-In Lists", href: checkinHref, icon: QrCode },
    ];
  } else if (role === "attendee") {
    const activityHref = role && userId ? `/dashboard/${role}/${userId}/activity` : '/dashboard';
    const orderHref = role && userId ? `/dashboard/${role}/${userId}/orders` : '/dashboard';
    const accountHref =  role && userId ? `/dashboard/${role}/${userId}/account` : '/dashboard';
    navItems = [
      { name: "Dashboard", href: dashboardHref, icon: Gauge },
      { name: "Events", href: eventsHref, icon: Ticket },
      { name: "Activity", href: activityHref, icon: Calendar },
      { name: "Registration", href: "/registration", icon: Inbox },
      { name: "Orders & Payments", href: orderHref, icon: Receipt },
      { name: "Messages", href: "/messages", icon: MessageSquare },
      { name: "Account", href: accountHref, icon: User },
      { name: "Help Center", href: "/help_center", icon: HelpCircle },
    ];
  }


  return (
    <aside className="w-64 h-screen bg-gradient-to-b from-purple-800 to-purple-900 text-white flex flex-col justify-between shadow-md">
      <div>
        <div className="p-6 text-xl font-bold tracking-wide">🎟 ticket events</div>
        <p className="px-6 pt-2 text-xs text-purple-200 uppercase tracking-wider mb-2">
          Manage
        </p>
        <nav className="px-4 space-y-1">
          {navItems.map(({ name, href, icon: Icon }) => {
            const isActive =
              name === "Events"
                ? pathname.startsWith(eventsHref)
                : pathname === href;
            return (
              <Link
                key={name}
                href={href}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? "bg-white text-purple-800 shadow"
                    : "text-purple-100 hover:bg-purple-700 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="p-4 border-t border-purple-700 text-sm text-purple-300">
        Logged in as <span className="font-semibold">{session?.user?.role || "User"}</span>
      </div>
    </aside>
  );
}