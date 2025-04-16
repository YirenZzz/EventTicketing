'use client';

import { useRouter } from 'next/navigation';

export function StepCard({
  title,
  description,
  actionLabel,
  onClick,
}: {
  title: string;
  description: string;
  actionLabel: string;
  onClick?: () => void;
}) {
  const router = useRouter();

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm flex flex-col gap-4">
      <div>
        <h4 className="text-base font-semibold text-gray-800">{title}</h4>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <button
        className="self-start text-sm font-medium text-purple-700 hover:underline"
        onClick={onClick}
      >
        {actionLabel}
      </button>
    </div>
  );
}