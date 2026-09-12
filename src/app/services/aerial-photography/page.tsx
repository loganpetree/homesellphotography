import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CtaBand from "@/components/CtaBand";
import BookLink from "@/components/BookLink";

export const metadata: Metadata = {
  title: "Aerial & Drone Real Estate Photography",
  description:
    "Drone and aerial photography for DFW listings — show lot lines, pools, rooftops, and neighborhood context. Book online with Homesell.",
  alternates: { canonical: "/services/aerial-photography" },
};

export default function Page() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Aerial / <span className="text-[#22C55E]">Drone</span>
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Show the lot, pool, and neighborhood context buyers cannot see from the curb. Ideal for acreage, new builds, and homes with outdoor amenities.
            </p>
            <ul className="space-y-3 text-gray-700 mb-6">
              <li>• Licensed aerial capture where permitted</li>
              <li>• Roofline, lot lines, and amenity context</li>
              <li>• Pairs cleanly with still photography packages</li>
              <li>• Fast delivery for listing launch day</li>
            </ul>
            <BookLink
              location="service_aerial_hero"
              className="inline-flex items-center justify-center rounded bg-[#22C55E] hover:bg-[#4ADE80] text-white px-6 py-3 font-medium transition-colors"
            >
              Book aerial photography
            </BookLink>
          </div>
          <div className="relative h-72 md:h-96 rounded-2xl overflow-hidden bg-gray-50">
            <img
              src="/drone-service-image-v2.webp"
              alt="Aerial drone real estate photography"
              className="absolute inset-0 h-full w-full object-cover"
              loading="eager"
            />
          </div>
        </div>
        <CtaBand title="Add drone to your next listing" location="service_aerial_cta" />
      </main>
      <SiteFooter />
    </div>
  );
}
