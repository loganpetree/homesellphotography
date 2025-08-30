"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import FavoriteGallery from "@/components/FavoriteGallery";
import { Menu, ArrowRight, Phone, Mail, X, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { getFavorites } from '@/lib/favorites';
import { db } from '@/lib/firebase-client';
import { doc, getDoc } from 'firebase/firestore';
import type { FirebaseSite, FirebaseMedia } from '@/types/site';
import type { FavoriteMedia } from '@/types/favorites';


interface Location {
  left: string;
  top: string;
  label: string;
  size?: 'lg';
}

interface ShowcaseImage {
  mediaId: string;
  siteId: string;
  url: string;
  smallUrl?: string;
  mediumUrl?: string;
  largeUrl?: string;
  name: string;
  siteName: string;
  location: string;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getLocationInfo(siteData: any): { address: string; location: string } {
  let street = 'Address not available';
  let city = '';
  let state = '';

  if (typeof siteData.address === 'object' && siteData.address !== null) {
    street = siteData.address.street || 'Address not available';
    city = siteData.address.city || '';
    state = siteData.address.state || '';
  }

  const locationParts = [];
  if (city) locationParts.push(city);
  if (state) locationParts.push(state);

  return {
    address: street,
    location: locationParts.join(', ') || 'Location not available'
  };
}

export default function Home() {
  const [showBanner, setShowBanner] = useState(true);
  const [heroImages, setHeroImages] = useState<ShowcaseImage[]>([]);
  const [heroImagesLoading, setHeroImagesLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [waterfallImages, setWaterfallImages] = useState<ShowcaseImage[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);


  const testimonials = [
    {
      quote: "Great job. Logan is very attentive to detail and accommodating to the clients' needs. Highly recommended.",
      author: "Brenda Taylor",
      role: "Real Estate Agent",
      company: "RE/MAX Dallas Suburbs",
      avatar: "https://ndrsl-avatars.s3.us-east-2.amazonaws.com/1746376065795-3663.jpg"
    },
    {
      quote: "Logan was on time, professional and quick. The photos came out beautiful and the turnaround time was fast and efficient. Thank you!",
      author: "Amber Bekkali",
      role: "REALTOR®",
      company: "TX Home Choice",
      avatar: "https://ndrsl-avatars.s3.us-east-2.amazonaws.com/1746216933362-8811.jpg"
    },
    {
      quote: "Amazing communication. Beautiful media. Flexible schedules. I highly recommend the Gold Package!",
      author: "Tiara Glenn",
      role: "REALTOR®",
      company: "Keller Williams Heritage West",
      avatar: "https://ndrsl-avatars.s3.us-east-2.amazonaws.com/1708706624942-9906.jpg"
    },
    {
      quote: "Homesell Photography did a wonderful job with the photography for both my listings this year. They are very skilled, knowledgeable, punctual and professional.",
      author: "Brendan R Hirschmann",
      role: "REALTOR®",
      company: "Ebby Halliday",
      avatar: "https://ndrsl-avatars.s3.us-east-2.amazonaws.com/1696689106535-5034.jpg"
    },
    {
      quote: "Very professional photographers. I highly recommend them.",
      author: "Sam Duraini",
      role: "REALTOR®",
      company: "Keller Williams Frisco Stars",
      avatar: "https://ndrsl-avatars.s3.us-east-2.amazonaws.com/1685720607891-1700.jpg"
    },
    {
      quote: "The end product was fantastic! Loved our photographer. Thank you, Homesell!",
      author: "Caryn Schniederjan",
      role: "REALTOR®",
      company: "REMAX DFW Associates",
      avatar: "https://ndrsl-avatars.s3.us-east-2.amazonaws.com/1685202793223-7649.jpg"
    },
    {
      quote: "Pictures came out excellent! Great service!",
      author: "Tina Wright",
      role: "REALTOR®",
      company: "eXp Realty",
      avatar: "https://ndrsl-avatars.s3.us-east-2.amazonaws.com/1680881026594-5339.jpg"
    },
    {
      quote: "HomeSell Photography provides outstanding photographer that made my listing more attractive, the way displayed the listing on website is gorgeous!",
      author: "John Wu",
      role: "REALTOR®",
      company: "eXp Realty of California",
      avatar: "https://ndrsl-avatars.s3.us-east-2.amazonaws.com/1675909501859-5750.jpg"
    },
    {
      quote: "Very professional, on time and great quality. Client loved the pictures.",
      author: "Manny Morales",
      role: "REALTOR®",
      company: "HomeSmart",
      avatar: "https://ndrsl-avatars.s3.us-east-2.amazonaws.com/1672513430899-9690.jpg"
    },
    {
      quote: "We are always very impressed with the photos when we use Homesell Photography",
      author: "Julie Shuler",
      role: "REALTOR®",
      company: "Ebby Halliday",
      avatar: "https://ndrsl-avatars.s3.us-east-2.amazonaws.com/1664834010927-5579.jpg"
    },
    {
      quote: "Always on time and very professional! The photos never disappoint.",
      author: "Vanessa Monasterial",
      role: "REALTOR®",
      company: "Century 21 Judge Fite Company",
      avatar: "https://ndrsl-avatars.s3.us-east-2.amazonaws.com/1663800889219-5019.jpg"
    },
    {
      quote: "The photos were delivered as promised and the quality was excellent.",
      author: "Vanessa Monasterial",
      role: "REALTOR®",
      company: "Century 21 Judge Fite Company",
      avatar: "https://ndrsl-avatars.s3.us-east-2.amazonaws.com/1659330892020-7224.jpg"
    },
    {
      quote: "Awesome work; photos are always amazing. The level of detail comes thru.",
      author: "Shettie Blue",
      role: "REALTOR®",
      company: "Blue Enterprises",
      avatar: "https://ndrsl-avatars.s3.us-east-2.amazonaws.com/1658244328289-2223.jpg"
    },
    {
      quote: "I had a listing in Fontana, CA and didn't know any photographers in the area. I used Homesell to book a photographer and I was pleasantly surprised. They took great photos and they were ready very fast. I'll be using them again!",
      author: "Rochelle Hewitt",
      role: "REALTOR®",
      company: "Bayside Real Estate Partners",
      avatar: "https://ndrsl-avatars.s3.us-east-2.amazonaws.com/1657562863668-6036.jpg"
    },
    {
      quote: "Homesell Photography is the easiest to make appointments and the pictures are fantastic. You have to book them for your next photo shoot.",
      author: "Debbie Warford",
      role: "REALTOR®",
      company: "Home Solutions Realty",
      avatar: "https://ndrsl-avatars.s3.us-east-2.amazonaws.com/1656089374313-3641.jpg"
    },
    {
      quote: "Homesell Photography did a fantastic job shooting a beautiful estate on 2.4 acres with guest house, pool, cabana, greenhouse etc… my client loved it and I will absolutely contact them again!",
      author: "Von Truong",
      role: "REALTOR®",
      company: "RE/MAX DFW Associates",
      avatar: "https://ndrsl-avatars.s3.us-east-2.amazonaws.com/1654960768365-5698.jpg"
    },
    {
      quote: "Scheduling was so easy! They showed up early and we finished on time. My clients were very happy with the service.",
      author: "Rebecca Ross",
      role: "REALTOR®",
      company: "KELLER Williams Realty",
      avatar: "https://ndrsl-avatars.s3.us-east-2.amazonaws.com/1651165530433-8300.jpg"
    },
    {
      quote: "Great photos, showed the home beautifully!",
      author: "Nicole Fox",
      role: "REALTOR®",
      company: "Keller Williams",
      avatar: "https://ndrsl-avatars.s3.us-east-2.amazonaws.com/1650317184424-4182.jpg"
    },
    {
      quote: "Great services at a great price. I always get the photos on time and highly recommend their services!",
      author: "Nick Farr",
      role: "REALTOR®",
      company: "Harry Norman, Realtors",
      avatar: "https://ndrsl-avatars.s3.us-east-2.amazonaws.com/1648777481398-6651.jpg"
    },
    {
      quote: "I couldn't be happier with the service that Homesell photography offers. I was able to customize my session and my photographer was professional and extremely helpful. I will certainly be using them again!",
      author: "Linda Stearns-Plotkin",
      role: "REALTOR®",
      company: "Realty One Group West",
      avatar: "https://ndrsl-avatars.s3.us-east-2.amazonaws.com/1648671860476-6178.jpg"
    },
    {
      quote: "Homesell Photography was excellent. Photographer was on time, courteous and professional. The photos were amazing and captured all the best qualities of the property.",
      author: "Jeff Wong",
      role: "REALTOR®",
      company: "Westside Estate Agency",
      avatar: "https://ndrsl-avatars.s3.us-east-2.amazonaws.com/1642374973813-507.jpg"
    },
    {
      quote: "I have been a REALTOR for over 21 years and I have never gotten such rave reviews of the photography of one of my listings. The clarity and angles of the pictures gave a fabulous representation of the home.",
      author: "Kelly Rudiger",
      role: "REALTOR®",
      company: "Coldwell Banker APEX",
      avatar: "https://ndrsl-avatars.s3.us-east-2.amazonaws.com/1629409929254-1458.jpg"
    },
    {
      quote: "I am so happy with Homesell Photography! The customer service is very easy to work with. My clients are very happy with the result of the property website and the quality of their photos. Highly recommended!",
      author: "Inna Santoso",
      role: "REALTOR®",
      company: "Keller Williams Realty Brentwood",
      avatar: "https://ndrsl-avatars.s3.us-east-2.amazonaws.com/1634230496460-6567.jpg"
    },
    {
      quote: "Both myself and my client were extremely happy with the quality of the photography and look forward to using Homesell Photography on my next listing!",
      author: "Sandy D",
      role: "REALTOR®",
      company: "Equity Los Angeles",
      avatar: "https://ndrsl-avatars.s3.us-east-2.amazonaws.com/1631733518852-3941.jpg"
    },
    {
      quote: "High quality photos at a great price. Received them in less than 24 hours. Very satisfied.",
      author: "Jonathan Busby",
      role: "REALTOR®",
      company: "Westside Estate Agency",
      avatar: "https://ndrsl-avatars.s3.us-east-2.amazonaws.com/1631670335902-3610.jpg"
    },
    {
      quote: "Homesell Photography provides great communication, prompt scheduling, professional photographers and high quality photo packages as promised! Great experience!",
      author: "Steven Scavone",
      role: "REALTOR®",
      company: "Shorepointe Real Estate Associates",
      avatar: "https://ndrsl-avatars.s3.us-east-2.amazonaws.com/1631651467711-951.jpg"
    },
    {
      quote: "We had to change appointment times due to the homeowner's schedule and Homesell Photography took it all in stride. The pictures were absolutely terrific and the number of people viewing our property was incredible.",
      author: "Keith Gardner",
      role: "REALTOR®",
      company: "RE/MAX ProAdvantage",
      avatar: "https://ndrsl-avatars.s3.us-east-2.amazonaws.com/1631636116129-8374.jpg"
    },
    {
      quote: "Photos and services provided were superb! Will continue to use for my listings. I highly recommend!",
      author: "Kyle Cleland",
      role: "REALTOR®",
      company: "Keller Williams Realty Atlanta Partners Tucker",
      avatar: "https://ndrsl-avatars.s3.us-east-2.amazonaws.com/1631117850992-2880.jpg"
    },
    {
      quote: "I was very pleased with the photos provided by Homesell Photography. The photographer was on time for our appointment and took excellent drone shots as well. I look forward to working with Homesell again.",
      author: "Michelle Johnson",
      role: "REALTOR®",
      company: "PalmerHouse Properties",
      avatar: "https://ndrsl-avatars.s3.us-east-2.amazonaws.com/1630623311312-4402.jpg"
    },
    {
      quote: "The pictures look great and had a fast turn around time!",
      author: "Than Maynard",
      role: "REALTOR®",
      company: "Coldwell Banker Heart of Oklahoma",
      avatar: "https://ndrsl-avatars.s3.us-east-2.amazonaws.com/1630615530878-6392.jpg"
    },
    {
      quote: "It is always a pleasure doing business with Homesell Photography. Very professional and the photos are outstanding every time!",
      author: "Kim Lewison",
      role: "REALTOR®",
      company: "Core One Real Estate",
      avatar: "https://ndrsl-avatars.s3.us-east-2.amazonaws.com/1630509142044-3578.jpg"
    }
  ];

  // Fetch random showcase images for hero
  useEffect(() => {
    async function fetchShowcaseImages() {
      try {
        const favorites = await getFavorites('showcase');
        if (!favorites) {
          setHeroImagesLoading(false);
          return;
        }

        // Shuffle and get more images to have a good selection
        const shuffledMedia = shuffleArray(favorites.media).slice(0, 20);
        const shuffledSites = shuffleArray(favorites.sites).slice(0, 20);

        // Fetch all sites in parallel
        const sitePromises = [...shuffledMedia, ...shuffledSites].map(favorite =>
          getDoc(doc(db, 'sites', favorite.siteId))
            .then(snap => ({ snap, favorite }))
            .catch(err => {
              console.error(`Error fetching site ${favorite.siteId}:`, err);
              return null;
            })
        );

        const results = await Promise.all(sitePromises);
        const showcaseImages: ShowcaseImage[] = [];

        for (const result of results) {
          if (!result || !result.snap.exists()) continue;

          const siteData = result.snap.data() as FirebaseSite;
          const locationInfo = getLocationInfo(siteData);

          // If it's a media favorite, find that specific media
          if ('mediaId' in result.favorite && result.favorite.mediaId) {
            const favorite = result.favorite as FavoriteMedia;
            const media = siteData.media.find(m => m.mediaId === favorite.mediaId);
            if (media) {
              showcaseImages.push({
                mediaId: media.mediaId,
                siteId: result.favorite.siteId,
                url: media.mediumUrl || media.smallUrl || media.storageUrl || media.originalUrl,
                smallUrl: media.smallUrl,
                mediumUrl: media.mediumUrl,
                largeUrl: media.largeUrl,
                name: media.name || 'Untitled',
                siteName: locationInfo.address,
                location: locationInfo.location
              });
            }
          }
          // If it's a site favorite, get the first non-hidden media
          else {
            const firstMedia = siteData.media.find(m => !m.hidden);
            if (firstMedia) {
              showcaseImages.push({
                mediaId: firstMedia.mediaId,
                siteId: result.favorite.siteId,
                url: firstMedia.mediumUrl || firstMedia.smallUrl || firstMedia.storageUrl || firstMedia.originalUrl,
                smallUrl: firstMedia.smallUrl,
                mediumUrl: firstMedia.mediumUrl,
                largeUrl: firstMedia.largeUrl,
                name: firstMedia.name || 'Untitled',
                siteName: locationInfo.address,
                location: locationInfo.location
              });
            }
          }
        }

        // Use ALL images for carousel, ALL images for waterfall background
        const shuffledImages = shuffleArray(showcaseImages);
        const carouselImages = shuffledImages; // Use ALL images for carousel
        const backgroundImages = shuffledImages; // Use ALL images for waterfall effect



        setHeroImages(carouselImages);
        setWaterfallImages(backgroundImages);
      } catch (error) {
        console.error('Error fetching showcase images:', error);
      } finally {
        setHeroImagesLoading(false);
      }
    }

    fetchShowcaseImages();
  }, []);

  // Page load animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Image carousel effect - cycling through ALL images
  useEffect(() => {
    if (heroImages.length < 2) return;

    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % heroImages.length);
    }, 6000); // Change every 6 seconds

    return () => clearInterval(interval);
  }, [heroImages.length]);

  // Close mobile menu on window resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) { // md breakpoint
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Discount Banner */}
      {showBanner && (
        <div className="bg-[#22C55E] text-white py-3">
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
      
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold tracking-wide text-gray-900">
              Homesell <span className="text-[#22C55E] font-bold">Photography</span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#featured-work" className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer">Portfolio</a>
              <a href="#services" className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer">Services</a>
              <a href="https://homesellphotography.hd.pics/order" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer">Pricing</a>
              <Button 
                className="bg-[#22C55E] hover:bg-[#4ADE80] text-white rounded"
                onClick={() => window.open('https://homesellphotography.hd.pics/order', '_blank')}
              >
                Book a Shoot
              </Button>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex justify-end mb-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-col space-y-4">
              <a
                href="#featured-work"
                className="text-gray-600 hover:text-gray-900 transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Portfolio
              </a>
              <a
                href="#services"
                className="text-gray-600 hover:text-gray-900 transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Services
              </a>
              <a
                href="https://homesellphotography.hd.pics/order"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900 transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pricing
              </a>
              <Button
                className="bg-[#22C55E] hover:bg-[#4ADE80] text-white rounded w-full justify-start"
                onClick={() => {
                  window.open('https://homesellphotography.hd.pics/order', '_blank');
                  setIsMobileMenuOpen(false);
                }}
              >
                Book a Shoot
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section - Complete Redesign */}
      <section className="relative min-h-[24vh] flex items-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#22C55E]/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#10B981]/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-[#22C55E]/15 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        {/* Static Grid Background - Evenly Spaced Showcase Images */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 opacity-8">
            {/* Evenly spaced grid covering the entire background */}
            <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-12 grid-rows-8 md:grid-rows-10 gap-0 md:gap-1 h-full w-full p-0">
              {Array.from({ length: 120 }, (_, index) => {
                const imageIndex = index % waterfallImages.length;
                const image = waterfallImages[imageIndex];
                if (!image) return null;

                return (
                  <div
                    key={`grid-${index}`}
                    className="relative rounded-lg overflow-hidden bg-gray-50 aspect-video"
                  >
                    <Image
                      src={image.url}
                      alt=""
                      fill
                      className="object-cover opacity-70 hover:opacity-90 transition-opacity duration-500"
                      sizes="8rem"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-20 relative z-10 w-full">
          {/* Subtle overlay for better text readability */}
          <div className="absolute inset-0 bg-white/5 backdrop-blur-[0.5px] rounded-3xl"></div>
          <div className="grid lg:grid-cols-12 gap-8 items-center min-h-[80vh] relative z-10">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-8">


              {/* DFW Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-white/50 shadow-lg">
                <Heart className="w-4 h-4 fill-red-500 stroke-red-600 stroke-2 animate-pulse" />
                <span className="text-sm font-medium text-gray-700">DFW Real Estate Photography</span>
              </div>

              {/* Main Headline */}
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black leading-[0.9] tracking-tight">
                  <span className="block text-gray-800">Elevate your</span>
                  <span className="block text-[#22C55E]">
                    listings
                  </span>
                </h1>

                {/* Value Proposition */}
                <p className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-lg">
                  Transform ordinary homes into extraordinary showcases with professional photography that sells faster and commands premium prices.
                </p>

                {/* Book Now Button */}
                <div className="pt-6">
                  <Button
                    className="bg-[#22C55E] hover:bg-[#4ADE80] text-white rounded px-6 py-3 text-lg font-medium"
                    onClick={() => window.open('https://homesellphotography.hd.pics/order', '_blank')}
                  >
                    Book Now
                  </Button>
                </div>
              </div>


            </div>

            {/* Right Image Showcase */}
            <div className="lg:col-span-6 relative">
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl bg-white border border-gray-200/50">
                {heroImagesLoading ? (
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse"></div>
                ) : heroImages.length > 0 ? (
                  <div className="absolute inset-0">
                    <Image
                      src={heroImages[currentImageIndex]?.largeUrl || heroImages[currentImageIndex]?.url || '/hero-house.jpg'}
                      alt={`Premium real estate photography: ${heroImages[currentImageIndex]?.siteName || 'Luxury Property'}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                      priority
                    />
                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                  </div>
                ) : (
                  <Image
                    src="/hero-house.jpg"
                    alt="Beautiful modern home with professional real estate photography"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                    priority
                  />
                )}

                {/* Floating Stats Card - Modern */}
                <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-2xl p-5 shadow-2xl border border-gray-200/30 z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#22C55E] to-[#10B981] rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white font-black text-lg">2.5k</span>
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-bold text-gray-800">Happy Customers</div>
                      <div className="text-xs text-gray-500 font-medium">Trust Homesell</div>
                    </div>
                  </div>
                </div>


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
      <section id="featured-work" className="py-20 px-4 bg-gray-50 relative overflow-hidden">
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
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Featured <span className="text-[#22C55E]">Work</span></h2>
              <p className="text-gray-600">Showcasing our finest property photography</p>
            </div>
            <Link href="/featured-work">
              <Button className="bg-[#22C55E] hover:bg-[#4ADE80] text-white items-center gap-2 px-4 py-2 text-sm font-medium w-fit">
                View All Work <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          <FavoriteGallery userId="showcase" className="mt-4" />
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-900">Our <span className="text-[#22C55E]">Services</span></h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Property Photography",
                description: "High-quality photos that showcase your property in its best light",
                image: "/hero-house-2.jpg"
              },
              {
                title: "Mapping",
                description: "Detailed property mapping and floor plans for comprehensive property documentation",
                image: "/floorplan.png"
              },
              {
                title: "Aerial Photography",
                description: "Stunning drone shots that capture the full scope of your property",
                image: "/drone.jpg"
              }
            ].map((service, i) => (
              <div key={i} className="group p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="aspect-video rounded-xl overflow-hidden mb-6 group-hover:scale-[1.02] transition-transform duration-300 relative">
                  {service.image ? (
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority={i === 2} // Prioritize loading the drone image
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
                  )}
                </div>
                <h3 className="text-xl font-medium mb-2 text-gray-900">{service.title}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <Button
                  className="w-full bg-[#22C55E] hover:bg-[#4ADE80] text-white rounded-lg"
                  onClick={() => window.open('https://homesellphotography.hd.pics/order', '_blank')}
                >
                  Book {service.title}
                </Button>
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

          {/* Testimonials Carousel */}
          <div className="relative">
            {/* Navigation Buttons */}
            <button
              onClick={() => setTestimonialIndex(prev => Math.max(0, prev - 1))}
              disabled={testimonialIndex === 0}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>

            <button
              onClick={() => setTestimonialIndex(prev => Math.min(testimonials.length - 3, prev + 1))}
              disabled={testimonialIndex >= testimonials.length - 3}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>

            {/* Testimonials Display */}
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${testimonialIndex * (100 / 3)}%)` }}
              >
                {testimonials.map((testimonial, i) => (
                  <div key={i} className="w-full md:w-1/2 lg:w-1/3 flex-shrink-0 px-4">
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 h-full min-h-[200px] flex flex-col">
                      <div className="mb-2 flex-1">
                        <p className="text-gray-600 line-clamp-4 leading-relaxed">{testimonial.quote}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gradient-to-br from-[#22C55E]/10 to-[#22C55E]/30">
                          <Image
                            src={testimonial.avatar}
                            alt={`${testimonial.author}'s avatar`}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">{testimonial.author}</div>
                          <div className="text-sm text-gray-500">{testimonial.role} at {testimonial.company}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center mt-8 gap-2">
              {Array.from({ length: testimonials.length - 2 }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setTestimonialIndex(i)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    i === testimonialIndex ? 'bg-[#22C55E]' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
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
                <div className="hover:text-gray-900 transition-colors cursor-pointer">Mapping</div>
                <div className="hover:text-gray-900 transition-colors cursor-pointer">Aerial Photography</div>
                <div className="hover:text-gray-900 transition-colors cursor-pointer">Floor Plans</div>
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