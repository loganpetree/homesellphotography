import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CtaBand from "@/components/CtaBand";
import BookLink from "@/components/BookLink";

export const metadata: Metadata = {
  title: "Real Estate Photography Pricing",
  description:
    "Transparent package options for DFW real estate photography — photos, drone, and floor plans. Book online for an exact quote based on your property.",
  alternates: { canonical: "/pricing" },
};

const packages = [
  {
    name: "Essentials",
    ideal: "Most single-family listings",
    includes: ["Professional interior & exterior photos", "MLS-ready edits", "Fast digital delivery"],
  },
  {
    name: "Gold",
    ideal: "Agents who want standout marketing",
    includes: [
      "Full photo set",
      "Aerial / drone add-on when the lot calls for it",
      "Priority scheduling where available",
    ],
  },
  {
    name: "Complete Media",
    ideal: "Luxury, acreage, or complex layouts",
    includes: ["Photography + aerial", "Floor plans / mapping", "Coordinated delivery for your listing launch"],
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <main className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Photography <span className="text-[#22C55E]">Pricing</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mb-4">
          Final pricing depends on square footage, package options, travel, and add-ons like drone or floor plans.
          Book online to see live options for your address — or call us if you want help choosing.
        </p>
        <p className="text-sm text-gray-500 mb-8">
          Agents often mention our Gold Package in reviews; we tailor the shoot to the home, not a one-size kit.
        </p>
        <div className="mb-12">
          <BookLink
            location="pricing_hero"
            className="inline-flex items-center justify-center rounded bg-[#22C55E] hover:bg-[#4ADE80] text-white px-6 py-3 font-semibold transition-colors"
          >
            Get live pricing — book online
          </BookLink>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {packages.map((pkg) => (
            <div key={pkg.name} className="rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col">
              <h2 className="text-xl font-semibold text-gray-900 mb-1">{pkg.name}</h2>
              <p className="text-sm text-[#22C55E] mb-4">{pkg.ideal}</p>
              <ul className="space-y-2 text-gray-600 text-sm mb-6 flex-1">
                {pkg.includes.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
              <BookLink
                location={`pricing_card_${pkg.name.toLowerCase().replace(/\s+/g, "_")}`}
                className="inline-flex w-full justify-center rounded bg-[#22C55E] hover:bg-[#4ADE80] text-white px-4 py-2.5 font-medium transition-colors"
              >
                Get exact pricing
              </BookLink>
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-gray-50 p-8 max-w-3xl">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">What affects your quote?</h2>
          <ul className="space-y-2 text-gray-600">
            <li>• Home size and number of spaces to capture</li>
            <li>• Whether you need drone, floor plans, or twilight</li>
            <li>• Location within our DFW service area</li>
            <li>• Occupied vs. vacant scheduling needs</li>
          </ul>
        </div>

        <CtaBand
          title="See live pricing for your listing"
          subtitle="Enter the property in booking to get the right package without back-and-forth."
          location="pricing_cta"
        />
      </main>
      <SiteFooter />
    </div>
  );
}
