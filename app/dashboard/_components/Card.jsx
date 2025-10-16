import { Button } from "@/components/ui/button";
import Image from "next/image";
import React from "react";

const Card = ({ user }) => {
  return (
    <div className="w-64 h-auto bg-white/80 rounded-2xl shadow-xl flex flex-col justify-center items-center px-12 py-6 space-y-6">
      {/* Circular Image */}
      <Image
        src={user.profilePhoto ? user.profilePhoto : "/user.png"}
        alt={user.name}
        width={120}
        height={120}
        className="rounded-full border-4 border-blue-500 shadow-lg"
      />

      {/* User Information */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
        <p className="text-sm text-gray-600 mt-2">Age: {user.age}</p>
        <p className="text-sm text-blue-600 font-medium mt-1">
          {user.designation}
        </p>
        <p className="text-sm text-gray-600 mt-1">
          Experience: {user.experience} years
        </p>
      </div>

      {/* Divider */}
      <div className="w-full border-t border-gray-200 mt-4"></div>

      {/* Action Button */}
      <div className="flex items-center gap-4 justify-between">
        <button className="px-6 py-2 bg-blue-500 text-white text-md font-medium rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300">
          Profile
        </button>
        <Button>Contact</Button>
      </div>
    </div>
  );
};

export default Card;
