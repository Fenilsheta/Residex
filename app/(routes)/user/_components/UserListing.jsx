import { useUser } from '@clerk/nextjs'
import React, { useEffect, useState } from 'react'
import { supabase } from 'utils/supabase/client'

function UserListing() {

    const {user}=useUser();
    const [listing,setListing]=useState();
    useEffect(()=>{
        user&&GetUserListing();
    },[user])
    const GetUserListing=async()=>{
        const {data,error}=await supabase
        .from('listing')
        .select(`*,listingImages(url,listing_id)`)
        .eq('createdBy',user?.primaryEmailAddress.emailAddress);

        
            setListing(data)
        
    }
  return (
    <div>
        <h2 className='font-bold text-2xl'>Manage Your Listing</h2>
    </div>
  )
}

export default UserListing