"use client"
import React from "react";
import Coin from "./Coin";
import Profileicon from "./Profileicon";

const ProfileNavbar = () => {
  return (
    <div className="absolute flex right-16 top-6 justify-center items-start gap-6">
      <div className="flex items-center gap-6">
        <div className="flex justify-center items-center gap-2">
          <p>0</p>
          <Coin />
        </div>
        {/* Make sure the Profileicon is clickable */}
        <Profileicon />
      </div>
    </div>
  );
};

export default ProfileNavbar;
