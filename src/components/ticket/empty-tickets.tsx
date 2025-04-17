import Link from "next/link";
import { TicketAttendee, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function EmptyTickets() {
  return (
    <Card className="bg-gray-50 dark:bg-gray-800 border-dashed">
      <CardContent className="py-10 flex flex-col items-center justify-center text-center">
        <TicketAttendee className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium mb-2">No tickets yet</h3>
        <p className="text-muted-foreground max-w-sm mb-6">
          You haven&apos;t registered for any events yet. Browse upcoming events and get your tickets today!
        </p>
        <Button asChild>
          <Link href="/events">
            <Calendar className="mr-2 h-4 w-4" />
            Browse Events
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}