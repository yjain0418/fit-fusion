"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const options = [
  { name: "Diet Plan", path: "/plan" },
  { name: "Nutritioner and Coaches", path: "/coaches" },
  { name: "Community", path: "/community" },
  { name: "Workout Plans", path: "/workout" },
];

const Sidebar = () => {
  const router = useRouter();
  const [selectedState, setSelectedState] = useState("");

  return (
    <div className="flex w-1/4 flex-col border-r-zinc-900 border-r-[0.2px] py-10 h-screen rounded-r-2xl">
      <Image
        src={"/logo.png"}
        alt="logo"
        width={400}
        height={200}
        className="mb-4 mx-auto"
      />
      <hr className="w-full bg-zinc-900" />
      <div className="px-6 flex flex-col gap-3 text-2xl my-6 h-3/4 font-semibold">
        {options.map((item, index) => {
          return (
            <div
              className={`cursor-pointer px-6 py-3 rounded-2xl ${
                selectedState == item.name ? "bg-red-900/10" : ""
              }`}
              onClick={() => {
                // router.push(`${item.path}`);
                setSelectedState(item.name);
              }}
            >
              {item.name}
            </div>
          );
        })}
      </div>

      <hr />

      <div className="flex justify-start px-12 mt-6 font-bold gap-6 text-black text-center text-xl cursor-pointer">
        <Image src={"/exit.png"} alt="exit" width={30} height={30} /> Logout
      </div>
    </div>
    // logo
    // diet plan
    // nutritioner and coaches
    // community
    // workout plans

    // logout
  );
};

export default Sidebar;
