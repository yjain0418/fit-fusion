"use client";
import Content from "./_components/Content";
import Feedback from "./_components/Feedback";
import ImageSlider from "./_components/ImageSlider";
import Navbar from "./_components/Navbar";
import WhatWeOffer from "./_components/WhatWeOffer";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import FAQ from "./_components/FAQ";
import Newsletter from "./_components/Newsletter";
import Footer from "./_components/Footer";

// Image data array
const images = ["/image3.jpg" , "/image1.jpg", "/image2.jpg"];

export default function Home() {
  return (
    <>
      <Navbar />
      <ImageSlider height={"460px"} images={images}/>
      <Content />
      <WhatWeOffer />
      <Feedback />
      <FAQ />
      <Footer />
    </>
  );
}
