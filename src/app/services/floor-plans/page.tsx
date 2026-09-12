import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CtaBand from "@/components/CtaBand";
import BookLink from "@/components/BookLink";

export const metadata: Metadata = {
  title: "Real Estate Floor Plans & Mapping",
  description:
    "Clear floor plans and property mapping for DFW listings so buyers understand layout and flow. Book with Homesell Photography.",
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
              Help buyers understand how rooms connect before they tour. Floor plans reduce surprises and keep serious buyers engaged longer online.
            </p>
            <ul className="space-y-3 text-gray-700 mb-6">
              <li>• Clear, readable residential floor plans</li>
              <li>• Great for open concepts and multi-story homes</li>
              <li>• Complements stills and aerial media</li>
              <li>• Easy to add when you book online</li>
            </ul>
            <BookLink
              location="service_floorplans_hero"
              className="inline-flex items-center justify-center rounded bg-[#22C55E] hover:bg-[#4ADE80] text-white px-6 py-3 font-medium transition-colors"
            >
              Book floor plans
            </BookLink>
          </div>
          <div className="relative h-72 md:h-96 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
            <img
              src="/floorplan.png"
              alt="Residential floor plan example"
              className="absolute inset-0 h-full w-full object-contain p-6"
              loading="eager"
            />
          </div>
        </div>
        <CtaBand title="Add floor plans to your package" location="service_floorplans_cta" />
      </main>
      <SiteFooter />
    </div>
  );
}
