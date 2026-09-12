import type { Metadata } from "next";
import Image from "next/image";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CtaBand from "@/components/CtaBand";

export const metadata: Metadata = {
  title: "Aerial & Drone Real Estate Photography",
  description:
    "FAA-conscious drone photography for DFW listings — capture lots, pools, roof lines, and neighborhood context.",
  alternates: { canonical: "/services/aerial-photography" },
};

export default function AerialPhotographyPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Aerial <span className="text-[#22C55E]">Photography</span>
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Drone media shows what ground photos cannot: lot size, outdoor living, proximity to amenities, and how the
              home sits in the neighborhood.
            </p>
            <ul className="space-y-3 text-gray-700">
              <li>• Establishing shots that stop the scroll</li>
              <li>• Great for acreage, pools, golf communities, and new builds</li>
              <li>• Complements still packages for fuller marketing kits</li>
            </ul>
          </div>
          <div className="relative h-72 md:h-96 rounded-2xl overflow-hidden">
            <Image
              src="/drone.jpg"
              alt="Aerial drone real estate photography over a property"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>
        </div>
        <CtaBand title="Add drone photos to your next shoot" />
      </main>
      <SiteFooter />
    </div>
  );
}
