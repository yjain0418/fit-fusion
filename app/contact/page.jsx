import React from "react";
import Navbar from "../_components/Navbar";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Footer from "../_components/Footer";

const Contact = () => {
  return (
    <>
      <Navbar />
      <div className="container py-10 px-20 w-full h-full">
        <h1 className="text-6xl">Contact Us</h1>
        <div className="flex gap-20 justify-between items-center">
          <div className="flex flex-col gap-12 w-full">
            <Input type="text" placeholder="Full Name" className="py-4" />
            <Input type="email" placeholder="Email" className="py-4" />
            <Input type="text" placeholder="Message..." className="py-4 h-10" />
            <Button>Submit</Button>
          </div>
          <Image src={"/contact.jpg"} alt="" width={500} height={500} />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Contact;
