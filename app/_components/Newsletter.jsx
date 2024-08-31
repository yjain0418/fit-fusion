import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import React from 'react'

const Newsletter = () => {
  return (
    <div className='p-8 justify-center items-center flex bg-red-950/10 rounded-2xl max-w-4xl mx-auto'>
        <div className='flex items-center justify-center p-8 rounded-xl gap-12'>

            <div>
                <h2 className='text-2xl'>Subscribe to News Letter</h2>
            </div>

            <div className='flex items-center gap-4'>
                <Input placeholder='Enter your Email' className='bg-white'/> 
                <Button>Submit</Button>
            </div>

        </div>
    </div>
  )
}

export default Newsletter
