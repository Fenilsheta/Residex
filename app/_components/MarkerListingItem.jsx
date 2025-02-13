import { Button } from '@/components/ui/button'
import { BathIcon, BedDouble, MapPin, X } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

function MarkerListingItem({item,closeHandler}) {
  return (
    <div>
            <div className=' cursor-pointer rounded-lg w-[180px]'>
                <X onClick={()=>closeHandler()}/>
                            <Image src={item.listingImages[0].url}
                                width={800}
                                height={150}
                                alt='images'
                                unoptimized={true}
                                className='rounded-lg w-[180px] object-cover h-[170px]'
                            />
                            <div className=' bg-white flex mt-2 flex-col gap-2 p-2'>
                                <h2 className='font-bold text-xl'>${item?.price}</h2>
                                <h2 className='flex gap-2 text-sm text-gray-400'>
                                    <MapPin className='h-4 w-4' />{item?.address}</h2>

                                <div className='flex gap-2 mt-2 justify-between'>
                                    
                                    <h2 className='flex gap-2 w-full text-sm bg-slate-200 rounded-md p-2 text-gray-500 justify-center items-center'>
                                        <BedDouble />{item?.bedroom}
                                    </h2>

                                    <h2 className='flex gap-2 w-full text-sm bg-slate-200 rounded-md p-2 text-gray-500 justify-center items-center'>
                                        <BathIcon />{item?.bathroom}
                                    </h2>
                                    
                                </div>
                                <Button size='sm'>View Detail</Button>
                            </div>
                        </div>
    </div>
  )
}

export default MarkerListingItem