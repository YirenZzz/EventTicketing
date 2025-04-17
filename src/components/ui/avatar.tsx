// src/components/ui/avatar.tsx
import React from 'react';

export const Avatar = ({ 
  className = '', 
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`}
      {...props}
    />
  );
};

export const AvatarImage = ({ 
  className = '', 
  src, 
  alt = '', 
  ...props 
}: React.ImgHTMLAttributes<HTMLImageElement>) => {
  // Don't render the img element at all if src is empty
  if (!src) {
    return null;
  }
  
  return (
    <img
      src={src}
      alt={alt}
      className={`aspect-square h-full w-full object-cover ${className}`}
      {...props}
    />
  );
};

export const AvatarFallback = ({ 
  className = '', 
  children, 
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={`flex h-full w-full items-center justify-center rounded-full bg-gray-100 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};