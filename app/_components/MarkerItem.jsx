
import { MarkerF, OverlayView } from '@react-google-maps/api'
import React, { useState } from 'react'
import MarkerListingItem from './MarkerListingItem'

function MarkerItem({item}) {
    const [selectedListing,setselectedListing]=useState();
  return (
    <div>
        <MarkerF
            position={item.coordinates}
            onClick={()=>setselectedListing(item)}
            icon={{
                url:'/pin1.png',
                scaledSize: {
                    width:60,
                    height:60
                }
            }}
        >

           {selectedListing&&  <OverlayView
            position={selectedListing.coordinates}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            >
                <div>
                    <MarkerListingItem
                    closeHandler={()=>setselectedListing(null)}
                    item={selectedListing}/>
                </div>
                
            </OverlayView>}

        </MarkerF>
    </div>
  )
}

export default MarkerItem