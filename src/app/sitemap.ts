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
  "/dallas-real-estate-photography",
  "/dfw-real-estate-photography",
  "/frisco-real-estate-photography",
  "/testimonials",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return paths.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path.startsWith("/dallas") || path.startsWith("/dfw") || path.startsWith("/services") ? 0.9 : 0.7,
  }));
}
