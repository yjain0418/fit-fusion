import React from 'react'
import Sidebar from '../../_components/Sidebar'
import ProfileNavbar from '../../_components/ProfileNavbar'
import Image from 'next/image'

const Community = () => {
  return (
    <>
    <div className='flex'>
      <Sidebar />
      <section className="w-[77vw] absolute left-[23vw]">
        <ProfileNavbar />
        <main>

          <div className='flex justify-center items-center flex-col gap-8 mt-40'>
            <Image src={'/teamwork.gif'} width={400} height={400} className='rounded-full' unoptimized />
            <h1 className='text-4xl'>Developers on Work...</h1>
          </div>
        </main>
        {/* <Footer /> */}
      </section>

    </div>
    </>
  )
}

export default Community