"use client";
import { Button } from "@/components/ui/button";
import { SignOutButton, useUser } from "@clerk/nextjs";
import { Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { supabase } from "utils/supabase/client";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function Header() {
  const path = usePathname();
  const { user, isSignedIn } = useUser();
  const router = useRouter();
  const [userRole, setUserRole] = useState(null);
  const [listingCount, setListingCount] = useState(0);
  const [canPostListing, setCanPostListing] = useState(false);
  const [loader, setLoader] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState();
  const [coordinates, setCoordinates] = useState();

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    const { data, error } = await supabase
      .from("admin")
      .select("id, role, listing_count")
      .eq("email", user?.primaryEmailAddress?.emailAddress)
      .single();

    if (error || !data) {
      console.error("❌ Error fetching user data:", error);
      setUserRole("user");
      setListingCount(0);
      setCanPostListing(false);
      return;
    }

    console.log("✅ User Data Fetched:", data);
    setUserRole(data.role);
    setListingCount(data.listing_count);
    checkCanPost(data.role, data.listing_count);
  };

  const checkCanPost = (role, count) => {
    console.log(`Checking permissions for role: ${role}, listing count: ${count}`);

    if (role === "admin") {
      setCanPostListing(true);
    } else if (role === "agent") {
      setCanPostListing(count < 10);
    } else if (role === "user") {
      setCanPostListing(count < 1);
    } else {
      setCanPostListing(false);
    }

    console.log("🚀 Updated Can Post Listing:", canPostListing);
  };

  const handlePostClick = (e) => {
    if (!canPostListing) {
      e.preventDefault();
      toast.error("🚫 You have reached your listing limit!");
    }
  };

  const nextHandler = async () => {
    if (!canPostListing) {
      toast.error("🚫 You have reached your listing limit!");
      return;
    }

    setLoader(true);

    const { data: adminData, error: adminError } = await supabase
      .from("admin")
      .select("id, listing_count")
      .eq("email", user?.primaryEmailAddress?.emailAddress)
      .single();

    if (adminError || !adminData) {
      setLoader(false);
      toast.error("Error fetching user ID.");
      return;
    }

    const { data, error } = await supabase
      .from("listing")
      .insert([
        {
          address: selectedAddress?.label,
          coordinates: coordinates,
          createdby: adminData.id,
          active: false,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      setLoader(false);
      toast.error("Server error! Unable to add property.");
      return;
    }

    const updatedCount = adminData.listing_count + 1;

    await supabase
      .from("admin")
      .update({ listing_count: updatedCount })
      .eq("id", adminData.id);

    setListingCount(updatedCount);
    checkCanPost(userRole, updatedCount);

    setLoader(false);
    toast.success("🎉 New property added successfully!");
    router.push("/edit-listing/" + data[0].id);
  };

  return (
    <div className="p-6 px-10 flex justify-between shadow-sm fixed top-0 w-full z-10 bg-white">
      <div className="flex gap-12 items-center">
        <Image src={"/logo.svg"} width={150} height={150} alt="logo" />
        <ul className="hidden md:flex gap-10">
          <Link href={"/"}>
            <li className={`hover:text-primary font-medium text-sm cursor-pointer ${path === "/" && "text-primary"}`}>
              For Sell
            </li>
          </Link>
          <Link href={"/rent"}>
            <li className={`hover:text-primary font-medium text-sm cursor-pointer ${path === "/rent" && "text-primary"}`}>
              For Rent
            </li>
          </Link>
          <li className="hover:text-primary font-medium text-sm cursor-pointer">Agent Finder</li>
        </ul>
      </div>

      <div className="flex gap-2 items-center">
        {isSignedIn && (
          <Link href={canPostListing ? "/add-new-listing" : "#"} onClick={handlePostClick}>
            <Button className="flex gap-2" disabled={!canPostListing}>
              <Plus className="h-5 w-5" /> Post Your Ad
            </Button>
          </Link>
        )}

        {isSignedIn ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Image src={user?.imageUrl} width={35} height={35} alt="user profile" className="rounded-full" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href={"/user"}>Profile</Link>
              </DropdownMenuItem>
              <Link href={"/user/my-listing"}>
                <DropdownMenuItem>My Listing</DropdownMenuItem>
              </Link>
              <DropdownMenuItem>
                <SignOutButton>Logout</SignOutButton>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link href={"/sign-in"}>
            <Button variant="outline">Login</Button>
          </Link>
        )}
      </div>
    </div>
  );
}

export default Header;
