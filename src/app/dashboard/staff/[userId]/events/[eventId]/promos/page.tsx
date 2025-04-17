import { CreatePromoModal } from "@/components/events/CreatePromoModal";
import { PromoCodeList } from "@/components/events/PromoCodeList";

interface PageProps {
  params: { userId: string; eventId: string };
}

export default function PromoPage({ params }: PageProps) {
  const eventId = parseInt(params.eventId);

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Promo Codes for Event #{eventId}</h1>
      <CreatePromoModal eventId={eventId} />
      <PromoCodeList eventId={eventId} />
    </div>
  );
}