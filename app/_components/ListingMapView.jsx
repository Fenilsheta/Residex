"use client"
import React, { useEffect, useState } from 'react'
import Listing from "../_components/Listing"
import { supabase } from 'utils/supabase/client'
import { toast } from 'sonner';

function ListingMapView() {

    const [listing, setListing]=useState([]);
    useEffect(() =>{
        getLatestlisting();
    },[])

    const getLatestlisting=async()=>{
        const {data,error}=await supabase
        .from("listing")
        .select(`*, listingImages(url,listing_id)`)
        

        if(data){
            console.log(data);
            setListing(data);
        }
        if(error){
            toast('serverside error')
        }
        
      
    }
  return (
    <div className='grid grid-cols-1 md:grid-cols-2'>
        <div>
            <Listing listing={listing} />
        </div>

        <div>
            Map
        </div>
    </div>
  )
}

export default ListingMapView