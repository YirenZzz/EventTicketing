"use client";

import React from "react";
import clsx from "clsx";

export function Progress({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const clampedValue = Math.min(Math.max(value, 0), 100); // 0-100
  return (
    <div
      className={clsx(
        "w-full h-2 bg-gray-200 rounded-full overflow-hidden",
        className,
      )}
    >
      <div
        className="h-full bg-purple-600 transition-all"
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  );
}
