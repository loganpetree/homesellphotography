import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CtaBand from "@/components/CtaBand";
import BookLink from "@/components/BookLink";

export const metadata: Metadata = {
  title: "Floor Plans That Help Listings Sell",
  description:
    "Why clear floor plans help DFW buyers understand layout, compare homes faster, and stay engaged on MLS and portals.",
  alternates: { canonical: "/resources/floor-plans-that-sell" },
};

export default function Page() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <main className="max-w-7xl mx-auto px-4 py-12">
        <p className="text-sm font-medium text-[#22C55E] mb-3">Agent resources</p>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Floor plans that <span className="text-[#22C55E]">sell</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mb-10">
          Photos show lifestyle. Floor plans show flow. Together they answer “Does this layout work for us?” before the showing.
        </p>
        <div className="grid lg:grid-cols-2 gap-10 items-center mb-12">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">When floor plans help most</h2>
            <ul className="space-y-2 text-gray-600 mb-6">
              <li>• Open-concept homes where room counts are confusing in photos</li>
              <li>• Multi-story layouts and bonus rooms over the garage</li>
              <li>• Luxury or custom homes with unique traffic patterns</li>
              <li>• Investors and relocating buyers comparing several properties</li>
            </ul>
            <p className="text-gray-600 text-sm">
              Pair with{" "}
              <Link href="/services/property-photography" className="text-[#22C55E] hover:underline">property photography</Link>{" "}
              or book via our{" "}
              <Link href="/services/floor-plans" className="text-[#22C55E] hover:underline">floor plans service</Link>.
            </p>
          </div>
          <div className="relative h-64 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
            <img
              src="/floorplan.png"
              alt="Example residential floor plan"
              className="absolute inset-0 h-full w-full object-contain p-4"
              loading="lazy"
            />
          </div>
        </div>
        <p className="text-gray-600 max-w-3xl mb-6">
          Prep the home with our{" "}
          <Link href="/resources/shoot-prep" className="text-[#22C55E] hover:underline">shoot prep checklist</Link>, then add
          mapping if the lot needs context — see{" "}
          <Link href="/resources/drone-vs-stills" className="text-[#22C55E] hover:underline">drone vs stills</Link>.
        </p>
        <BookLink
          location="resource_floor_plans"
          className="inline-flex items-center justify-center rounded bg-[#22C55E] hover:bg-[#4ADE80] text-white px-6 py-3 font-medium transition-colors"
        >
          Book photos + floor plans
        </BookLink>
        <CtaBand title="Add floor plans to your next listing" location="resource_floorplans_cta" />
      </main>
      <SiteFooter />
    </div>
  );
}
