"use client";
import { Button } from "@/components/ui/button";
import { SignOutButton, useUser } from "@clerk/nextjs";
import { Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const [userRole, setUserRole] = useState(null);
  const [listingCount, setListingCount] = useState(0);
  const [canPostListing, setCanPostListing] = useState(false);

  /** ✅ Fetch or Create User */
  useEffect(() => {
    if (user) {
      fetchOrCreateUser();
    }
  }, [user]);

  const fetchOrCreateUser = async () => {
    if (!user) return;

    // ✅ Check if user exists in the "admin" table
    const { data, error } = await supabase
      .from("admin")
      .select("id, role, listing_count")
      .eq("email", user?.primaryEmailAddress?.emailAddress)
      .single();

    if (error) {
      console.warn("🔍 User not found, inserting new user as 'user' role...");

      // ✅ Insert user ONLY if not found
      const { data: newUser, error: insertError } = await supabase
        .from("admin")
        .insert([
          {
            email: user?.primaryEmailAddress?.emailAddress,
            role: "user", // Default role
            listing_count: 0,
            
          },
        ])
        .select()
        .single();

      if (insertError) {
        console.error("❌ Error creating user:", insertError);
        return;
      }

      console.log("✅ New user added:", newUser);
      setUserRole(newUser.role);
      setListingCount(newUser.listing_count);
      checkCanPost(newUser.role, newUser.listing_count);
    } else {
      console.log("✅ Existing user found:", data);
      setUserRole(data.role);
      setListingCount(data.listing_count);
      checkCanPost(data.role, data.listing_count);
    }
  };

  /** ✅ Check If User Can Post Listing */
  const checkCanPost = (role, count) => {
    if (role === "admin") {
      setCanPostListing(true);
    } else if (role === "agent" && count < 10) {
      setCanPostListing(true);
    } else if (role === "user" && count < 1) {
      setCanPostListing(true);
    } else {
      setCanPostListing(false);
    }
  };

  /** ✅ Handle Button Click */
  const handlePostClick = (e) => {
    if (!canPostListing) {
      e.preventDefault();
      toast.error("You have reached your listing limit!");
    }
  };

  return (
    <div className="p-6 px-10 flex justify-between shadow-sm fixed top-0 w-full z-10 bg-white">
      <div className="flex gap-12 items-center">
        <Image src={"/Residex.svg"} width={150} height={150} alt="logo" />
        <ul className="hidden md:flex gap-10">
          <Link href={"/"}>
            <li className={`hover:text-primary font-medium text-lg cursor-pointer ${path === "/" && "text-primary"}`}>
              For Sell
            </li>
          </Link>
          <Link href={"/rent"}>
            <li className={`hover:text-primary font-medium text-lg cursor-pointer ${path === "/rent" && "text-primary"}`}>
              For Rent
            </li>
          </Link>
          <li className="hover:text-primary font-medium text-lg cursor-pointer">Agent Finder</li>
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
