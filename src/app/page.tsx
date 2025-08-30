"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import FavoriteGallery from "@/components/FavoriteGallery";
import { Menu, ArrowRight, Phone, Mail, X } from "lucide-react";
import { useState } from "react";

interface Location {
  left: string;
  top: string;
  label: string;
  size?: 'lg';
}

export default function Home() {
  const [showBanner, setShowBanner] = useState(true);

  return (
    <div className="min-h-screen bg-white">
      {/* Discount Banner */}
      {showBanner && (
        <div className="sticky top-0 z-50 bg-[#22C55E] text-white py-3">
          <div className="max-w-7xl mx-auto px-4 text-center text-sm md:text-base font-medium relative">
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <button
                onClick={() => setShowBanner(false)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
                aria-label="Dismiss banner"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            🏠 Special Offer: 10% discount on all homes with lockbox access! Contact us to learn more.
          </div>
        </div>
      )}
      
      {/* Floating Navigation */}
      <nav className={`fixed ${showBanner ? 'top-14' : 'top-6'} left-1/2 -translate-x-1/2 w-[95%] max-w-7xl bg-white/80 backdrop-blur-xl z-50 rounded-2xl border border-gray-100 shadow-lg transition-[top]`}>
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold tracking-wide text-gray-900">
              Homesell <span className="text-[#22C55E] font-bold">Photography</span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/portfolio" className="text-gray-600 hover:text-gray-900 transition-colors">Portfolio</Link>
              <Link href="/services" className="text-gray-600 hover:text-gray-900 transition-colors">Services</Link>
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</Link>
              <Button 
                className="bg-[#22C55E] hover:bg-[#4ADE80] text-white rounded"
                onClick={() => window.open('https://homesellphotography.hd.pics/order', '_blank')}
              >
                Book a Shoot
              </Button>
            </div>
            
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 bg-gray-50 overflow-hidden">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, #22C55E 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          opacity: 0.1
        }} />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/3 h-96" style={{
          backgroundImage: 'radial-gradient(circle, #22C55E 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px',
          opacity: 0.15
        }} />
        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-block px-4 py-2 bg-white rounded-full text-sm border border-gray-100 shadow-sm">
                Trusted by top real estate professionals
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight text-gray-900">
                Elevate your <span className="text-[#22C55E]">property</span> listings
              </h1>
              <p className="text-gray-600 text-lg md:text-xl max-w-xl">
                Professional real estate photography that captures the essence of every space.
              </p>
              <div className="flex gap-4">
                <Button 
                  className="bg-[#22C55E] hover:bg-[#4ADE80] text-white rounded px-8"
                  onClick={() => window.open('https://homesellphotography.hd.pics/order', '_blank')}
                >
                  Book Now
                </Button>
                <Button variant="outline" className="rounded px-8 border-gray-200 text-gray-700 hover:bg-gray-50">
                  View Portfolio
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
        <Image
                  src="/hero-house.jpg"
                  alt="Beautiful brick home with landscaped yard and outdoor living space"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover hover:scale-105 transition-transform duration-700"
          priority
        />
              </div>
              <div className="absolute -bottom-6 -right-6 w-2/3 aspect-[4/3] rounded-3xl overflow-hidden shadow-xl">
            <Image
                  src="/hero-house-2.jpg"
                  alt="Another view of the luxury home"
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover hover:scale-105 transition-transform duration-700"
                  priority
                  quality={100}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-12 lg:gap-24 max-w-6xl mx-auto w-full">
            {[
              {
                label: "Total Value Represented",
                number: "1.2B+",
                subtitle: "in Real Estate"
              },
              {
                label: "Total Images Captured",
                number: "500k+",
                subtitle: "and Growing"
              },
              {
                label: "Total Views Generated",
                number: "5.1M+",
                subtitle: "Across Platforms"
              },
              {
                label: "Active Users",
                number: "2.5k+",
                subtitle: "Real Estate Pros"
              },
            ].map((stat, i) => (
              <div key={i} className="text-center lg:text-left group flex-1 relative">
                <div className="inline-flex flex-col items-center lg:items-start">
                  <div className="text-sm uppercase tracking-wider text-gray-500 mb-1 group-hover:text-[#22C55E] transition-colors">
                    {stat.label}
                  </div>
                  <div className="relative">
                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#22C55E]/10 rounded-full group-hover:bg-[#22C55E] transition-colors"></div>
                    <div className="text-4xl lg:text-5xl font-black text-gray-900 mb-1">
                      {stat.number}
                    </div>
                  </div>
                  <div className="text-sm text-gray-400 group-hover:text-[#22C55E]/60 transition-colors">
                    {stat.subtitle}
                  </div>
                </div>
                {i < 3 && (
                  <div className="hidden lg:block h-24 w-[1px] bg-gradient-to-b from-transparent via-gray-200 to-transparent absolute right-0 top-1/2 -translate-y-1/2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* Portfolio Grid */}
      <section className="py-20 px-4 bg-gray-50 relative overflow-hidden">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, #22C55E 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          opacity: 0.07
        }} />
        <div className="absolute left-0 bottom-0 w-1/4 h-64" style={{
          backgroundImage: 'radial-gradient(circle, #22C55E 1.5px, transparent 1.5px)',
          backgroundSize: '20px 20px',
          opacity: 0.15
        }} />
        <div className="max-w-7xl mx-auto relative">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Featured <span className="text-[#22C55E]">Work</span></h2>
              <p className="text-gray-600">Showcasing our finest property photography</p>
            </div>
            <Link href="/featured-work">
              <Button variant="ghost" className="hidden md:flex items-center gap-2 text-gray-700 hover:bg-gray-100">
                View All Work <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          <FavoriteGallery userId="showcase" className="mt-4" />
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-900">Our <span className="text-[#22C55E]">Services</span></h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Property Photography",
                description: "High-quality photos that showcase your property in its best light",
                price: "Starting at $199"
              },
              {
                title: "Virtual Tours",
                description: "Immersive 3D tours that let buyers explore every corner",
                price: "Starting at $299"
              },
              {
                title: "Aerial Photography",
                description: "Stunning drone shots that capture the full scope of your property",
                price: "Starting at $249"
              }
            ].map((service, i) => (
              <div key={i} className="group p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="aspect-video rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 mb-6 
                              group-hover:scale-[1.02] transition-transform duration-300" />
                <h3 className="text-xl font-medium mb-2 text-gray-900">{service.title}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <p className="text-sm font-medium text-[#22C55E]">{service.price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What Our Clients Say ❤️</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Hear from real estate professionals who trust us with their property photography needs</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                quote: "Great job. Logan is very attentive to detail and accommodating to the clients' needs. Highly recommended.",
                author: "Brenda Taylor",
                role: "Real Estate Agent",
                company: "RE/MAX Dallas Suburbs",
                avatar: "https://ndrsl-avatars.s3.us-east-2.amazonaws.com/1746376065795-3663.jpg"
              },
              {
                quote: "I have been a REALTOR for over 21 years and I have never gotten such rave reviews of the photography of one of my listings. The clarity and angles of the pictures gave a fabulous representation of the home.",
                author: "Kelly Rudiger",
                role: "REALTOR®",
                company: "Coldwell Banker APEX",
                avatar: "https://ndrsl-avatars.s3.us-east-2.amazonaws.com/1629409929254-1458.jpg"
              },
              {
                quote: "I couldn't be happier with the service that Homesell photography offers. I was able to customize my session and my photographer was professional and extremely helpful.",
                author: "Linda Stearns-Plotkin",
                role: "REALTOR®",
                company: "Realty One Group West",
                avatar: "https://ndrsl-avatars.s3.us-east-2.amazonaws.com/1648671860476-6178.jpg"
              }
            ].map((testimonial, i) => (
              <div key={i} className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 h-full">
                  <div className="mb-6">
                    <div className="absolute -top-3 left-8 text-[#22C55E] text-6xl leading-none">"</div>
                    <p className="text-gray-600 relative z-10 pt-4">{testimonial.quote}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="relative h-12 w-12 rounded-full overflow-hidden bg-gradient-to-br from-[#22C55E]/10 to-[#22C55E]/30">
                      <Image
                        src={testimonial.avatar}
                        alt={`${testimonial.author}'s avatar`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{testimonial.author}</div>
                      <div className="text-sm text-gray-500">{testimonial.role} at {testimonial.company}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/testimonials">
              <Button variant="outline" className="text-gray-600 hover:text-gray-900">
                View All 150+ Reviews
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">Let's <span className="text-[#22C55E]">Connect</span></h2>
              <p className="text-gray-600 mb-8 max-w-xl">
                Ready to elevate your property listings? We're here to help you showcase your properties in their best light.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="bg-[#22C55E] p-3 rounded-xl text-white">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Call us at</div>
                    <a href="tel:+14697800951" className="text-gray-900 hover:text-[#22C55E] transition-colors">(469) 780-0951</a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-[#22C55E] p-3 rounded-xl text-white">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Email us at</div>
                    <a href="mailto:admin@homesellphotography.com" className="text-gray-900 hover:text-[#22C55E] transition-colors">
                      admin@homesellphotography.com
                    </a>
                  </div>
                </div>

              </div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <form className="space-y-6">
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 
                             focus:border-[#10B981] transition-colors placeholder:text-gray-400"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 
                             focus:border-[#10B981] transition-colors placeholder:text-gray-400"
                  />
                  <textarea
                    placeholder="Tell us about your project"
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 
                             focus:border-[#10B981] transition-colors placeholder:text-gray-400"
                  />
                </div>
                <Button className="w-full bg-[#22C55E] hover:bg-[#4ADE80] text-white rounded py-6">
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Floating Book Now Button */}
      <div className="md:hidden fixed bottom-6 left-4 right-4 z-50">
        <Button 
          className="w-full bg-[#22C55E] hover:bg-[#4ADE80] text-white rounded-xl py-6 shadow-lg"
          onClick={() => window.open('https://homesellphotography.hd.pics/order', '_blank')}
        >
          Book Now
        </Button>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12 px-4 md:pb-12 pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div>
              <div className="text-2xl tracking-wide mb-4 text-gray-900">
                Homesell <span className="text-[#22C55E]">Photography</span>
              </div>
              <p className="text-gray-500 text-sm">
                Professional real estate photography services in Little Rock and surrounding areas.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-4 text-gray-900">Services</h4>
              <div className="space-y-2 text-gray-500">
                <div className="hover:text-gray-900 transition-colors cursor-pointer">Property Photography</div>
                <div className="hover:text-gray-900 transition-colors cursor-pointer">Virtual Tours</div>
                <div className="hover:text-gray-900 transition-colors cursor-pointer">Aerial Photography</div>
                <div className="hover:text-gray-900 transition-colors cursor-pointer">Video Tours</div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-4 text-gray-900">Company</h4>
              <div className="space-y-2 text-gray-500">
                <div className="hover:text-gray-900 transition-colors cursor-pointer">About Us</div>
                <div className="hover:text-gray-900 transition-colors cursor-pointer">Portfolio</div>
                <div className="hover:text-gray-900 transition-colors cursor-pointer">Pricing</div>
                <div className="hover:text-gray-900 transition-colors cursor-pointer">Contact</div>
              </div>
            </div>

          </div>
          <div className="border-t border-gray-100 mt-12 pt-8 text-center text-gray-500 text-sm">
            © 2024 Homesell Photography. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}