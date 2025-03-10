"use client"
import React from 'react'
import Header from './_components/Header'
import Footer from './_components/Footer'
import { LoadScript } from '@react-google-maps/api'

function Provider({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <LoadScript
      googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_PLACE_API_KEY}
      libraries={['places']}
      >
      <Header />
      <div className='flex-1 mt-[90px]'>
        {children}
      </div>
      <Footer/>
      </LoadScript>
    </div>
  )
}

export default Provider