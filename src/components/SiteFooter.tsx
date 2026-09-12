import Link from "next/link";
import { SITE_NAME } from "@/lib/site";

export default function SiteFooter() {
  return (
    <footer className="bg-white border-t border-gray-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="text-2xl tracking-wide mb-4 text-gray-900">
              Homesell <span className="text-[#22C55E]">Photography</span>
            </div>
            <p className="text-gray-500 text-sm">
              Professional real estate photography for agents across Dallas–Fort Worth and surrounding markets.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-4 text-gray-900">Services</h4>
            <div className="space-y-2 text-gray-500 text-sm">
              <Link href="/services/property-photography" className="block hover:text-gray-900 transition-colors">Property Photography</Link>
              <Link href="/services/floor-plans" className="block hover:text-gray-900 transition-colors">Floor Plans &amp; Mapping</Link>
              <Link href="/services/aerial-photography" className="block hover:text-gray-900 transition-colors">Aerial Photography</Link>
              <Link href="/pricing" className="block hover:text-gray-900 transition-colors">Pricing</Link>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-4 text-gray-900">Markets</h4>
            <div className="space-y-2 text-gray-500 text-sm">
              <Link href="/dallas-real-estate-photography" className="block hover:text-gray-900 transition-colors">Dallas</Link>
              <Link href="/dfw-real-estate-photography" className="block hover:text-gray-900 transition-colors">DFW Metroplex</Link>
              <Link href="/frisco-real-estate-photography" className="block hover:text-gray-900 transition-colors">Frisco</Link>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-4 text-gray-900">Company</h4>
            <div className="space-y-2 text-gray-500 text-sm">
              <Link href="/about" className="block hover:text-gray-900 transition-colors">About Us</Link>
              <Link href="/featured-work" className="block hover:text-gray-900 transition-colors">Portfolio</Link>
              <Link href="/services" className="block hover:text-gray-900 transition-colors">All Services</Link>
              <a href="mailto:admin@homesellphotography.com" className="block hover:text-gray-900 transition-colors">Contact</a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-100 mt-12 pt-8 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
