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
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  // ✅ Call admin check when user is available
  useEffect(() => {
    if (user) {
      checkAdminRole();
    }
  }, [user]); // Re-run if user changes

  // ✅ Check if user is an admin
  const checkAdminRole = async () => {
    const { data, error } = await supabase
      .from("admin")
      .select("id")
      .eq("email", user?.primaryEmailAddress?.emailAddress)
      .single();

    if (data) {
      setIsAdmin(true); // ✅ User is admin
    } else {
      setIsAdmin(false);
      toast("Unauthorized: Only admins can add properties.");
      router.push("/"); // Redirect unauthorized users
    }
  };

  const nextHandler = async () => {
    if (!isAdmin) return; // ✅ Extra safety check

    setLoader(true);

    const { data, error } = await supabase
      .from("listing")
      .insert([
        {
          address: selectedAddress.label,
          coordinates: coordinates,
          createdBy: user?.primaryEmailAddress?.emailAddress, // ✅ Save admin email as reference
          active: false,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (data) {
      setLoader(false);
      toast("New property added successfully.");
      router.push("/edit-listing/"+data[0].id); // Redirect to admin dashboard
    }
    if (error) {
      setLoader(false);
      console.log(error)
      toast("Server error! Unable to add property.");
    }
  };

  return isAdmin ? (
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
  ) : null;
}

export default AddNewListing;
