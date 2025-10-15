"use client";
import React from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

// Components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Constants
const SIDEBAR_OPTIONS = [
  { name: "Dashboard", path: "", icon: "/dashboard.png" },
  { name: "Diet Plan", path: "/plan", icon: "/diet.png" },
  { name: "Nutritioner and Coaches", path: "/coaches", icon: "/coach.png" },
  { name: "Community", path: "/community", icon: "/community.png" },
  { name: "Workout Plans", path: "/workout", icon: "/workout.png" },
  { name: "BMI Calculator", path: "/wellnessplan", icon: "/bmi.png" },
];

// Sub-components
const LogoSection = ({ email, router }) => (
  <div className="flex flex-col items-center mb-8">
    <Image
      src={"/logo.png"}
      alt="logo"
      width={400}
      height={60}
      className="cursor-pointer transition-transform hover:scale-105 rounded-xl"
      onClick={() => router.push(`/dashboard/${email}`)}
    />
    <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mt-4" />
  </div>
);

const NavigationItem = ({ item, isActive, onClick }) => (
  <div
    className={`flex items-center gap-3 cursor-pointer px-2 py-2 rounded-xl transition-all duration-200 group ${
      isActive 
        ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg" 
        : "hover:bg-gray-100 text-gray-700 hover:text-gray-900"
    }`}
    onClick={onClick}
  >
    {item.icon && (
      <Image
        src={item.icon}
        alt={item.name}
        width={20}
        height={20}
        className={`transition-transform group-hover:scale-110`}
      />
    )}
    <span className="font-medium text-xl">{item.name}</span>
    {isActive && (
      <div className="ml-auto w-2 h-2 bg-white rounded-full" />
    )}
  </div>
);

const NavigationMenu = ({ options, email, path, router }) => (
  <nav className="space-y-2 flex-1">
    {options.map((item, index) => {
      const isActive = item.path === "" 
        ? path === `/dashboard/${email}`
        : path.includes(item.path);
      
      return (
        <NavigationItem
          key={index}
          item={item}
          isActive={isActive}
          onClick={() => router.push(`/dashboard/${email}${item.path}`)}
        />
      );
    })}
  </nav>
);

const PersonalizedPlanSection = ({ email, router }) => (
  <Card className="mx-4 mb-6 bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
    <CardContent className="p-4">
      <div className="text-center">
        <h3 className="font-semibold text-gray-900 text-sm mb-2">
          Get Personalized Plan
        </h3>
        <p className="text-xs text-gray-600 mb-3">
          Tailored workout and nutrition plan
        </p>
        <Button 
          onClick={() => router.push(`/dashboard/${email}/personalisedplan`)}
          className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-sm py-2"
        >
          Get Started
        </Button>
      </div>
    </CardContent>
  </Card>
);

const LogoutSection = ({ onLogout }) => (
  <div className="px-4 mt-auto">
    <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-4" />
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-red-50 hover:text-red-600 cursor-pointer transition-all duration-200 group"
      onClick={onLogout}
    >
      <Image
        src={"/exit.png"}
        alt="exit"
        width={20}
        height={20}
        className="transition-transform group-hover:scale-110 group-hover:rotate-90"
      />
      <span className="font-medium text-sm">Logout</span>
    </div>
  </div>
);

// Main Sidebar Component
const Sidebar = () => {
  const router = useRouter();
  const path = usePathname();
  const email = path.split("/")[2];

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/users/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        router.push('/auth/login');
      } else {
        console.error('Failed to logout');
      }
    } catch (error) {
      console.error('An error occurred during logout', error);
    }
  };

  return (
    <div className="fixed top-0 left-0 w-64 h-screen bg-white border-r border-gray-200 flex flex-col py-6 shadow-xl rounded-r-3xl">
      {/* Logo Section */}
      <LogoSection email={email} router={router} />
      
      {/* Navigation Menu */}
      <div className="flex-1 px-4">
        <NavigationMenu 
          options={SIDEBAR_OPTIONS}
          email={email}
          path={path}
          router={router}
        />
      </div>

      {/* Personalized Plan Section */}
      <PersonalizedPlanSection email={email} router={router} />

      {/* Logout Section */}
      <LogoutSection onLogout={handleLogout} />
    </div>
  );
};

export default Sidebar;