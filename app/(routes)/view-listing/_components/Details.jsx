import React from 'react'
import { Button } from '@/components/ui/button';
import { Bath, BedDouble, CarFront, Drill, Home, LandPlot, MapPin, Share } from 'lucide-react';
import GoogleMapSection from 'app/_components/GoogleMapSection';
import AgentDetail from './AgentDetail';


function Details({ listingDetail }) {
  return listingDetail && (
    <div className="my-6 flex gap-2 flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">$ {listingDetail?.price}</h2>
          <h2 className="text-gray-500 flex gap-2 text-lg">
            <MapPin /> {listingDetail?.address}
          </h2>
        </div>
        <Button className='flex gap-2'> <Share /> Share</Button>
      </div>

      <hr></hr>
      <div className='mt-4 flex flex-col gap-3'>
        <h2 className='font-bold text-2xl'>Key Features</h2>
        <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>

          <h2 className='flex gap-2 items-center bg-purple-100 
            rounded-lg p-3 text-primary justify-center'>
            <Home />
            {listingDetail?.propertyType}
          </h2>

          <h2 className='flex gap-2 items-center bg-purple-100 
            rounded-lg p-3 text-primary justify-center'>
            <Drill />
            Built In {listingDetail?.builtIn}
          </h2>

          <h2 className='flex gap-2 items-center bg-purple-100 
            rounded-lg p-3 text-primary justify-center'>
            <LandPlot />
            {listingDetail?.area}
          </h2>

          <h2 className='flex gap-2 items-center bg-purple-100 
            rounded-lg p-3 text-primary justify-center'>
            <BedDouble />
            {listingDetail?.bedroom} Bed
          </h2>

          <h2 className='flex gap-2 items-center bg-purple-100 
            rounded-lg p-3 text-primary justify-center'>
            <Bath />
            {listingDetail?.bathroom} Bath
          </h2>

          <h2 className='flex gap-2 items-center bg-purple-100 
            rounded-lg p-3 text-primary justify-center'>
            <CarFront />
            {listingDetail?.parking} Parking
          </h2>

        </div>

      </div>

      <div className='mt-4'>
        <h2 className='text-2xl font-bold'>What's Special</h2>
        <p className='text-gray-600'>{listingDetail?.description}</p>
      </div>

      <div>
        <h2 className='text-2xl font-bold'>Find On Map</h2>
        <GoogleMapSection
          coordinates={listingDetail?.coordinates}
          listing={[listingDetail]}
        />
      </div>

      <div>

        <h2 className='text-2xl font-bold'>Contact Agent</h2>

        <AgentDetail listingDetail={listingDetail} />
      </div>

      <div>

        <h2 className='text-2xl font-bold'>Virtual Tour</h2>


        {/* <video width="100%" height="auto" controls>
          <source src={} type="video/mp4" />
          Your browser does not support the video tag.
        </video> */}
      </div>

    </div>
  );

}

export default Details