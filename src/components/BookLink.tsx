"use client";

import { BOOKING_URL } from "@/lib/site";
import { trackBookClick } from "@/lib/analytics";

type BookLinkProps = {
  children: React.ReactNode;
  className?: string;
  location: string;
};

/** Shared booking CTA with optional GA4 book_click tracking. */
export default function BookLink({ children, className, location }: BookLinkProps) {
  return (
    <a
      href={BOOKING_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => trackBookClick(location)}
    >
      {children}
    </a>
  );
}
