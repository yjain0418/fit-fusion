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
    <div className="cursor-pointer rounded-full w-[50px] h-[50px] overflow-hidden">
      {" "}
      <Image
        src={"/john.jpeg"}
        alt="profile_icon"
        height={100}
        width={80}
        onClick={handleProfileClick}
      />{" "}
    </div>
  );
};

export default Profileicon;
