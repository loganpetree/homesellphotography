import Link from "next/link";
import { EMAIL, PHONE_DISPLAY, PHONE_E164 } from "@/lib/site";
import BookLink from "@/components/BookLink";

export default function CtaBand({
  title = "Ready to elevate your next listing?",
  subtitle = "Book online in minutes, or call us to talk through the right package.",
  location = "cta_band",
}: {
  title?: string;
  subtitle?: string;
  location?: string;
}) {
  return (
    <section className="bg-gray-50 border border-gray-100 rounded-2xl p-8 md:p-12 text-center my-16">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{title}</h2>
      <p className="text-gray-600 mb-8 max-w-2xl mx-auto">{subtitle}</p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <BookLink
          location={location}
          className="inline-flex items-center justify-center rounded bg-[#22C55E] hover:bg-[#4ADE80] text-white px-6 py-3 font-medium transition-colors"
        >
          Book a Shoot
        </BookLink>
        <a href={`tel:${PHONE_E164}`} className="text-gray-900 hover:text-[#22C55E] font-medium">
          Call {PHONE_DISPLAY}
        </a>
        <a href={`mailto:${EMAIL}`} className="text-gray-600 hover:text-gray-900 text-sm">
          {EMAIL}
        </a>
      </div>
      <p className="mt-6 text-sm text-gray-500">
        Looking for packages? See <Link href="/pricing" className="text-[#22C55E] hover:underline">pricing</Link> or{" "}
        <Link href="/services" className="text-[#22C55E] hover:underline">all services</Link>.
      </p>
    </section>
  );
}
