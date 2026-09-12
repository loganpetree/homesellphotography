import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CtaBand from "@/components/CtaBand";
import BookLink from "@/components/BookLink";

export const metadata: Metadata = {
  title: "DFW Real Estate Photography",
  description: "DFW real estate photography for listing agents across the Dallas–Fort Worth metroplex — photos, aerial media, and floor plans with easy online booking.",
  alternates: { canonical: "/dfw-real-estate-photography" },
};

export default function Page() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <main className="max-w-7xl mx-auto px-4 py-12">
        <p className="text-sm font-medium text-[#22C55E] mb-3">Homesell Photography</p>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          DFW Real Estate <span className="text-[#22C55E]">Photography</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mb-6">
          DFW real estate photography for listing agents across the Dallas–Fort Worth metroplex — photos, aerial media, and floor plans with easy online booking.
        </p>
        <div className="mb-10">
          <BookLink
            location="city_dfw_hero"
            className="inline-flex items-center justify-center rounded bg-[#22C55E] hover:bg-[#4ADE80] text-white px-6 py-3 font-medium transition-colors"
          >
            Book DFW photography
          </BookLink>
        </div>
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="rounded-2xl border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Why agents book us in DFW</h2>
            <ul className="space-y-2 text-gray-600">
              <li>• Reliable on-time photographers</li>
              <li>• Listing-ready edits with fast turnaround</li>
              <li>• Drone and floor plans when the home needs them</li>
              <li>• Simple online scheduling</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Popular packages</h2>
            <ul className="space-y-2 text-gray-600">
              <li>• <Link href="/services/property-photography" className="text-[#22C55E] hover:underline">Property photography</Link></li>
              <li>• <Link href="/services/aerial-photography" className="text-[#22C55E] hover:underline">Aerial / drone</Link></li>
              <li>• <Link href="/services/floor-plans" className="text-[#22C55E] hover:underline">Floor plans &amp; mapping</Link></li>
              <li>• <Link href="/pricing" className="text-[#22C55E] hover:underline">See pricing options</Link></li>
            </ul>
          </div>
        </div>
        <div className="prose prose-gray max-w-3xl mb-8">
          <p className="text-gray-600">Serving the broader DFW metroplex means you get one reliable media partner whether your listing is in Dallas, Fort Worth, the mid-cities, or nearby suburbs. Ask about travel for outlying communities when you book.</p>
        </div>
        <CtaBand title="Book DFW listing photography" location="city_dfw_cta" />
      </main>
      <SiteFooter />
    </div>
  );
}
