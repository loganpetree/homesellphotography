import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CtaBand from "@/components/CtaBand";

export const metadata: Metadata = {
  title: "Real Estate Photography Services",
  description:
    "Property photography, aerial drone shots, and floor plans for DFW listing agents. Fast scheduling and delivery from Homesell Photography.",
  alternates: { canonical: "/services" },
};

const services = [
  {
    href: "/services/property-photography",
    title: "Property Photography",
    blurb: "Bright, listing-ready stills that showcase every room and sell the lifestyle.",
    image: "/drone-service-image-v2.webp",
  },
  {
    href: "/services/aerial-photography",
    title: "Aerial / Drone Photography",
    blurb: "Roofline, lot lines, pools, and neighborhood context from above.",
    image: "/drone-service-image-v2.webp",
  },
  {
    href: "/services/floor-plans",
    title: "Floor Plans & Mapping",
    blurb: "Clear floor plans and property mapping so buyers understand the layout fast.",
    image: "/floorplan.png",
  },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <main className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Real Estate Photography <span className="text-[#22C55E]">Services</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mb-12">
          Homesell Photography helps Dallas-Fort Worth agents book professional media that gets listings noticed —
          still photos, drone coverage, and floor plans with reliable turnaround.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service) => (
            <Link
              key={service.href}
              href={service.href}
              className="group rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative h-48 bg-gray-100 overflow-hidden">
                {/* Native img avoids build-time sharp processing of multi-MB assets */}
                <img
                  src={service.image}
                  alt={service.title}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 group-hover:text-[#22C55E] transition-colors mb-2">
                  {service.title}
                </h2>
                <p className="text-gray-600 text-sm">{service.blurb}</p>
              </div>
            </Link>
          ))}
        </div>

        <CtaBand />
      </main>
      <SiteFooter />
    </div>
  );
}
