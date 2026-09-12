import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CtaBand from "@/components/CtaBand";
import BookLink from "@/components/BookLink";

export const metadata: Metadata = {
  title: "Listing Photo Shoot Prep Checklist",
  description:
    "A practical prep checklist so your DFW real estate photo shoot looks MLS-ready — declutter, lighting, exterior, and timing tips for agents.",
  alternates: { canonical: "/resources/shoot-prep" },
};

const tips = [
  { title: "Declutter surfaces", body: "Clear counters, nightstands, and fridge magnets. Buyers notice empty space more than décor." },
  { title: "Let in the light", body: "Open blinds and curtains. Turn on lamps and overheads so rooms feel bright on camera." },
  { title: "Exterior first impressions", body: "Cars out of driveway when possible, trash bins hidden, and lawn edges tidy for curb appeal." },
  { title: "Pets & people", body: "Plan for pets off-site or contained. Empty rooms photograph cleaner and sell lifestyle better." },
  { title: "Timing", body: "Morning and late afternoon often flatter exteriors. Tell us about HOA gate codes when you book." },
];

export default function Page() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <main className="max-w-7xl mx-auto px-4 py-12">
        <p className="text-sm font-medium text-[#22C55E] mb-3">Agent resources</p>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Listing shoot <span className="text-[#22C55E]">prep checklist</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mb-8">
          A little prep before we arrive turns good photos into great ones. Share this with sellers the day before your Homesell shoot.
        </p>
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {tips.map((t) => (
            <div key={t.title} className="rounded-2xl border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{t.title}</h2>
              <p className="text-gray-600 text-sm">{t.body}</p>
            </div>
          ))}
        </div>
        <p className="text-gray-600 max-w-3xl mb-6">
          Deciding between stills and aerial? Read{" "}
          <Link href="/resources/drone-vs-stills" className="text-[#22C55E] hover:underline">drone vs stills</Link>.
          Need layout clarity? See{" "}
          <Link href="/resources/floor-plans-that-sell" className="text-[#22C55E] hover:underline">floor plans that sell</Link>.
        </p>
        <BookLink
          location="resource_shoot_prep"
          className="inline-flex items-center justify-center rounded bg-[#22C55E] hover:bg-[#4ADE80] text-white px-6 py-3 font-medium transition-colors"
        >
          Book your next shoot
        </BookLink>
        <CtaBand title="Schedule photography after prep" location="resource_shoot_prep_cta" />
      </main>
      <SiteFooter />
    </div>
  );
}
