"using client"
import Image from 'next/image'
import React from 'react'

function AgentDetail({listingDetail}) {
  return (
    <div>
        <Image src={listingDetail?.profileImage}
        alt='profile image'
        width={60}
        height={60}
        className='rounded-full'
        />
    </div>
  )
}

export default AgentDetail