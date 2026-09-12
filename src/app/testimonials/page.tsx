"use client";

import Link from "next/link";
import { User } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CtaBand from "@/components/CtaBand";
import BookLink from "@/components/BookLink";

/** Sample / replaceable DFW-agent-style quotes (swap with live agent feedback anytime). */
const testimonials = [
  {
    quote: "Great job. Logan is very attentive to detail and accommodating to the clients' needs. Highly recommended.",
    author: "Brenda Taylor",
    role: "Real Estate Agent",
    company: "RE/MAX Dallas Suburbs",
    location: "Plano, TX",
  },
  {
    quote: "Logan was on time, professional and quick. The photos came out beautiful and the turnaround time was fast and efficient.",
    author: "Amber Bekkali",
    role: "REALTOR®",
    company: "TX Home Choice",
    location: "Dallas, TX",
  },
  {
    quote: "Amazing communication. Beautiful media. Flexible schedules. I highly recommend the Gold Package!",
    author: "Tiara Glenn",
    role: "REALTOR®",
    company: "Keller Williams Heritage West",
    location: "Weatherford, TX",
  },
  {
    quote: "Homesell Photography did a wonderful job with the photography for both my listings this year. Skilled, punctual, and professional.",
    author: "Brendan R Hirschmann",
    role: "REALTOR®",
    company: "Ebby Halliday",
    location: "Forney, TX",
  },
  {
    quote: "Very professional photographers. I highly recommend them.",
    author: "Sam Duraini",
    role: "REALTOR®",
    company: "Keller Williams Frisco Stars",
    location: "Frisco, TX",
  },
  {
    quote: "The end product was fantastic! Loved our photographer. Thank you, Homesell!",
    author: "Caryn Schniederjan",
    role: "REALTOR®",
    company: "REMAX DFW Associates",
    location: "Frisco, TX",
  },
  {
    quote: "Always on time and very professional! The photos never disappoint.",
    author: "Vanessa Monasterial",
    role: "REALTOR®",
    company: "Century 21 Judge Fite Company",
    location: "Dallas, TX",
  },
  {
    quote: "Homesell Photography is the easiest to make appointments and the pictures are fantastic.",
    author: "Debbie Warford",
    role: "REALTOR®",
    company: "Home Solutions Realty",
    location: "DFW, TX",
  },
  {
    quote: "I have been a REALTOR for over 21 years and I have never gotten such rave reviews of the photography of one of my listings.",
    author: "Kelly Rudiger",
    role: "REALTOR®",
    company: "Coldwell Banker APEX",
    location: "McKinney, TX",
  },
  {
    quote: "We had to change appointment times due to the homeowner's schedule and Homesell took it all in stride. The pictures were terrific.",
    author: "Keith Gardner",
    role: "REALTOR®",
    company: "RE/MAX ProAdvantage",
    location: "McKinney, TX",
  },
  {
    quote: "It is always a pleasure doing business with Homesell Photography. Very professional and the photos are outstanding every time!",
    author: "Kim Lewison",
    role: "REALTOR®",
    company: "Core One Real Estate",
    location: "Princeton, TX",
  },
  {
    quote: "Scheduling was so easy! They showed up early and we finished on time. My clients were very happy with the service.",
    author: "Rebecca Ross",
    role: "REALTOR®",
    company: "Keller Williams Realty",
    location: "Flower Mound, TX",
  },
];

export default function Testimonials() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-10">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900">
            Client <span className="text-[#22C55E]">Testimonials</span>
          </h1>
          <p className="text-gray-600 mt-3 max-w-3xl">
            What DFW agents say about Homesell Photography — quality, communication, and fast delivery.
            Quotes below are sample/replaceable content you can swap with fresh agent feedback anytime.
          </p>
          <div className="mt-6">
            <BookLink
              location="testimonials_hero"
              className="inline-flex items-center justify-center rounded bg-[#22C55E] hover:bg-[#4ADE80] text-white px-6 py-3 font-medium transition-colors"
            >
              Book a Shoot
            </BookLink>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, i) => (
            <div key={i} className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 h-full">
                <div className="mb-6">
                  <div className="absolute -top-3 left-8 text-[#22C55E] text-6xl leading-none">&ldquo;</div>
                  <p className="text-gray-600 relative z-10 pt-4">{testimonial.quote}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#22C55E]/10 to-[#22C55E]/30 flex items-center justify-center shrink-0">
                    <User className="h-6 w-6 text-[#22C55E]" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{testimonial.author}</div>
                    <div className="text-sm text-gray-500">
                      {testimonial.role} at {testimonial.company}
                    </div>
                    <div className="text-sm text-[#22C55E]">{testimonial.location}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-sm text-gray-500 mt-10 max-w-3xl">
          Explore <Link href="/dallas-real-estate-photography" className="text-[#22C55E] hover:underline">Dallas</Link>,{" "}
          <Link href="/frisco-real-estate-photography" className="text-[#22C55E] hover:underline">Frisco</Link>, and{" "}
          <Link href="/resources/agent-faq" className="text-[#22C55E] hover:underline">agent FAQ</Link> for next steps.
        </p>
        <CtaBand title="Join DFW agents who book Homesell" location="testimonials_cta" />
      </main>
      <SiteFooter />
    </div>
  );
}
