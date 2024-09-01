"use client";
import React from "react";
import Sidebar from "../../_components/Sidebar";
import Image from "next/image";
import Coin from "../../_components/Coin";
import Profileicon from "../../_components/profileicon";
import ProfileNavbar from "../../_components/ProfileNavbar";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";

const images = [
  "/badges/1.jpg",
  "/badges/2.jpg",
  "/badges/3.jpg",
  "/badges/4.jpg",
  "/badges/5.jpg",
  "/badges/6.jpg",
];

const Profile = () => {
  const userData = {
    name: "John Doe",
    age: 30,
    gender: "Male",
    height: "180 cm",
    weight: "75 kg",
    designation: "Fitness Trainer",
    experience: "5 years",
    email: "john@example.com",
    address: "123 Fitness Street, City",
    phone: "+1 123-456-7890",
    userType: "Premium",
  };

  const router = useRouter();
  const path = usePathname();
  const email = path.split('/')[2];

  return (
    <>
      <div className="flex">
        <Sidebar />
        <div className="p-10 w-full h-screen">
          <ProfileNavbar />
          <div className="bg-zinc-500/10 shadow-xl w-full h-full rounded-2xl flex gap-20 mt-10 p-10">
            <div className="bg-[#fff6ee] shadow-2xl border-zinc-800/10 border-2 w-1/2 h-full rounded-2xl">
              <div className="flex w-full h-[40%] mt-12 justify-center items-center overflow-hidden">
                <Image
                  className="rounded-2xl"
                  src={"/john.jpeg"}
                  alt=""
                  width={370}
                  height={370}
                />
              </div>
              <div className="w-11/12 h-[1px] bg-zinc-700 my-6 mx-auto"></div>
              {/* Display user data */}
              <div className="text-zinc-800 flex flex-col gap-2 justify-start w-full px-12">
                <div className="flex justify-between items-center mb-8">
                  <p className="text-zinc-950 text-3xl font-semibold">
                    My Profile
                  </p>
                  <div>
                    <Button onClick={()=> router.push(`/dashboard/${email}/profile/updateprofile`)}>Update Profile</Button>
                  </div>
                </div>
                <div className="flex justify-between items-start">
                  <p className="text-xl">{userData.name}</p>
                  <div className="flex flex-col gap-2">
                    <p>{userData.phone}</p>
                    <p>{userData.address}</p>
                  </div>
                </div>
                <div className="flex justify-between gap-2">
                  <p>{userData.age}</p>
                  <p>{userData.gender}</p>
                </div>
                <div className="flex justify-between gap-2">
                  <p>{userData.height}</p>
                  <p>{userData.weight}</p>
                </div>
                <div className="flex justify-between gap-2">
                  <p>{userData.designation}</p>
                  <p>{userData.experience}</p>
                </div>
                {/* Add other fields here */}
              </div>
            </div>
            <div className="flex flex-col gap-6 w-1/2 h-full rounded-2xl">
              <div className="h-1/2 w-full bg-[#fff6ee] shadow-xl border-zinc-700/10 border-2 rounded-2xl px-16 py-6">
                <h1 className="text-3xl font-semibold flex justify-between items-center gap-2">
                  Badges and Rewards{" "}
                  <Image
                    src={"/badge.png"}
                    alt="badge"
                    width={40}
                    height={40}
                  />
                </h1>
                <div className="w-full h-full flex flex-wrap py-8 justify-center items-center">
                  {/* {images.map((item, index) => {
                    return <div key={index} className="rounded-xl object-cover w-[80px] h-[80px] object-center overflow-hidden mx-2">
                      <Image src={item} alt={`badge:${index+1}`} width={80} height={80} />
                    </div>;
                  })} */}
                </div>
              </div>
              <div className="h-1/2 w-full bg-[#fff6ee] shadow-xl border-zinc-700/10 border-2 rounded-2xl px-16 py-6">
                <h1 className="text-3xl font-semibold flex justify-between items-center gap-2">
                  Your Workout Data{" "}
                  <Image
                    src={"/data-analytics.png"}
                    alt=""
                    width={40}
                    height={40}
                  />{" "}
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
