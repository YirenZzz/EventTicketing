export interface EventWithDetails extends Event {
    organizer?: UserProfile;
    ticketTypes?: Array<any>;
    customFields?: Array<CustomField>;
    virtualEventUrl?: string; // For online events (Zoom, Teams, etc.)
    _count?: {
      registrations: number;
    };
    dynamicStatus?: EventDynamicStatus;
  }