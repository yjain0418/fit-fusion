"use client";
import React, { useState, useEffect, useMemo } from "react";
import Sidebar from "../../_components/Sidebar";
import ProfileNavbar from "../../_components/ProfileNavbar";
import { usePathname, useRouter } from "next/navigation";

// Import the new modular components
import ProfileHeader from "../../_components/ProfileHeader";
import UserProfileCard from "../../_components/UserProfileCard";
import BadgesCard from "../../_components/BadgesCard";
import WorkoutDataCard from "../../_components/WorkoutDataCard";

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const router = useRouter();
  const path = usePathname();
  const email = path.split("/")[2];

  useEffect(() => {
    if (!email) return;

    const fetchUserData = async () => {
      try {
        const response = await fetch(`/api/profile/${email}`);
        if (response.ok) {
          const data = await response.json();
          setUserData(data.result);
        } else {
          console.error("Failed to fetch user data");
          setUserData({}); // Set to empty object to avoid errors on render
        }
      } catch (error) {
        console.error("An error occurred:", error);
        setUserData({});
      }
    };

    fetchUserData();
  }, [email]);

  const profileCompletionRatio = useMemo(() => {
    if (!userData) return 0;

    const fieldsToCount = Object.keys(userData).filter(
      (key) => key !== "userType" && key !== "coins" && key !== "_id"
    );
    
    const totalValues = fieldsToCount.length;
    if (totalValues === 0) return 0;

    let filledCount = 0;
    for (const key of fieldsToCount) {
      // Check for non-empty strings, non-zero numbers, etc.
      if (userData[key] && userData[key] !== 0) {
        filledCount++;
      }
    }

    const ratio = (filledCount / totalValues) * 100;
    return parseFloat(ratio.toFixed(2));
  }, [userData]);

  const handleUpdateProfileClick = () => {
    router.push(`/dashboard/${email}/profile/updateprofile`);
  };

  // Display a loading state while fetching data
  if (!userData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex">
        <Sidebar />
        <main className="p-10 w-[80vw] absolute left-[20vw] h-screen overflow-y-auto">
          {/* <ProfileNavbar /> */}

          <ProfileHeader
            ratio={profileCompletionRatio}
            onUpdateClick={handleUpdateProfileClick}
          />

          <div className="bg-zinc-500/10 shadow-xl w-full rounded-2xl flex flex-col lg:flex-row gap-10 mt-10 p-10">
            <div className="w-full lg:w-1/2">
              <UserProfileCard
                user={userData}
                onUpdateClick={handleUpdateProfileClick}
              />
            </div>
            <div className="flex flex-col gap-6 w-full lg:w-1/2">
              <BadgesCard />
              <WorkoutDataCard />
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default ProfilePage;