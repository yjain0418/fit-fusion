"use client";
import { Button } from "@/components/ui/button";
import React from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

const options = [
  { name: "Dashboard", path: "" },
  // { name: "Diet Plan", path: "/plan" },
  { name: "Nutritioner and Coaches", path: "/coaches" },
  { name: "Community", path: "/community" },
  { name: "Workout Plans", path: "/workout" },
  { name: "BMI Calculator", path: "/wellnessplan" },
];

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
    <div className="fixed top-0 left-0 w-[20vw] flex flex-col border-r-zinc-900 border-r-[0.2px] py-10 h-screen rounded-r-2xl">
      <Image
        src={"/logo.png"}
        alt="logo"
        width={300}
        height={300}
        className="mb-4 mx-auto cursor-pointer"
        onClick={() => router.push(`/dashboard/${email}`)}
      />
      <hr className="w-full bg-zinc-900" />
      <div className="px-6 flex flex-col gap-3 text-xl my-6 h-3/4 font-thin">
        {options.map((item, index) => {
          const isActive =
            item.path === ""
              ? path === `/dashboard/${email}`
              : path.includes(item.path);
          return (
            <div
              key={index}
              className={`cursor-pointer px-6 py-3 rounded-2xl ${
                isActive ? "bg-red-900/10" : ""
              }`}
              onClick={() => {
                router.push(`/dashboard/${email}${item.path}`);
              }}
            >
              {item.name}
            </div>
          );
        })}
      </div>

      <div className="justify-center items-center px-8 py-3 mb-3">
        <Button onClick={()=> router.push(`/dashboard/${email}/personalisedplan`)}>Get Personalized Plan</Button>
      </div>

      <hr />

      <div className="flex justify-start px-12 mt-6 font-thin gap-6 text-black text-center text-lg cursor-pointer" onClick={handleLogout}>
        <Image src={"/exit.png"} alt="exit" width={22} height={22} /> Logout
      </div>
    </div>
  );
};

export default Sidebar;
