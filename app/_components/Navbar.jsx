"use client"
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React from 'react'

const Navbar = () => {
    const router = useRouter();
  return (
    <div>
      {/* navbar */}
      <div className="flex flex-1 justify-between my-3 gap-3">
        <div>
          <Image src={'/logo.png'} width={250} height={250}/>
        </div>


        <div className="hidden md:flex justify-center items-center gap-8 text-xl">
          <h2 className="hover:cursor-pointer transition-all hover:text-2xl" onClick={()=> router.push('/')}>Home</h2>
          <h2 className="hover:cursor-pointer transition-all hover:text-2xl" onClick={()=> router.push('/about')}>About</h2>
          <h2 className="hover:cursor-pointer transition-all hover:text-2xl" onClick={()=> router.push('/whatwedo')}>What We Do</h2>
          <h2 className="hover:cursor-pointer transition-all hover:text-2xl" onClick={()=> router.push('/contact')}>Contact Us</h2>
        </div>

        <div className="flex justify-center items-center gap-4 mr-8">
          <Button className="hover:cursor-pointer" onClick={()=> router.push('/auth/login')}>Login</Button>
          <Button className="hover:cursor-pointer" onClick={()=> router.push('/auth/signup')}>Sign Up</Button>
        </div>
      </div>

      <hr />
    </div>
  )
}

export default Navbar
