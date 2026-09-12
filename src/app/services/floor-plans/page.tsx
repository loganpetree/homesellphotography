import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CtaBand from "@/components/CtaBand";

export const metadata: Metadata = {
  title: "Real Estate Floor Plans & Property Mapping",
  description:
    "Clear floor plans and property mapping for DFW listings so buyers understand flow, room count, and layout instantly.",
  alternates: { canonical: "/services/floor-plans" },
};

export default function Page() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Floor Plans &amp; <span className="text-[#22C55E]">Mapping</span>
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Photos sell emotion; floor plans sell clarity. Give buyers a quick read on bedrooms, living flow, and how spaces connect before they schedule a showing.
            </p>
            <ul className="space-y-3 text-gray-700">
              <li>• Easy-to-read layouts for MLS and listing sites</li>
              <li>• Helpful for multi-story homes and open floor plans</li>
              <li>• Pair with photography for a complete media package</li>
            </ul>
          </div>
          <div className="relative h-72 md:h-96 rounded-2xl overflow-hidden bg-gray-50">
            <img
              src="/floorplan.png"
              alt="Example real estate floor plan and property mapping"
              className="absolute inset-0 h-full w-full object-contain p-4"
              loading="eager"
            />
          </div>
        </div>
        <div className="max-w-3xl">
          <p className="text-gray-600">Add floor plans when the home has a complex layout or when buyers need clarity before booking a tour.</p>
        </div>
        <CtaBand title="Add floor plans to your package" />
      </main>
      <SiteFooter />
    </div>
  );
}
