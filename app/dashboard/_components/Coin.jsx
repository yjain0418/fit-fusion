import Image from 'next/image'
import React from 'react'

const Coin = () => {
  return (
    <div>
      <Image src={'/coin.png'} alt='coins' width={40} height={20} />
    </div>
  )
}

export default Coin