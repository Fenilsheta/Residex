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

  /** ✅ Fetch User Role & Listing Count */
  useEffect(() => {
    if (user) {
      fetchUserRole();
      fetchUserListingCount();
    }
  }, [user]);

  /** ✅ Fetch User Role */
  const fetchUserRole = async () => {
    const { data, error } = await supabase
      .from("admin") // Ensure this table has a role column
      .select("role")
      .eq("email", user?.primaryEmailAddress?.emailAddress)
      .single();

    if (error) {
      console.error("Error fetching user role:", error);
      return;
    }

    if (data) {
      setUserRole(data.role);
    } else {
      setUserRole("user"); // Default to "user"
    }
  };

  /** ✅ Fetch Count of Listings the User Has */
  const fetchUserListingCount = async () => {
    const { count, error } = await supabase
      .from("listing")
      .select("*", { count: "exact", head: true })
      .eq("createdBy", user?.primaryEmailAddress?.emailAddress);

    if (error) {
      console.error("Error fetching listing count:", error);
      return;
    }

    if (count !== null) {
      setListingCount(count);
    }
  };

  /** ✅ Check if User Can Post a Listing */
  const canPostListing = () => {
    if (userRole === "admin") return true; // ✅ Admin can post unlimited
    if (userRole === "agent" && listingCount < 10) return true; // ✅ Agent can post 10
    if (userRole === "user" && listingCount < 1) return true; // ✅ User can post 1
    return false; // 🚫 Otherwise, they cannot post
  };

  /** ✅ Handle Adding New Listing */
  const nextHandler = async () => {
    if (!canPostListing()) {
      toast("You have reached your listing limit.");
      return;
    }

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

    // ✅ Update user's listing count in the admin table
    await supabase
      .from("admin")
      .update({ listing_count: listingCount + 1 }) // Increment count
      .eq("email", user?.primaryEmailAddress?.emailAddress);

    setLoader(false);
    toast("New property added successfully.");
    router.push("/edit-listing/" + data[0].id); // ✅ Redirect after posting
  };

  return canPostListing() ? (
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
  ) : (
    <div className="mt-10 text-center">
      <h2 className="text-red-500 font-bold text-xl">
        You have reached your listing limit.
      </h2>
    </div>
  );
}

export default AddNewListing;
