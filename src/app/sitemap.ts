import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

const paths = [
  "/",
  "/featured-work",
  "/services",
  "/services/property-photography",
  "/services/aerial-photography",
  "/services/floor-plans",
  "/pricing",
  "/about",
  "/testimonials",
  "/dallas-real-estate-photography",
  "/dfw-real-estate-photography",
  "/frisco-real-estate-photography",
  "/plano-real-estate-photography",
  "/mckinney-real-estate-photography",
  "/allen-real-estate-photography",
  "/prosper-real-estate-photography",
  "/arlington-real-estate-photography",
  "/fort-worth-real-estate-photography",
  "/resources/shoot-prep",
  "/resources/drone-vs-stills",
  "/resources/floor-plans-that-sell",
  "/resources/agent-faq",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return paths.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority:
      path === "/"
        ? 1
        : path.includes("real-estate-photography") || path.startsWith("/services")
          ? 0.9
          : path.startsWith("/resources")
            ? 0.75
            : 0.7,
  }));
}
