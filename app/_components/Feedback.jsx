"use client";
import Image from "next/image";
import React, { useState } from "react";
import CardFeedback from "./CardFeedback";
import Slider from "react-slick";
import { Star, ThumbsUp } from "lucide-react";

const feedback = [
  {
    id: 1,
    name: "John Doe",
    title: "Fitness Trainer",
    desc: "The website supports real-time health monitoring and targeted interventions, making it invaluable for personal health management and public health initiatives. It helps in optimizing workout routines.",
    image: "/john.jpeg",
    rating: 4.5,
  },
  {
    id: 2,
    name: "Sarah Williams",
    title: "Nutritionist",
    desc: "FitFusion provides personalized diet plans that are easy to follow. The integration of AI helps in adjusting meal suggestions based on my clients’ needs, making it an indispensable tool for nutrition management.",
    image: "/sarah.jpeg",
    rating: 4.8,
  },
  {
    id: 3,
    name: "Michael Smith",
    title: "Health Enthusiast",
    desc: "This platform offers a comprehensive set of tools that cater to all my fitness goals. The AI-driven insights on health and fitness help me stay motivated and informed, setting it apart from other wellness apps.",
    image: "/michael.jpeg",
    rating: 4.2,
  },
  {
    id: 4,
    name: "Emily Johnson",
    title: "Yoga Instructor",
    desc: "The yoga recommendations and mental wellness features are fantastic. FitFusion’s approach to holistic health is a game-changer for my practice and helps my clients maintain a balanced lifestyle.",
    image: "/emily.jpeg",
    rating: 4.7,
  },
  {
    id: 5,
    name: "David Lee",
    title: "Sports Coach",
    desc: "FitFusion is highly effective in tracking athletes’ performance metrics. The insights and feedback are perfect for refining training regimens, making it a must-have for anyone serious about sports and fitness for life.",
    image: "/david.jpeg",
    rating: 4.9,
  },
];

const Feedback = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,          
    autoplaySpeed: 1500,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 600,    
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <div className="max-w-4xl mx-auto mt-18 flex flex-col">

        <div className='flex justify-center items-center gap-5 mt-40'>
            <h2 className='text-3xl font-bold'>What our Customers Say</h2>
            <Image src={'/customer.png'}  width={40} height={40}/>
        </div>

        <div className="mt-12">
            <Slider {...settings} className="slider">
            {feedback.map((item) => (
                <div key={item.id} className="px-3">
                <CardFeedback
                    name={item.name}
                    title={item.title}
                    desc={item.desc}
                    image={item.image}
                    rating={item.rating}
                />
                </div>
            ))}
            </Slider>
        </div>

    </div>
  );
};

export default Feedback;
