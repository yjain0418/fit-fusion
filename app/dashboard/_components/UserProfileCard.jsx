"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const UserProfileCard = ({ user, onUpdateClick }) => {
  const DetailRow = ({ label, value }) => (
    <p>
      <span className="font-medium">{label}:</span> {value || "-"}
    </p>
  );

  return (
    <div className="bg-[#fff6ee] shadow-2xl border-zinc-800/10 border-2 w-full h-full rounded-2xl p-6 flex flex-col">
      <div className="flex justify-center items-center py-6">
        <div className="w-[200px] h-[200px]">
          <Image
            className="rounded-full object-cover w-full h-full"
            src={"/user.png"} // This could be user.avatarUrl in the future
            alt="User avatar"
            width={200}
            height={200}
          />
        </div>
      </div>

      <div className="w-11/12 h-[1px] bg-zinc-700/50 my-6 mx-auto"></div>

      <div className="text-zinc-800 flex flex-col gap-3 px-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-zinc-950 text-3xl font-semibold">My Profile</h3>
          <Button onClick={onUpdateClick} variant="outline">
            Edit
          </Button>
        </div>

        <div className="flex flex-col gap-4 text-md">
          <p className="text-xl">
            <span className="font-semibold">Full Name:</span> {user.name || "-"}
          </p>
          <div>
            <p>
              <span className="font-semibold">Phone:</span> {user.phone || "-"}
            </p>
            <p>
              <span className="font-semibold">Address:</span> {user.address || "-"}
            </p>
          </div>
          <div className="flex justify-between">
            <DetailRow label="Age" value={user.age} />
            <DetailRow label="Gender" value={user.gender} />
          </div>
          <div className="flex justify-between">
            <DetailRow label="Height (cm)" value={user.height} />
            <DetailRow label="Weight (kg)" value={user.weight} />
          </div>
          <div className="flex justify-between">
            <DetailRow label="Designation" value={user.designation} />
            <DetailRow label="Experience (yrs)" value={user.experience} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileCard;