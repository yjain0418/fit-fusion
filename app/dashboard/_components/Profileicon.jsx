import Image from "next/image";
import React from "react";
import { usePathname, useRouter } from "next/navigation";

const Profileicon = () => {
  const router = useRouter();
  const path = usePathname();

  const email = path.split("/")[2];

  // Handle the click on the Profileicon
  const handleProfileClick = () => {
    router.push(`/dashboard/${email}/profile`);
  };

  return (
    <div className="cursor-pointer rounded-full w-[40px] h-[40px] overflow-hidden">
      {" "}
      <Image
        src={"/user.png"}
        alt="profile_icon"
        height={60}
        width={60}
        onClick={handleProfileClick}
      />{" "}
    </div>
  );
};

export default Profileicon;
