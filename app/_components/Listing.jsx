import Image from 'next/image'
import React from 'react'

function Listing({listing}) {

  return (
    <div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
            {listing.map((item,index)=>{
                <div>
                    <Image src={item.listingImages[0].url}
                    width={800}
                    height={150}
                    className='rounded-lg object-cover h-[150px]'
                    />
                    <div>
                        <h2></h2>
                    </div>
                </div>
            })}
        </div>
    </div>
  )
}

export default Listing