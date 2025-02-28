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
  const [userRole, setUserRole] = useState(null);
  const [listingCount, setListingCount] = useState(0);
  const router = useRouter();

  /** ✅ Fetch User Role */
  useEffect(() => {
    if (user) {
      fetchUserRole();
    }
  }, [user]);

  const fetchUserRole = async () => {
    const { data, error } = await supabase
      .from("admin")
      .select("role")
      .eq("email", user?.primaryEmailAddress?.emailAddress)
      .single();

    if (error) {
      console.error("Error fetching user role:", error);
      setUserRole("user"); // Fallback to default role
      return;
    }

    setUserRole(data?.role || "user"); // Default to "user"
  };

  /** ✅ Fetch Listing Count After Role is Set */
  useEffect(() => {
    if (userRole && userRole !== "admin") {
      fetchUserListingCount();
    }
  }, [userRole]);

  const fetchUserListingCount = async () => {
    if (!user) return;

    const { data: adminData, error: adminError } = await supabase
      .from("admin")
      .select("id")
      .eq("email", user?.primaryEmailAddress?.emailAddress)
      .single();

    if (adminError || !adminData) {
      console.error("Error fetching admin ID:", adminError);
      return;
    }

    const { count, error } = await supabase
      .from("listing")
      .select("*", { count: "exact", head: true })
      .eq("createdby", adminData.id);

    if (count !== null) {
      setListingCount(count);
    }
  };

  /** ✅ Check If User Can Post a Listing */
  const canPostListing = () => {
    if (!userRole) return null; // Prevents checking before userRole is set
    if (userRole === "admin") return true;
    if (userRole === "agent" && listingCount < 10) return true;
    if (userRole === "user" && listingCount < 1) return true;
    return false;
  };

  /** ✅ Handle Adding New Listing */
  const nextHandler = async () => {
    if (!canPostListing()) {
      toast("You have reached your listing limit.");
      return;
    }

    setLoader(true);

    const { data: adminData, error: adminError } = await supabase
      .from("admin")
      .select("id")
      .eq("email", user?.primaryEmailAddress?.emailAddress)
      .single();

    if (adminError || !adminData) {
      setLoader(false);
      toast("Error fetching user ID.");
      return;
    }

    const { data, error } = await supabase
      .from("listing")
      .insert([
        {
          address: selectedAddress?.label,
          coordinates: coordinates,
          createdBy: adminData.id, // ✅ Use UUID instead of email
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

    await supabase
      .from("admin")
      .update({ listing_count: listingCount + 1 }) // ✅ Increment count
      .eq("id", adminData.id);

    setLoader(false);
    toast("New property added successfully.");
    router.push("/edit-listing/" + data[0].id);
  };

  return userRole === null ? (
    <div className="mt-10 text-center">
      <h2 className="text-gray-500 font-bold text-xl">Loading...</h2>
    </div>
  ) : canPostListing() ? (
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

          <Button disabled={!selectedAddress || !coordinates || loader} onClick={nextHandler}>
            Submit
          </Button>
        </div>
      </div>
    </div>
  ) : (
    <div className="mt-10 text-center">
      <h2 className="text-red-500 font-bold text-xl">You have reached your listing limit.</h2>
    </div>
  );
}

export default AddNewListing;
