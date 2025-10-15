"use client";
import Image from "next/image";

const WorkoutDataCard = () => {
  return (
    <div className="h-1/2 w-full bg-[#fff6ee] shadow-xl border-zinc-700/10 border-2 rounded-2xl p-6 flex flex-col">
      <h3 className="text-2xl font-semibold flex items-center gap-2 mb-4">
        Your Workout Data
        <Image
          src="/data-analytics.png"
          alt="data analytics icon"
          width={32}
          height={32}
        />
      </h3>
      <div className="flex-grow w-full flex justify-center items-center">
        <Image
          src="/nodata.png"
          alt="No data available"
          width={100}
          height={100}
        />
      </div>
    </div>
  );
};

export default WorkoutDataCard;