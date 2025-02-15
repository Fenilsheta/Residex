import Image from "next/image";
import ListingMapView from "./_components/ListingMapView";
import { SpeedInsights } from "@vercel/speed-insights/next"
export default function Home() {
  return (
    <div className="p-10">
      <ListingMapView type="Sell"/>
      <SpeedInsights/>
    </div>
  );
}
