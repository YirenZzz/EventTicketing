'use client';

import { ArrowLeft, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SearchBackHeader {
  /**
   * Optional title to display below the search bar
   */
  title?: string;
  /**
   * Placeholder text for the search input
   */
  searchPlaceholder: string;
  /**
   * Callback function when search input changes
   */
  onSearchChange: (query: string) => void;
  /**
   * Current search input value
   */
  searchValue: string;
  /**
   * Whether to show the back button (defaults to true)
   */
  showBackButton?: boolean;
  /**
   * Optional specific URL to navigate to when back button is clicked
   * If not provided, will navigate to previous page in history
   */
  backUrl?: string;
}

/**
 * A header component that includes a back button and search functionality
 */
export default function SearchBackHeader({
  title,
  searchPlaceholder,
  onSearchChange,
  searchValue,
  showBackButton = true,
  backUrl,
}: SearchBackHeader) {
  const router = useRouter();

  /**
   * Handles the back button click
   * - Navigates to specific URL if backUrl is provided
   * - Otherwise navigates to the previous page in history
   */
  const handleBack = () => {
    if (backUrl) {
      router.push(backUrl);
    } else {
      router.back();
    }
  };

  return (
    <div className="w-full space-y-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {showBackButton && (
          <button
            onClick={handleBack}
            className="inline-flex items-center text-purple-600 hover:text-purple-800 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded-md"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            <span>Back</span>
          </button>
        )}
        
        <div className="relative w-full sm:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="pl-10 pr-4 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label={searchPlaceholder}
          />
        </div>
      </div>
      
      {title && (
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      )}
    </div>
  );
}