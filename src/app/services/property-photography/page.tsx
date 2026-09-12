import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CtaBand from "@/components/CtaBand";

export const metadata: Metadata = {
  title: "Property Photography for Real Estate Listings",
  description:
    "Professional interior and exterior listing photography for DFW agents. Clean edits, fast delivery, and booking online.",
  alternates: { canonical: "/services/property-photography" },
};

export default function Page() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Property <span className="text-[#22C55E]">Photography</span>
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              First impressions sell homes. Our listing photography highlights natural light, space, and finish details so buyers stay longer on your MLS and social posts.
            </p>
            <ul className="space-y-3 text-gray-700">
              <li>• Interior and exterior stills tuned for MLS and portals</li>
              <li>• Consistent angles and verticals that feel premium</li>
              <li>• Fast turnaround so you can go live on schedule</li>
              <li>• Easy online booking for occupied or vacant homes</li>
            </ul>
          </div>
          <div className="relative h-72 md:h-96 rounded-2xl overflow-hidden bg-gray-50">
            <img
              src="/drone-service-image-v2.webp"
              alt="Professional real estate property photography example"
              className="absolute inset-0 h-full w-full object-cover"
              loading="eager"
            />
          </div>
        </div>
        <div className="max-w-3xl">
          <p className="text-gray-600">Whether you are launching a starter home in the suburbs or a luxury listing in Dallas, we shoot for how buyers actually browse — bright, accurate, and mobile-friendly.</p>
        </div>
        <CtaBand title="Book property photography" />
      </main>
      <SiteFooter />
    </div>
  );
}
