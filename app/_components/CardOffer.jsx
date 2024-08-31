import Image from 'next/image'
import React from 'react'

const CardOffer = ({ image, title }) => {
  return (
    <div className='border rounded-2xl p-8 justify-center flex flex-col items-center gap-3 hover:shadow-2xl transition-shadow duration-300 cursor-pointer'>
      <Image src={image} alt='Offer Image' width={100} height={100} />

      <h2 className='text-xl'>{title}</h2>
    </div>
  )
}

export default CardOffer
