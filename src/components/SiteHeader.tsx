"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { navLinks } from "@/lib/site";
import BookLink from "@/components/BookLink";

export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold tracking-wide text-gray-900">
              Homesell <span className="text-[#22C55E] font-bold">Photography</span>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <BookLink
                location="header_desktop"
                className="inline-flex items-center justify-center bg-[#22C55E] hover:bg-[#4ADE80] text-white rounded px-4 py-2 text-sm font-medium transition-colors shadow-sm"
              >
                Book a Shoot
              </BookLink>
            </div>

            <div className="flex md:hidden items-center gap-2">
              <BookLink
                location="header_mobile"
                className="inline-flex items-center justify-center bg-[#22C55E] hover:bg-[#4ADE80] text-white rounded px-3 py-2 text-sm font-semibold transition-colors"
              >
                Book
              </BookLink>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(!open)}
                aria-label="Toggle menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {open && (
        <div className="md:hidden bg-white border-b border-gray-100 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex justify-end mb-4">
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="h-8 w-8" aria-label="Close menu">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-600 hover:text-gray-900 transition-colors py-2"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <BookLink
                location="header_mobile_menu"
                className="inline-flex items-center justify-center bg-[#22C55E] hover:bg-[#4ADE80] text-white rounded w-full py-3 font-medium transition-colors"
              >
                Book a Shoot
              </BookLink>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
