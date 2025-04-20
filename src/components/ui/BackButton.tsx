"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "./button";

export default function BackButton({ fallbackHref }: { fallbackHref?: string }) {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      onClick={() => {
        if (window.history.length > 1) router.back();
        else if (fallbackHref) router.push(fallbackHref);
        else router.push("/");
      }}
      className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
    >
      <ArrowLeft size={16} />
      Back
    </Button>
  );
}