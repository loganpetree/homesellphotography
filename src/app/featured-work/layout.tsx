import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Featured Work — Real Estate Photo Portfolio",
  description:
    "Browse Homesell Photography’s featured real estate listings — professional property photos from homes across DFW and beyond.",
  alternates: { canonical: "/featured-work" },
  openGraph: {
    title: "Featured Work — Real Estate Photo Portfolio",
    description:
      "Browse Homesell Photography’s featured real estate listings — professional property photos from homes across DFW and beyond.",
    url: "/featured-work",
  },
};

export default function FeaturedWorkLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      {children}
      <SiteFooter />
    </div>
  );
}
