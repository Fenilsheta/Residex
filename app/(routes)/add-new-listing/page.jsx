"use client";
import React, { useState, useEffect } from "react";
import GoogleAddressSearch from "app/_components/GoogleAddressSearch";
import { Button } from "@/components/ui/button";
import { supabase } from "utils/supabase/client";
import { useUser } from "@clerk/nextjs";
import { toast } from 'sonner';
import { useRouter } from "next/navigation";

function AddNewListing() {
  const [selectedAddress, setSelectedAddress] = useState();
  const [coordinates, setCoordinates] = useState();
  const { user } = useUser();
  const [loader, setLoader] = useState(false);
  const router = useRouter();

  /** ✅ Handle Adding New Listing */
  const nextHandler = async () => {
    setLoader(true);

    const { data, error } = await supabase
      .from("listing")
      .insert([
        {
          address: selectedAddress?.label,
          coordinates: coordinates,
          createdBy: user?.primaryEmailAddress?.emailAddress, // ✅ Track property owner
          active: false,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      setLoader(false);
      toast("Server error! Unable to add property.");
      return;
    }

    setLoader(false);
    toast("New property added successfully.");
    router.push("/edit-listing/" + data[0].id); // ✅ Redirect after posting
  };

  return (
    <div className="mt-10 md:mx-56 lg:mx-80">
      <div className="p-10 flex flex-col gap-5 items-center justify-center">
        <h2 className="font-bold text-2xl">Add New Listing</h2>
        <div className="p-10 rounded-lg border w-full shadow-md flex flex-col gap-5">
          <h2 className="text-gray-500 font-medium">
            Enter Address to List Property
          </h2>

          <GoogleAddressSearch
            selectedAddress={(value) => setSelectedAddress(value)}
            setCoordinates={(value) => setCoordinates(value)}
          />

          <Button
            disabled={!selectedAddress || !coordinates || loader}
            onClick={nextHandler}
          >
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AddNewListing;
