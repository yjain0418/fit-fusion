"use client";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

const options = [
  { name: "Diet Plan", path: "/plan" },
  { name: "Nutritioner and Coaches", path: "/coaches" },
  { name: "Community", path: "/community" },
  { name: "Workout Plans", path: "/workout" },
];

const Sidebar = () => {
  const router = useRouter();
  const path = usePathname();

  const email = path.split("/")[2];

  return (
    <div className="flex flex-col border-r-zinc-900 border-r-[0.2px] py-10 h-screen rounded-r-2xl">
      <Image
        src={"/logo.png"}
        alt="logo"
        width={350}
        height={350}
        className="mb-4 mx-auto"
      />
      <hr className="w-full bg-zinc-900" />
      <div className="px-6 flex flex-col gap-3 text-xl my-6 h-3/4 font-thin">
        {options.map((item, index) => {
          const isActive = path.includes(item.path);
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

      <hr />

      <div className="flex justify-start px-12 mt-6 font-thin gap-6 text-black text-center text-xl cursor-pointer">
        <Image src={"/exit.png"} alt="exit" width={25} height={25} /> Logout
      </div>
    </div>
  );
};

export default Sidebar;
