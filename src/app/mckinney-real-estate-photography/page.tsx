import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CtaBand from "@/components/CtaBand";
import BookLink from "@/components/BookLink";

export const metadata: Metadata = {
  title: "McKinney Real Estate Photography",
  description: "McKinney real estate photography for historic downtown homes, new construction, and Collin County listings. Fast booking with Homesell Photography.",
  alternates: { canonical: "/mckinney-real-estate-photography" },
};

export default function Page() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <main className="max-w-7xl mx-auto px-4 py-12">
        <p className="text-sm font-medium text-[#22C55E] mb-3">Homesell Photography</p>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          McKinney Real Estate <span className="text-[#22C55E]">Photography</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mb-6">
          McKinney real estate photography for historic downtown homes, new construction, and Collin County listings. Fast booking with Homesell Photography.
        </p>
        <div className="mb-10">
          <BookLink
            location="city_mckinney_hero"
            className="inline-flex items-center justify-center rounded bg-[#22C55E] hover:bg-[#4ADE80] text-white px-6 py-3 font-medium transition-colors"
          >
            Book McKinney photography
          </BookLink>
        </div>
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="rounded-2xl border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Why agents book us in McKinney</h2>
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
          <p className="text-gray-600">From historic square-area character homes to master-planned communities north of town, McKinney listings need media that matches the lifestyle. We deliver MLS-ready stills plus drone or floor plans when the lot or layout needs more context.</p>
          <p className="text-gray-600 mt-4">
            Serving nearby markets too — see{" "}
            <Link href="/dfw-real-estate-photography" className="text-[#22C55E] hover:underline">DFW coverage</Link>,{" "}
            <Link href="/resources/shoot-prep" className="text-[#22C55E] hover:underline">shoot prep tips</Link>, or{" "}
            <Link href="/testimonials" className="text-[#22C55E] hover:underline">agent testimonials</Link>.
          </p>
        </div>
        <CtaBand title="Book McKinney listing photography" location="city_mckinney_cta" />
      </main>
      <SiteFooter />
    </div>
  );
}
