"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Calendar, MapPin, QrCode, ArrowRight, Download, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { RegistrationWithDetails } from "@/types/tickets";

interface TicketCardProps {
  registration: RegistrationWithDetails;
}

export function TicketCard({ registration }: TicketCardProps) {
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  
  // Get event details
  const event = registration.event;
  const ticket = registration.ticket;
  const isOnlineEvent = event?.location?.toLowerCase().includes("online") || 
                        event?.location?.toLowerCase().includes("zoom") ||
                        event?.location?.toLowerCase().includes("virtual");
  
  if (!event || !ticket) {
    return null;
  }
  
  // Format date and time
  const formattedDate = format(new Date(event.startDate), "MMMM d");
  const formattedTime = format(new Date(event.startDate), "h:mm a");
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="p-4 flex flex-col md:flex-row justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg">{event.title}</h3>
            <div className="flex items-center text-muted-foreground text-sm">
              <Calendar className="h-4 w-4 mr-1" />
              <span>🗓 {formattedDate}, {formattedTime}</span>
            </div>
            <div className="flex items-center text-muted-foreground text-sm">
              <MapPin className="h-4 w-4 mr-1" />
              <span>📍 {event.location}</span>
            </div>
          </div>
          
          <div className="flex flex-col space-y-2 mt-4 md:mt-0">
            <Button asChild variant="outline" size="sm" className="justify-between">
              <Link href={`/tickets/${ticket.id}`}>
                <span>View Ticket</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            
            <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="justify-between">
                  <span>QR Code</span>
                  <QrCode className="h-4 w-4 ml-2" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Ticket QR Code</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center justify-center p-6">
                  <div className="p-4 bg-white rounded-xl shadow-sm">
                    {ticket.qrCodeUrl ? (
                      <img 
                        src={ticket.qrCodeUrl} 
                        alt="Ticket QR Code" 
                        className="w-64 h-64"
                      />
                    ) : (
                      <div className="w-64 h-64 flex items-center justify-center bg-gray-100">
                        QR Code Not Available
                      </div>
                    )}
                  </div>
                  <p className="mt-4 text-sm text-center text-muted-foreground">
                    Present this QR code at the event for check-in
                  </p>
                  <div className="mt-4">
                    <p className="text-sm font-medium text-center">{event.title}</p>
                    <p className="text-xs text-center text-muted-foreground">
                      {formattedDate}, {formattedTime}
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            {isOnlineEvent ? (
              <Button asChild variant="outline" size="sm" className="justify-between">
                <Link href={event.virtualEventUrl || "#"} target="_blank" rel="noopener noreferrer">
                  <span>Join Link</span>
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            ) : (
              <Button asChild variant="outline" size="sm" className="justify-between">
                <Link href={`/tickets/${ticket.id}/download`}>
                  <span>Download</span>
                  <Download className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}