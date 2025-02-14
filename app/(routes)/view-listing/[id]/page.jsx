"use client"
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';
import { supabase } from 'utils/supabase/client'
import Slider from '../_components/Slider'
import Details from '../_components/Details'

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
            setlistingDetail(data[0]);
           
        }
        if(error){
            toast("server side error!");
        }
    }
  return (
    <div className='px-4 md:px-32 lg:px-56 py-5'>
        <Slider imageList={listingDetail?.listingImages}/>
        <Details listingDetail={listingDetail}/>
    </div>
  )
}

export default ViewListing