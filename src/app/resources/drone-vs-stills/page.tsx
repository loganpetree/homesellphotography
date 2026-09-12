import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CtaBand from "@/components/CtaBand";
import BookLink from "@/components/BookLink";

export const metadata: Metadata = {
  title: "Drone vs Still Photos for Real Estate",
  description:
    "When DFW listings need drone/aerial photography versus polished stills — lot size, pools, acreage, and condo guidance for agents.",
  alternates: { canonical: "/resources/drone-vs-stills" },
};

export default function Page() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <main className="max-w-7xl mx-auto px-4 py-12">
        <p className="text-sm font-medium text-[#22C55E] mb-3">Agent resources</p>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Drone vs <span className="text-[#22C55E]">stills</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mb-10">
          Not every listing needs a drone. Here is a simple way to choose media that matches the property — without overspending.
        </p>
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="rounded-2xl border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Lead with stills when…</h2>
            <ul className="space-y-2 text-gray-600">
              <li>• The story is interiors, finishes, and kitchen/living flow</li>
              <li>• The lot is typical suburban and neighbors are close</li>
              <li>• Condos or townhomes where rooftop context adds little</li>
              <li>• You need a fast, clean MLS set for a price-point listing</li>
            </ul>
            <p className="mt-4 text-sm">
              <Link href="/services/property-photography" className="text-[#22C55E] hover:underline">Property photography →</Link>
            </p>
          </div>
          <div className="rounded-2xl border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Add drone when…</h2>
            <ul className="space-y-2 text-gray-600">
              <li>• Pool, sports court, or large backyard is a selling point</li>
              <li>• Acreage, corner lots, or unique lot lines matter</li>
              <li>• New builds where buyers want neighborhood context</li>
              <li>• Commercial-adjacent or waterfront-style views (where legal)</li>
            </ul>
            <p className="mt-4 text-sm">
              <Link href="/services/aerial-photography" className="text-[#22C55E] hover:underline">Aerial / drone →</Link>
            </p>
          </div>
        </div>
        <div className="relative h-56 md:h-72 rounded-2xl overflow-hidden bg-gray-50 mb-10 max-w-3xl">
          <img
            src="/drone-service-image-v2.webp"
            alt="Aerial real estate photography example"
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
        </div>
        <p className="text-gray-600 max-w-3xl mb-6">
          Many agents book stills plus aerial on{" "}
          <Link href="/prosper-real-estate-photography" className="text-[#22C55E] hover:underline">Prosper</Link> and{" "}
          <Link href="/frisco-real-estate-photography" className="text-[#22C55E] hover:underline">Frisco</Link> new builds.
          See <Link href="/pricing" className="text-[#22C55E] hover:underline">pricing options</Link> or the{" "}
          <Link href="/resources/agent-faq" className="text-[#22C55E] hover:underline">agent FAQ</Link>.
        </p>
        <BookLink
          location="resource_drone_vs_stills"
          className="inline-flex items-center justify-center rounded bg-[#22C55E] hover:bg-[#4ADE80] text-white px-6 py-3 font-medium transition-colors"
        >
          Book photos or drone
        </BookLink>
        <CtaBand title="Get the right mix for this listing" location="resource_drone_cta" />
      </main>
      <SiteFooter />
    </div>
  );
}
