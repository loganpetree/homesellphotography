import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CtaBand from "@/components/CtaBand";
import BookLink from "@/components/BookLink";
import { PHONE_DISPLAY, PHONE_E164, EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Real Estate Photography FAQ for Agents",
  description:
    "FAQ for DFW listing agents: turnaround, booking, packages, drone, floor plans, occupied homes, and how Homesell Photography works.",
  alternates: { canonical: "/resources/agent-faq" },
};

const faqs = [
  {
    q: "How do I book?",
    a: "Use our online booking link to pick a time for the property address. You will see package options based on the home — no invented flat rates on this site.",
  },
  {
    q: "How fast is turnaround?",
    a: "Most standard photo sets deliver quickly after the shoot so you can go live on MLS on schedule. Ask when you book if you have a hard launch deadline.",
  },
  {
    q: "Do you shoot occupied homes?",
    a: "Yes. Share access instructions and prep tips with sellers. Our shoot prep guide helps occupied listings look their best.",
  },
  {
    q: "When should I add drone or floor plans?",
    a: "Drone helps with lots, pools, and acreage. Floor plans help with multi-level or open layouts. See our drone vs stills and floor plans guides.",
  },
  {
    q: "Where do you serve?",
    a: "Dallas–Fort Worth and surrounding markets including Dallas, Frisco, Plano, McKinney, Allen, Prosper, Arlington, and Fort Worth.",
  },
];

export default function Page() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <main className="max-w-7xl mx-auto px-4 py-12">
        <p className="text-sm font-medium text-[#22C55E] mb-3">Agent resources</p>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Agent <span className="text-[#22C55E]">FAQ</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mb-10">
          Quick answers for DFW listing agents. Prefer to talk it through? Call{" "}
          <a href={`tel:${PHONE_E164}`} className="text-[#22C55E] hover:underline">{PHONE_DISPLAY}</a> or email{" "}
          <a href={`mailto:${EMAIL}`} className="text-[#22C55E] hover:underline">{EMAIL}</a>.
        </p>
        <div className="space-y-6 max-w-3xl mb-12">
          {faqs.map((f) => (
            <div key={f.q} className="rounded-2xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">{f.q}</h2>
              <p className="text-gray-600 text-sm">{f.a}</p>
            </div>
          ))}
        </div>
        <p className="text-gray-600 max-w-3xl mb-6">
          Related:{" "}
          <Link href="/resources/shoot-prep" className="text-[#22C55E] hover:underline">shoot prep</Link>,{" "}
          <Link href="/pricing" className="text-[#22C55E] hover:underline">pricing</Link>,{" "}
          <Link href="/testimonials" className="text-[#22C55E] hover:underline">testimonials</Link>,{" "}
          <Link href="/dfw-real-estate-photography" className="text-[#22C55E] hover:underline">DFW coverage</Link>.
        </p>
        <BookLink
          location="resource_agent_faq"
          className="inline-flex items-center justify-center rounded bg-[#22C55E] hover:bg-[#4ADE80] text-white px-6 py-3 font-medium transition-colors"
        >
          Book online now
        </BookLink>
        <CtaBand title="Still have questions? Book and note them" location="resource_faq_cta" />
      </main>
      <SiteFooter />
    </div>
  );
}
