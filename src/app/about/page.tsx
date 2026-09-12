import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CtaBand from "@/components/CtaBand";

export const metadata: Metadata = {
  title: "About Homesell Photography",
  description:
    "Homesell Photography provides professional real estate media for listing agents across Dallas–Fort Worth — reliable scheduling, sharp photos, fast delivery.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          About <span className="text-[#22C55E]">Homesell</span>
        </h1>
        <div className="space-y-5 text-gray-600 text-lg">
          <p>
            Homesell Photography exists to make listing media easy for busy agents. Book online, get a professional on
            site, and receive polished photos that help your listing compete.
          </p>
          <p>
            We focus on Dallas–Fort Worth and surrounding communities, with coverage that also supports agents who need
            help outside their usual photographer network. Our clients include agents at Keller Williams, RE/MAX, Ebby
            Halliday, eXp, and independents across the metroplex.
          </p>
          <p>
            Beyond still photography, we offer aerial/drone media and floor plans so you can match the package to the
            property — not force every home into the same shoot.
          </p>
        </div>
        <CtaBand title="Work with Homesell on your next listing" />
      </main>
      <SiteFooter />
    </div>
  );
}
