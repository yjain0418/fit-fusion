import Image from "next/image";
import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const questions = [
  {
    id: 1,
    question: "Can the app help with stress management and mental health?",
    answer:
      "Yes, the app includes mindfulness and stress-relief modules. It offers guided meditation, breathing exercises, and suggestions based on biosensor data like heart rate variability to help manage stress effectively.",
  },
  {
    id: 2,
    question: "What is an AI-powered virtual personal trainer?",
    answer:
      "An AI-powered virtual personal trainer uses artificial intelligence to create personalized workout routines tailored to your preferences, health conditions, and fitness goals. It offers real-time feedback using technologies like computer vision to correct your exercise form and prevent injuries.",
  },
  {
    id: 3,
    question: "How does gamification with augmented reality (AR) work in the app?",
    answer:
      "Our app integrates AR to gamify fitness challenges. Users can engage in interactive experiences such as virtual obstacle courses or location-based treasure hunts, making workouts more enjoyable and motivating.",
  },
  {
    id: 4,
    question: "Are there community challenges or local fitness activities available?",
    answer:
      "Absolutely! You can join local community challenges and form teams with friends or neighbors. We also partner with local gyms, trainers, and nutritionists to offer exclusive offline events and discounts.",
  },
  {
    id: 5,
    question: "Does the app include a voice-activated workout companion?",
    answer:
      "Yes, our app features a voice-activated fitness assistant. It guides you through workouts, suggests modifications, provides motivational feedback, and tracks your progress—all hands-free for a seamless workout experience.",
  },
  {
    id: 6,
    question: "How does the app optimize sleep and recovery?",
    answer:
      "The app analyzes your sleep patterns, heart rate, and activity using wearables or phone sensors. It provides insights and suggests personalized sleep and recovery routines to enhance your overall well-being.",
  },
  {
    id: 7,
    question: "Can the app recommend nutrition and local food options?",
    answer:
      "Yes, it suggests healthy food options and recipes based on your location, seasonal availability, and dietary preferences. Our AI engine also recommends healthier alternatives to common unhealthy choices.",
  },
  {
    id: 8,
    question: "Is there a feature for real-time posture correction and feedback?",
    answer:
      "Yes, the app integrates with wearables to provide real-time feedback on your posture during exercises or daily activities. This helps prevent injuries and ensures you get the most out of your workouts.",
  },
];

const FAQ = () => {
  return (
    <div className="flex flex-col mt-18 justify-center items-center gap-8">
      <div className="flex justify-center items-center gap-5 mt-40">
        <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
        <Image src={"/faq.png"} width={40} height={40} alt="FAQ icon" />
      </div>

      <div className="border p-6 rounded-2xl max-w-3xl w-full gap-12">
        <Accordion type="single" collapsible className="w-full">
          {questions.map(({ id, question, answer }) => (
            <AccordionItem
              key={id}
              value={`item-${id}`}
              className="border-b border-gray-200 last:border-b-0 gap-8"
            >
              <AccordionTrigger className="text-lg font-medium text-left">
                {question}
              </AccordionTrigger>
              <AccordionContent className="text-base text-gray-700">
                {answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default FAQ;
