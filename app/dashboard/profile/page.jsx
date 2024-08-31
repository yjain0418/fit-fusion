import React from "react";
import Sidebar from "../_components/Sidebar";
import Image from "next/image";

const Profile = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="p-10 w-full h-screen">
        <div className="bg-slate-800 w-full h-full rounded-2xl flex gap-20 p-10">
          <div className="w-1/2 bg-red-600 h-full rounded-2xl">
            <div className="flex w-full h-1/3 mt-4 justify-center items-center overflow-hidden">
              <Image
                src={"/john.jpeg"}
                alt=""
                width={250}
                height={250}
                objectFit="cover"
                objectPosition="center"
              />
            </div>
            <div className="w-3/4 h-[1px] bg-zinc-700 my-4 mx-auto"></div>
          </div>
          <div className="flex flex-col gap-6 w-1/2 bg-red-600 h-full rounded-2xl">
            <div className="h-1/2 w-full bg-green-400 rounded-2xl"></div>
            <div className="h-1/2 w-full bg-green-400 rounded-2xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
