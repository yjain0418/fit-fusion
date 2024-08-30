"use client"
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <div className="flex flex-1">
      {/* navbar */}
      <div className="flex flex-1 justify-between my-3 gap-3">
        <div>
          <Image src={'/logo.png'} width={220} height={220}/>
        </div>


        <div className="hidden md:flex justify-center items-center gap-5 text-xl">
          <h2 className="hover:cursor-pointer hover:underline">Home</h2>
          <h2 className="hover:cursor-pointer hover:underline" onClick={()=> router.push('/about')}>About</h2>
          <h2 className="hover:cursor-pointer hover:underline" onClick={()=> router.push('/whatwedo')}>What We Do</h2>
          <h2 className="hover:cursor-pointer hover:underline" onClick={()=> router.push('/contact')}>Contact Us</h2>
        </div>

        <div className="flex justify-center items-center gap-4 mr-8 text-xl">
          <h2 className="hover:cursor-pointer">Login</h2>
          <h2 className="hover:cursor-pointer">Sign Up</h2>
        </div>
      </div>

      <hr />
    </div>
  );
}
