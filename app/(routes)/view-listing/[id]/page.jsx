"use client"
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';
import { supabase } from 'utils/supabase/client'
import Slider from '../_components/Slider'
function ViewListing({params}) {

    const [listingDetail,setlistingDetail]=useState();
    useEffect(() =>{
        GetListingDetail();
    },[])
    const GetListingDetail=async()=>{
        const {data,error}=await supabase
        .from('listing')
        .select('*,listingImages(url,listing_id)')
        .eq('id',params.id)
        .eq('active',true)

        if(data){
            setlistingDetail(data);
           
        }
        if(error){
            toast("server side error!");
        }
    }
  return (
    <div>
        <Slider imageList={listingDetail?.listingImages}/>
    </div>
  )
}

export default ViewListing