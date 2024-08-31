import Image from 'next/image';
import React from 'react';
import { Star, ThumbsUp } from 'lucide-react';

const CardFeedback = ({ name, title, desc, image, rating }) => {
  return (
    <div className='border rounded-2xl p-6 flex flex-col items-center text-center hover:shadow-lg transition-shadow duration-300 cursor-pointer'>
        <div className='rounded-full'>
            <Image src={image} width={100} height={100} className='rounded-full' />
        </div>
      <h2 className='text-xl font-bold mt-3'>{name}</h2>
      <p className='text-gray-500'>{title}</p>
      <p className='mt-2 text-sm'>{desc}</p>

      <div className='flex items-center gap-1 mt-4 justify-center'>
        <Star className='text-yellow-500' />
        <span>{rating}</span>
        <ThumbsUp className='text-blue-500' />
      </div>
    </div>
  );
};

export default CardFeedback;
