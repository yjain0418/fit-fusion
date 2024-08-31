import React from "react";
import Newsletter from "./Newsletter";
import Image from "next/image";
import { Mail, MapIcon, MapPin, Phone, Pin } from "lucide-react";

const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <>
      <div className="mt-72">
      </div>
      <div className="-mt-24">
        <Newsletter />
      </div>

      <div className="flex items-center justify-around mt-8">
        <div>
          <Image src={"/logo.png"} width={420} height={420} />
        </div>

        <div>
          <div className="flex items-center gap-4 cursor-pointer">
            <Image src={"/facebook.png"} width={40} height={40} />
            <Image src={"/google.png"} width={40} height={40} />
            <Image src={"/instagram.png"} width={40} height={40} />
            <Image src={"/linkedin.png"} width={40} height={40} />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-around p-4 ml-16 cursor-pointer">
        <div className="flex gap-16">
          <div className="flex flex-col gap-4">
            <span className="text-2xl">Services</span>
            <h2>Voice Assistant</h2>
            <h2>Customised Diet Plan</h2>
            <h2>Trained Nutritioners</h2>
            <h2>Fitness Community</h2>
          </div>

          <div className="flex flex-col gap-4">
            <span className="text-2xl">Company</span>
            <h2>About</h2>
            <h2>Blog</h2>
            <h2>Terms and Conditions</h2>
            <h2>Privacy Policy</h2>
          </div>

          <div className="flex flex-col gap-4">
            <span className="text-2xl">Support</span>
            <h2>Contact</h2>
            <h2>Client Login</h2>
            <h2>Join our Fitness Community</h2>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-2xl">Address</span>
            <h2 className="items-center flex gap-2">
              <MapPin /> NIT Kurukshetra
            </h2>
            <h2 className="flex items-center gap-2">
              <Phone /> +91 999999999
            </h2>
            <h2 className="flex items-center gap-2">
              <Mail /> fitfusion@gmail.com
            </h2>
          </div>
        </div>
      </div>

      <div className="text-center py-4">
        <h2>Copyright &copy; {year} | Made with ❤️</h2>
      </div>
    </>
  );
};

export default Footer;
