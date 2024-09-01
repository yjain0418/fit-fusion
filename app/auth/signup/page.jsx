"use client"
import Footer from '@/app/_components/Footer'
import Navbar from '@/app/_components/Navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React from 'react'
import { useState } from 'react'

const SignUp = () => {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const addUser = async () => {
    try {
      let result = await fetch("/api/users/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),  // Correctly format the body as an object
      });

      result = await result.json();

      if (result.success) {
        alert("New user added");
        router.push('/auth/login');  // Redirect to login after successful signup
      } else {
        alert("Signup failed");
      }
    } catch (error) {
      console.error("Error during signup:", error);
      alert("An error occurred while signing up.");
    }
  }
  return (
    <>
      <Navbar />
      <div className="flex justify-center items-center h-screen">
        <div className="bg-white flex rounded-2xl shadow-lg gap-2 p-6 py-8">
          {/* left section */}
          <div>
            <Image src={"/Signup.jpg"} width={500} height={500} />
          </div>

          {/* right section */}
          <div className="flex flex-col justify-center items-center gap-4 mx-4">
            <h2 className="text-3xl">Sign Up</h2>
            <Input placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="bg-white" />
            <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-white" />
            <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-white" />

            <Button className="items-center w-full" onClick={addUser}>Sign Up</Button>
            <div className="mt-4">
              <h2>
                Already have an Account ? <span className='cursor-pointer hover:text-red-500' onClick={() => router.replace('/auth/login')}>Login</span>
              </h2>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default SignUp