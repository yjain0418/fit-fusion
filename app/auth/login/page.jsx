"use client"
import Footer from "@/app/_components/Footer";
import Navbar from "@/app/_components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";

const Login = () => {
    const router = useRouter();
  return (
    <>
      <Navbar />
      <div className="flex justify-center items-center h-screen">
        <div className="bg-white flex rounded-2xl shadow-lg gap-2 p-6 py-8">
          {/* left section */}
          <div>
            <Image src={"/Login.jpg"} width={450} height={450} />
          </div>

          {/* right section */}
          <div className="flex flex-col justify-center items-center gap-4 mx-4">
            <h2 className="text-3xl">Login</h2>
            <Input placeholder="Email" className="bg-white" />
            <Input placeholder="Password" className="bg-white" />

            <Button className="items-center w-full">Login</Button>
            <div className="mt-4">
              <h2>
                Don't have an Account ? <span className="cursor-pointer hover:text-red-500" onClick={()=> router.replace('/auth/signup')}>Sign Up</span>
              </h2>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Login;
