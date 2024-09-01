import React from 'react'
import Sidebar from '../../_components/Sidebar'
import ProfileNavbar from '../../_components/ProfileNavbar'

const DietPlan = () => {
  return (
    <>
    <div className='flex'>
      <Sidebar />
      <section className="w-[77vw] absolute left-[23vw]">
        <ProfileNavbar />
        <main>
          <div></div>
          <div></div>
        </main>
        {/* <Footer /> */}
      </section>

    </div>
    </>
  )
}

export default DietPlan