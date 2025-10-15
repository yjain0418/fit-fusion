"use client"
import Footer from "@/app/_components/Footer";
import Navbar from "@/app/_components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from 'react';
import React from "react";

const Login = () => {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const checkLogin = async () => {
      setLoading(true);
      try{
        let result = await fetch("/api/users/login", {
          method:"POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        });

        result = await result.json();

        if (result.success) {
          router.replace(`/dashboard/${email}`);
        } else {
          alert("Login Failed: " + (result.error || "Unknown error"));
        }
        
      }catch(error) {
        alert("Login Failed: " + (error || "Unknown error"));
      } finally {
        setLoading(false);
      }
    }
  return (
    <>
      <Navbar />
      <div className="flex justify-center items-center h-screen">
        <div className="bg-white flex rounded-2xl shadow-lg gap-2 p-6 py-8">
          <div>
            <Image src={"/Login.jpg"} width={450} height={450} />
          </div>

          <div className="flex flex-col justify-center items-center gap-4 mx-4">
            <h2 className="text-3xl">Login</h2>
            <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-white" />
            <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-white" />

            <Button className="items-center w-full" onClick={checkLogin} disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                "Login"
              )}
            </Button>
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
