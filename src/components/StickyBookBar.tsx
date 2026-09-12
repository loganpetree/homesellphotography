"use client";

import { PHONE_DISPLAY, PHONE_E164 } from "@/lib/site";
import BookLink from "@/components/BookLink";

/** Persistent mobile-friendly book bar (hidden on md+ where header CTA is visible). */
export default function StickyBookBar() {
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-sm shadow-[0_-4px_20px_rgba(0,0,0,0.08)] pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
        <BookLink
          location="sticky_mobile_bar"
          className="flex-1 inline-flex items-center justify-center rounded bg-[#22C55E] hover:bg-[#4ADE80] text-white px-4 py-3 font-semibold text-sm transition-colors"
        >
          Book a Shoot
        </BookLink>
        <a
          href={`tel:${PHONE_E164}`}
          className="shrink-0 inline-flex items-center justify-center rounded border border-gray-200 px-3 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50"
          aria-label={`Call ${PHONE_DISPLAY}`}
        >
          Call
        </a>
      </div>
    </div>
  );
}
