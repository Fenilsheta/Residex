"use client";
import { Button } from "@/components/ui/button";
import { SignOutButton, useUser } from "@clerk/nextjs";
import { Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { supabase } from "utils/supabase/client";
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
  const [userRole, setUserRole] = useState(null);
  const [listingCount, setListingCount] = useState(0);
  const [canPostListing, setCanPostListing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserRole();
      fetchUserListingCount();
    }
  }, [user]);

  /** ✅ Fetch User Role from Supabase */
  const fetchUserRole = async () => {
    const { data, error } = await supabase
      .from("admin") // Your table with roles
      .select("role")
      .eq("email", user?.primaryEmailAddress?.emailAddress)
      .single();

    if (data) {
      setUserRole(data.role);
    } else {
      setUserRole("user"); // Default role if not found
    }
  };

  /** ✅ Fetch Count of Listings User Has Posted */
  const fetchUserListingCount = async () => {
    const { count, error } = await supabase
      .from("listing")
      .select("*", { count: "exact" })
      .eq("createdBy", user?.primaryEmailAddress?.emailAddress);

    if (count !== null) {
      setListingCount(count);
    }
  };

  /** ✅ Determine If User Can Post a Listing */
  useEffect(() => {
    if (userRole === "admin") {
      setCanPostListing(true); // Admin has no limit
    } else if (userRole === "agent" && listingCount < 10) {
      setCanPostListing(true); // Agents can post up to 10
    } else if (userRole === "user" && listingCount < 1) {
      setCanPostListing(true); // Regular users can post only 1
    } else {
      setCanPostListing(false); // Prevents posting
    }
  }, [userRole, listingCount]);

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
        {/* ✅ Show "Post Your Ad" button only if user is allowed */}
        {isSignedIn && canPostListing && (
          <Link href={"/add-new-listing"}>
            <Button className="flex gap-2">
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
