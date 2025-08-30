"use client";

import FavoriteGallery from "@/components/FavoriteGallery";

export default function FeaturedWorkPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
          Featured <span className="text-[#22C55E]">Work</span>
        </h1>
        <p className="text-gray-600 text-lg mb-12">
          A curated collection of our finest property photography showcasing beautiful homes and spaces.
        </p>
        
        <FavoriteGallery 
          userId="showcase" 
          className="mt-8"
          expanded={true} // We can add this prop to show more images in the gallery
        />
      </div>
    </div>
  );
}
