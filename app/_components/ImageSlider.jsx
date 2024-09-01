// src/components/ImageSlider.jsx
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const images = ["/image3.jpg", "/image1.jpg", "/image2.jpg"];

export default function ImageSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const prevSlide = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length
    );
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  useEffect(() => {
    if (!isHovered) {
      const interval = setInterval(() => {
        nextSlide();
      }, 4500);
      return () => {
        clearInterval(interval);
      };
    }
  }, [isHovered]);

  const handleMouseOver = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div className="relative h-full w-full mx-auto mt-12">
      <div
        className={`relative h-[460px] mx-12 group hover:-translate-y-2`}
        onMouseOver={handleMouseOver}
        onMouseLeave={handleMouseLeave}
      >
        <Image
          src={images[currentIndex]}
          alt={`Slider Image ${currentIndex + 1}`}
          layout="fill"
          objectFit="cover"
          objectPosition="center"
          className="rounded-xl transition-all duration-500 ease-in-out cursor-pointer"
        />
      </div>
      <button
        className="absolute left-0 top-1/2 transform h-10 rounded-full mx-1 -mt-[10px] -translate-y-1/2 bg-[#fff6ee] text-white p-2 group"
        onClick={prevSlide}
      >
        <ChevronLeft className="text-gray-400 group-hover:text-[#2f2e2e]" />
      </button>
      <button
        className="absolute right-0 top-1/2 transform h-10 rounded-full mx-1 -mt-[10px] -translate-y-1/2 bg-[#fff6ee] text-white p-2 group"
        onClick={nextSlide}
      >
        <ChevronRight className="text-gray-400 group-hover:text-[#2f2e2e]" />
      </button>
      <div className="flex justify-center mt-4">
        {images.map((_, index) => (
          <div
            key={index}
            className={`h-1 w-10 mx-1 ${
              index === currentIndex
                ? "bg-[#beff46] rounded-xl"
                : "bg-gray-300 rounded-xl"
            } transition-all duration-500 ease-in-out`}
          ></div>
        ))}
      </div>
    </div>
  );
}
