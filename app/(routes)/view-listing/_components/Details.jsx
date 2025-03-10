import React from 'react'
import { Button } from '@/components/ui/button';
import { AlignRight, Bath, BedDouble, Building2, CarFront, Check, Crosshair, Cuboid, Drill, Home, LandPlot, MapPin, MapPinOff, Proportions, Share, SquareCheckBig, SquareSquare } from 'lucide-react';
import GoogleMapSection from 'app/_components/GoogleMapSection';
import AgentDetail from './AgentDetail';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { toast } from 'sonner';



function Details({ listingDetail }) {

  const sharePage = () => {
    if (navigator.share) {
      navigator.share({
        title: document.title,
        text: "Check this out!",
        url: window.location.href,
      })
    } else {
      alert("Sharing not supported in this browser.");
    }
  };

  return listingDetail && (
    <div className="my-6 flex gap-2 flex-col">
      <div className="flex justify-between items-center bg-white ">
        <div>
          <h2 className="text-4xl font-extrabold text-gray-800">{listingDetail?.propertyName}</h2>
          <h2 className="text-3xl font-semibold text-primary mt-1">$ {new Intl.NumberFormat('en-IN').format(listingDetail?.price)} </h2>
          <h2 className="text-gray-500 flex gap-2 text-lg mt-2 items-center">
            <MapPin className="text-primary w-5 h-5" />
            {listingDetail?.address}
          </h2>
        </div>

        <Button
          onClick={sharePage}
          className="flex text-1xl gap-3 w-32 h-11 rounded-lg "
        >
          <Share className="w-5 h-5" /> Share
        </Button>
      </div>


      <hr></hr>
      <div className='mt-4 flex flex-col gap-3'>
        <h2 className='font-bold text-2xl'>Key Features</h2>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>

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

          <h2 className='flex gap-2 items-center bg-purple-100 
            rounded-lg p-3 text-primary justify-center'>
            <Cuboid />
            {listingDetail?.configuration} BHK
          </h2>

          <h2 className='flex gap-2 items-center bg-purple-100 
            rounded-lg p-3 text-primary justify-center'>
            <Building2 />
            {listingDetail?.projectSize} Tower/Unit
          </h2>

          <h2 className='flex gap-2 items-center bg-purple-100 
            rounded-lg p-3 text-primary justify-center'>
            <SquareSquare />
            {listingDetail?.floors} Floors
          </h2>

          <h2 className='flex gap-2 items-center bg-purple-100 
            rounded-lg p-3 text-primary justify-center'>
            <Proportions />
            {listingDetail?.landParcel} Acres
          </h2>

          <h2 className='flex gap-2 items-center bg-purple-100 
            rounded-lg p-3 text-primary justify-center'>
            <Crosshair />
            {listingDetail?.possesion}
          </h2>

          <h2 className='flex gap-2 items-center bg-purple-100 
            rounded-lg p-3 text-primary justify-center'>
            <SquareCheckBig />
            {listingDetail?.reraNumber}
          </h2>

        </div>

      </div>

      <div className='mt-4'>
        <h2 className='text-2xl font-bold py-3'>What's Special</h2>
        <p className='text-gray-600'>{listingDetail?.description}</p>
      </div>

      <div>
        <h2 className='text-2xl font-bold py-3'>Find On Map</h2>
        <GoogleMapSection
          coordinates={listingDetail?.coordinates}
          listing={[listingDetail]}
        />
      </div>

      <div>
        <h2 className='text-2xl font-bold py-3'>Connectivity</h2>
        {listingDetail?.connectivity && listingDetail?.connectivity.length > 0 ? (
          <Carousel className="w-full">
            <CarouselContent className="flex gap-4">
              {listingDetail?.connectivity.map((connection, index) => (
                <CarouselItem key={index} className="basis-72 ">
                  <div className="flex h-18 items-center gap-3 bg-purple-100 p-4 rounded-lg ">
                    <MapPin className="text-primary" />
                    <div className="flex flex-col">
                      <h3 className="text-lg font-medium text-primary">{connection.name}</h3>
                      <p className="text-gray-600 text-sm">{connection.distance} km away</p>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Navigation Buttons */}
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        ) : (
          <p className="text-gray-500 mt-2 flex items-center gap-2">
            <MapPinOff className="text-gray-500" /> No connectivity available
          </p>
        )}




      </div>

      <div>
        <h2 className='text-2xl font-bold py-3'>Amenities</h2>
        {listingDetail?.amenities && listingDetail?.amenities.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-3">
            {listingDetail?.amenities.map((amenity, index) => (
              <div key={index} className="flex items-center gap-2 text-gray-700">
                <Check className="text-green-500" />
                {amenity}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 mt-2">No amenities available</p>
        )}
      </div>

      <div>

        <h2 className='text-2xl font-bold py-3'>Contact Agent</h2>

        <AgentDetail listingDetail={listingDetail} />
      </div>

    </div>
  );

}

export default Details