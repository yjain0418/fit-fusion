import Image from "next/image";
import React from "react";
import Navbar from "../_components/Navbar";
import { Dot } from "lucide-react";

const feat = [
  "Community Challenges and Local Fitness Ecosystem",
  "Voice-Activated Workout Companion",
  "Nutrition and Local Food Suggestions with AI",
  "Integrated Health Checkup Reminders",
  "Eco-Friendly Fitness Activities Tracker"
];

const About = () => {
  return (
    <>
      <Navbar />
      <div className="container relative py-16 flex w-full h-full">
        <div className="intro relative left-[25%] bg-slate-200 w-[80%] h-[72vh] px-20 py-10 rounded-xl">
          <h1 className="text-6xl font-bold absolute right-40 uppercase">
            About Us
          </h1>

          <div className="absolute px-6 top-32 left-[43%] break-words">
            <h3 className="text-xl">
              Welcome to our AI-Powered Fitness Platform! We’re passionate about
              revolutionizing the way people approach health and wellness. Our
              mission is to make fitness more personalized, engaging, and
              effective through cutting-edge technology. Let’s dive into what
              sets us apart:
            </h3>

            {feat.map((item, index) => (
              <p key={index} className="flex gap-1 items-center text-lg mt-2">
                <Dot size={32} />
                {item}
              </p>
            ))}
          </div>
        </div>
        <Image
          src={"/about-illustration.jpg"}
          alt=""
          width={800}
          height={1200}
          className="absolute -left-5 top-28 rounded-xl"
        />
      </div>
    </>
  );
};

export default About;
