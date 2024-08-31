"use client"
import Content from "./_components/Content";
import Feedback from "./_components/Feedback";
import ImageSlider from "./_components/ImageSlider";
import Navbar from "./_components/Navbar";
import WhatWeOffer from "./_components/WhatWeOffer";
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import FAQ from "./_components/FAQ";


export default function Home() {
  return (
    <>
      <Navbar />
      <ImageSlider />
      <Content />
      <WhatWeOffer />
      <Feedback />
      <FAQ />
    </>
  );
}
