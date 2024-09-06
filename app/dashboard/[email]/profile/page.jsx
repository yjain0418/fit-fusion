"use client";
import React, { useState, useEffect } from "react";
import Sidebar from "../../_components/Sidebar";
import Image from "next/image";
import ProfileNavbar from "../../_components/ProfileNavbar";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";

const images = [
  "/badges/1.jpg",
  "/badges/2.jpg",
  "/badges/3.jpg",
  "/badges/4.jpg",
  "/badges/5.jpg",
  "/badges/6.jpg",
];

const Profile = () => {
  // const [userType, setUserType] = useState("general");
  // const [name, setName] = useState("");
  // const [age, setAge] = useState(0);
  // const [gender, setGender] = useState("");
  // const [height, setHeight] = useState(0);
  // const [weight, setWeight] = useState(0);
  // const [address, setAddress] = useState("");
  // const [phone, setPhone] = useState("");
  // const [coins, setCoins] = useState(0);
  // const [reward, setReward] = useState("");
  // const [designation, setDesignation] = useState("");
  // const [experience, setExperience] = useState(0);
  const [userData, setUserData] = useState({
    name: "",
    userType: "general",
    age: 0,
    gender: "",
    height: 0,
    weight: 0,
    address: "",
    phone: "",
    coins: 0,
    reward: "",
    designation: "",
    experience: 0,
  });

  const router = useRouter();
  const path = usePathname();
  const email = path.split("/")[2];

  const totalValues = Object.keys(userData).length - 2;

  useEffect(() => {
    const userDataFetch = async () => {
      try {
        const result = await fetch(`/api/profile/${email}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (result.ok) {
          const data = await result.json();
          setUserData(data.result);
        } else {
          console.error("Failed to fetch user data");
        }
      } catch (error) {
        console.error("An error occurred:", error);
      }
    };

    userDataFetch();
  }, [email]);

  const getRatio = () => {
    let cnt = 0;
    for (const key in userData) {
      if (userData[key] !== "" && key !== "userType" && key !== "coins") {
        cnt++;
      }
    }

    let ratio = (cnt / totalValues) * 100;
    return ratio.toFixed(2);
  };

  return (
    <>
      <div className="flex">
        <Sidebar />
        <div className="p-10 w-[80vw] absolute left-[20vw] h-screen">
          <ProfileNavbar />
          <div className="flex items-end gap-16 justify-around">
            <div className="w-[50%]">
              <h2 className="text-2xl">Complete Profile</h2>
            </div>
            <div className="flex justify-around w-full items-center gap-4 mt-16 mr-16">
              <h2 className="text-xl">{`${getRatio()}%`}</h2>
              <div className="w-[50%]">
                <Progress value={getRatio()} />
              </div>
              <Button
                onClick={() =>
                  router.push(`/dashboard/${email}/profile/updateprofile`)
                }
              >
                Update Profile
              </Button>
            </div>
          </div>
          <div className="bg-zinc-500/10 shadow-xl w-full h-full rounded-2xl flex gap-20 mt-10 p-10">
            <div className="bg-[#fff6ee] shadow-2xl border-zinc-800/10 border-2 w-1/2 h-full rounded-2xl">
              <div className="flex w-full h-[40%] mt-12 justify-center items-center overflow-hidden">
                <div className="w-full h-full rounded-full justify-center items-center flex">
                  <Image
                    className="rounded-full"
                    src={"/user.png"}
                    alt=""
                    width={220}
                    height={220}
                  />
                </div>
              </div>
              <div className="w-11/12 h-[1px] bg-zinc-700 my-6 mx-auto"></div>
              {/* display the progress bar */}

              {/* Display user data */}
              <div className="text-zinc-800 flex flex-col gap-2 justify-start w-full px-12">
                <div className="flex justify-between items-center mb-8">
                  <p className="text-zinc-950 text-3xl font-semibold">
                    My Profile
                  </p>
                  <div>
                    <Button
                      onClick={() =>
                        router.push(`/dashboard/${email}/profile/updateprofile`)
                      }
                    >
                      Update Profile
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-start">
                  <p className="text-xl">
                    Full Name: {userData.name ? userData.name : "-"}
                  </p>
                  <div className="flex flex-col gap-2">
                    <p>Phone No. : {userData.phone ? userData.phone : "-"}</p>
                    <p>Address : {userData.address ? userData.address : "-"}</p>
                  </div>
                </div>
                <div className="flex justify-between gap-2">
                  <p>Age: {userData.age ? userData.age : "-"}</p>
                  <p>Gender : {userData.gender ? userData.gender : "-"}</p>
                </div>
                <div className="flex justify-between gap-2">
                  <p>Height: {userData.height ? userData.height : "-"}</p>
                  <p>Weight: {userData.weight ? userData.weight : "-"}</p>
                </div>
                <div className="flex justify-between gap-2">
                  <p>
                    Designation:{" "}
                    {userData.designation ? userData.designation : "-"}
                  </p>
                  <p>
                    Years of Experience:{" "}
                    {userData.experience ? userData.experience : "-"}
                  </p>
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
                <div className="w-full h-full flex justify-center items-center">
                  {/* {images.map((item, index) => {
                    return <div key={index} className="rounded-xl object-cover w-[80px] h-[80px] object-center overflow-hidden mx-2">
                    <Image src={item} alt={`badge:${index+1}`} width={80} height={80} />
                    </div>;
                    })} */}
                  <Image src={"/nodata.png"} width={100} height={100} />
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

                <div className="w-full h-full flex justify-center items-center">
                  <Image src={"/nodata.png"} width={100} height={100} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
