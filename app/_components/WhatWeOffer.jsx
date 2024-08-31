import Image from 'next/image'
import React from 'react'
import CardOffer from './CardOffer'

const WhatWeOffer = () => {
  return (
    <div className='flex flex-col my-8 justify-center items-center gap-8'>
        
        <div className='flex justify-center items-center gap-5 my-4'>
            <h2 className='text-3xl font-bold'>What We Offer</h2>
            <Image src={'/offer.png'}  width={40} height={40}/>
        </div>

        <div className='grid md:grid-cols-2 sm:grid-cols-1 justify-center items-center gap-4 max-w-2xl'>
            <CardOffer image={'/voice.png'} title={'Voice Enabled Workout'}/>
            <CardOffer image={'/diet.png'} title={'Customised Diet Plan'}/>
            <CardOffer image={'/diversity.png'} title={'Fitness Community'}/>
            <CardOffer image={'/tracker.png'} title={'Fitness Activity Tracking'}/>
        </div>


    </div>
  )
}

export default WhatWeOffer
