import Image from 'next/image'
import React from 'react'

function Listing({listing}) {

  return (
    <div>
        <div>
            {listing.map((item,index)=>{
                <div>
                    <Image src={item.listingImages[0].url}
                    width={800}
                    height={150}
                    className='rounded-lg object-cover h-[150px]'
                    alt='listing images'
                    />
                </div>
            })}
        </div>
    </div>
  )
}

export default Listing