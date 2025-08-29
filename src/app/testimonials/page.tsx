"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User } from "lucide-react";
import { useState } from "react";

// Default avatar component when image fails to load or is missing
const DefaultAvatar = () => (
  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#22C55E]/10 to-[#22C55E]/30 flex items-center justify-center">
    <User className="h-6 w-6 text-[#22C55E]" />
  </div>
);

// Avatar component with fallback
const Avatar = ({ src, alt }: { src?: string; alt: string }) => {
  const [error, setError] = useState(false);

  if (!src || error) {
    return <DefaultAvatar />;
  }

  return (
    <div className="relative h-12 w-12 rounded-full overflow-hidden bg-gradient-to-br from-[#22C55E]/10 to-[#22C55E]/30">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        onError={() => setError(true)}
      />
    </div>
  );
};

const testimonials = [
  {
    quote: "Great job. Logan is very attentive to detail and accommodating to the clients' needs. Highly recommended.",
    author: "Brenda Taylor",
    role: "Real Estate Agent",
    company: "RE/MAX Dallas Suburbs",
    location: "Plano, TX",
    avatar: "https://ndrsl-avatars.s3.us-east-2.amazonaws.com/1746376065795-3663.jpg"
  },
  {
    quote: "Logan was on time, professional and quick. The photos came out beautiful and the turnaround time was fast and efficient. Thank you!",
    author: "Amber Bekkali",
    role: "REALTOR®",
    company: "TX Home Choice",
    location: "Dallas, TX",
    avatar: "https://ndrsl-avatars.s3.us-east-2.amazonaws.com/1746216933362-8811.jpg"
  },
  {
    quote: "Amazing communication. Beautiful media. Flexible schedules. I highly recommend the Gold Package!",
    author: "Tiara Glenn",
    role: "REALTOR®",
    company: "Keller Williams Heritage West",
    location: "Weatherford, TX",
    avatar: "https://ndrsl-avatars.s3.us-east-2.amazonaws.com/1708706624942-9906.jpg"
  },
  {
    quote: "Homesell Photography did a wonderful job with the photography for both my listings this year. They are very skilled, knowledgeable, punctual and professional.",
    author: "Brendan R Hirschmann",
    role: "REALTOR®",
    company: "Ebby Halliday",
    location: "Forney, TX",
    avatar: "https://ndrsl-avatars.s3.us-east-2.amazonaws.com/1696689106535-5034.jpg"
  },
  {
    quote: "Very professional photographers. I highly recommend them.",
    author: "Sam Duraini",
    role: "REALTOR®",
    company: "Keller Williams Frisco Stars",
    location: "Frisco, TX",
    avatar: "https://ndrsl-avatars.s3.us-east-2.amazonaws.com/1685720607891-1700.jpg"
  },
  {
    quote: "The end product was fantastic! Loved our photographer. Thank you, Homesell!",
    author: "Caryn Schniederjan",
    role: "REALTOR®",
    company: "REMAX DFW Associates",
    location: "Frisco, TX",
    avatar: "https://ndrsl-avatars.s3.us-east-2.amazonaws.com/1685202793223-7649.jpg"
  },
  {
    quote: "Pictures came out excellent! Great service!",
    author: "Tina Wright",
    role: "REALTOR®",
    company: "eXp Realty",
    location: "Ramona, CA",
    avatar: "https://ndrsl-avatars.s3.us-east-2.amazonaws.com/1680881026594-5339.jpg"
  },
  {
    quote: "HomeSell Photography provides outstanding photographer that made my listing more attractive, the way displayed the listing on website is gorgeous!",
    author: "John Wu",
    role: "REALTOR®",
    company: "eXp Realty of California",
    location: "San Gabriel, CA",
    avatar: "https://ndrsl-avatars.s3.us-east-2.amazonaws.com/1675909501859-5750.jpg"
  },
  {
    quote: "Very professional, on time and great quality. Client loved the pictures.",
    author: "Manny Morales",
    role: "REALTOR®",
    company: "HomeSmart",
    location: "Chatsworth, CA",
    avatar: "https://ndrsl-avatars.s3.us-east-2.amazonaws.com/1672513430899-9690.jpg"
  },
  {
    quote: "We are always very impressed with the photos when we use Homesell Photography",
    author: "Julie Shuler",
    role: "REALTOR®",
    company: "Ebby Halliday",
    location: "Forney, TX",
    avatar: "https://ndrsl-avatars.s3.us-east-2.amazonaws.com/1664834010927-5579.jpg"
  },
  {
    quote: "Always on time and very professional! The photos never disappoint.",
    author: "Vanessa Monasterial",
    role: "REALTOR®",
    company: "Century 21 Judge Fite Company",
    location: "Dallas, TX",
    avatar: "https://ndrsl-avatars.s3.us-east-2.amazonaws.com/1663800889219-5019.jpg"
  },
  {
    quote: "The photos were delivered as promised and the quality was excellent.",
    author: "Vanessa Monasterial",
    role: "REALTOR®",
    company: "Century 21 Judge Fite Company",
    location: "Dallas, TX",
    avatar: "https://ndrsl-avatars.s3.us-east-2.amazonaws.com/1659330892020-7224.jpg"
  },
  {
    quote: "Awesome work; photos are always amazing. The level of detail comes thru.",
    author: "Shettie Blue",
    role: "REALTOR®",
    company: "Blue Enterprises",
    location: "Rowlett, TX",
    avatar: "https://ndrsl-avatars.s3.us-east-2.amazonaws.com/1658244328289-2223.jpg"
  },
  {
    quote: "I had a listing in Fontana, CA and didn't know any photographers in the area. I used Homesell to book a photographer and I was pleasantly surprised. They took great photos and they were ready very fast. I'll be using them again!",
    author: "Rochelle Hewitt",
    role: "REALTOR®",
    company: "Bayside Real Estate Partners",
    location: "Manhattan Beach, CA",
    avatar: "https://ndrsl-avatars.s3.us-east-2.amazonaws.com/1657562863668-6036.jpg"
  },
  {
    quote: "Homesell Photography is the easiest to make appointments and the pictures are fantastic. You have to book them for your next photo shoot.",
    author: "Debbie Warford",
    role: "REALTOR®",
    company: "Home Solutions Realty",
    location: "DFW, TX",
    avatar: "https://ndrsl-avatars.s3.us-east-2.amazonaws.com/1656089374313-3641.jpg"
  },
  {
    quote: "Homesell Photography did a fantastic job shooting a beautiful estate on 2.4 acres with guest house, pool, cabana, greenhouse etc… my client loved it and I will absolutely contact them again!",
    author: "Von Truong",
    role: "REALTOR®",
    company: "RE/MAX DFW Associates",
    location: "Frisco, TX",
    avatar: "https://ndrsl-avatars.s3.us-east-2.amazonaws.com/1654960768365-5698.jpg"
  },
  {
    quote: "Scheduling was so easy! They showed up early and we finished on time. My clients were very happy with the service.",
    author: "Rebecca Ross",
    role: "REALTOR®",
    company: "KELLER Williams Realty",
    location: "Flower Mound, TX",
    avatar: "https://ndrsl-avatars.s3.us-east-2.amazonaws.com/1651165530433-8300.jpg"
  },
  {
    quote: "Great photos, showed the home beautifully!",
    author: "Nicole Fox",
    role: "REALTOR®",
    company: "Keller Williams",
    location: "Dallas, TX",
    avatar: "https://ndrsl-avatars.s3.us-east-2.amazonaws.com/1650317184424-4182.jpg"
  },
  {
    quote: "Great services at a great price. I always get the photos on time and highly recommend their services!",
    author: "Nick Farr",
    role: "REALTOR®",
    company: "Harry Norman, Realtors",
    location: "Atlanta, GA",
    avatar: "https://ndrsl-avatars.s3.us-east-2.amazonaws.com/1648777481398-6651.jpg"
  },
  {
    quote: "I couldn't be happier with the service that Homesell photography offers. I was able to customize my session and my photographer was professional and extremely helpful. I will certainly be using them again!",
    author: "Linda Stearns-Plotkin",
    role: "REALTOR®",
    company: "Realty One Group West",
    location: "Huntington Beach, CA",
    avatar: "https://ndrsl-avatars.s3.us-east-2.amazonaws.com/1648671860476-6178.jpg"
  },
  {
    quote: "Homesell Photography was excellent. Photographer was on time, courteous and professional. The photos were amazing and captured all the best qualities of the property.",
    author: "Jeff Wong",
    role: "REALTOR®",
    company: "Westside Estate Agency",
    location: "Beverly Hills, CA",
    avatar: "https://ndrsl-avatars.s3.us-east-2.amazonaws.com/1642374973813-507.jpg"
  },
  {
    quote: "I have been a REALTOR for over 21 years and I have never gotten such rave reviews of the photography of one of my listings. The clarity and angles of the pictures gave a fabulous representation of the home.",
    author: "Kelly Rudiger",
    role: "REALTOR®",
    company: "Coldwell Banker APEX",
    location: "McKinney, TX",
    avatar: "https://ndrsl-avatars.s3.us-east-2.amazonaws.com/1629409929254-1458.jpg"
  },
  {
    quote: "I am so happy with Homesell Photography! The customer service is very easy to work with. My clients are very happy with the result of the property website and the quality of their photos. Highly recommended!",
    author: "Inna Santoso",
    role: "REALTOR®",
    company: "Keller Williams Realty Brentwood",
    location: "Los Angeles, CA",
    avatar: "https://ndrsl-avatars.s3.us-east-2.amazonaws.com/1634230496460-6567.jpg"
  },
  {
    quote: "Both myself and my client were extremely happy with the quality of the photography and look forward to using Homesell Photography on my next listing!",
    author: "Sandy D",
    role: "REALTOR®",
    company: "Equity Los Angeles",
    location: "Los Angeles, CA",
    avatar: "https://ndrsl-avatars.s3.us-east-2.amazonaws.com/1631733518852-3941.jpg"
  },
  {
    quote: "High quality photos at a great price. Received them in less than 24 hours. Very satisfied.",
    author: "Jonathan Busby",
    role: "REALTOR®",
    company: "Westside Estate Agency",
    location: "Los Angeles, CA",
    avatar: "https://ndrsl-avatars.s3.us-east-2.amazonaws.com/1631670335902-3610.jpg"
  },
  {
    quote: "Homesell Photography provides great communication, prompt scheduling, professional photographers and high quality photo packages as promised! Great experience!",
    author: "Steven Scavone",
    role: "REALTOR®",
    company: "Shorepointe Real Estate Associates",
    location: "St. Clair Shores, MI",
    avatar: "https://ndrsl-avatars.s3.us-east-2.amazonaws.com/1631651467711-951.jpg"
  },
  {
    quote: "We had to change appointment times due to the homeowner's schedule and Homesell Photography took it all in stride. The pictures were absolutely terrific and the number of people viewing our property was incredible.",
    author: "Keith Gardner",
    role: "REALTOR®",
    company: "RE/MAX ProAdvantage",
    location: "McKinney, TX",
    avatar: "https://ndrsl-avatars.s3.us-east-2.amazonaws.com/1631636116129-8374.jpg"
  },
  {
    quote: "Photos and services provided were superb! Will continue to use for my listings. I highly recommend!",
    author: "Kyle Cleland",
    role: "REALTOR®",
    company: "Keller Williams Realty Atlanta Partners Tucker",
    location: "Atlanta, GA",
    avatar: "https://ndrsl-avatars.s3.us-east-2.amazonaws.com/1631117850992-2880.jpg"
  },
  {
    quote: "I was very pleased with the photos provided by Homesell Photography. The photographer was on time for our appointment and took excellent drone shots as well. I look forward to working with Homesell again.",
    author: "Michelle Johnson",
    role: "REALTOR®",
    company: "PalmerHouse Properties",
    location: "Johns Creek, GA",
    avatar: "https://ndrsl-avatars.s3.us-east-2.amazonaws.com/1630623311312-4402.jpg"
  },
  {
    quote: "The pictures look great and had a fast turn around time!",
    author: "Than Maynard",
    role: "REALTOR®",
    company: "Coldwell Banker Heart of Oklahoma",
    location: "Purcell, OK",
    avatar: "https://ndrsl-avatars.s3.us-east-2.amazonaws.com/1630615530878-6392.jpg"
  },
  {
    quote: "It is always a pleasure doing business with Homesell Photography. Very professional and the photos are outstanding every time!",
    author: "Kim Lewison",
    role: "REALTOR®",
    company: "Core One Real Estate",
    location: "Princeton, TX",
    avatar: "https://ndrsl-avatars.s3.us-east-2.amazonaws.com/1630509142044-3578.jpg"
  }
];

export default function Testimonials() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center gap-4 mb-12">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Client Testimonials</h1>
            <p className="text-gray-600 mt-2">See what our clients have to say about their experience with Homesell Photography</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, i) => (
            <div key={i} className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 h-full">
                <div className="mb-6">
                  <div className="absolute -top-3 left-8 text-[#22C55E] text-6xl leading-none">"</div>
                  <p className="text-gray-600 relative z-10 pt-4">{testimonial.quote}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Avatar 
                    src={testimonial.avatar} 
                    alt={`${testimonial.author}'s avatar`}
                  />
                  <div>
                    <div className="font-medium text-gray-900">{testimonial.author}</div>
                    <div className="text-sm text-gray-500">{testimonial.role} at {testimonial.company}</div>
                    <div className="text-sm text-[#22C55E]">{testimonial.location}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}