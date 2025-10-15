"use client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const ProfileHeader = ({ ratio, onUpdateClick }) => {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-end gap-4 md:gap-16 justify-between">
      <div className="w-full md:w-[50%]">
        <h2 className="text-2xl font-bold">Complete Profile</h2>
      </div>
      <div className="flex justify-around w-full items-center gap-4">
        <h2 className="text-xl font-medium">{`${ratio}%`}</h2>
        <div className="w-[50%]">
          <Progress value={ratio} />
        </div>
        <Button onClick={onUpdateClick}>Update Profile</Button>
      </div>
    </div>
  );
};

export default ProfileHeader;