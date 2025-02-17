"use client";
import { UserButton, UserProfile } from "@clerk/nextjs";
import { Building2, User } from "lucide-react";
import React, { useEffect, useState } from "react";
import UserListing from "../_components/UserListing";
import { useRouter, usePathname } from "next/navigation"; // ✅ Import Router

function UserPage() {
  const router = useRouter();
  const pathname = usePathname(); 

  // ✅ Detect if URL already has "/user/my-listing" and set the active tab accordingly
  const [activeTab, setActiveTab] = useState(pathname.includes("my-listing") ? "my-listing" : "profile");

  useEffect(() => {
    if (activeTab === "my-listing") {
      router.push("/user/my-listing"); // ✅ Navigate to /user/my-listing when switching to My Listing
    } else {
      router.push("/user"); // ✅ Navigate to /user when switching back to Profile
    }
  }, [activeTab]);

  return (
    <div className="my-6 md:px-10 lg:px-32 w-full">
      <h2 className="font-bold text-2xl py-3">Profile</h2>

      {/* ✅ Navigation Tabs */}
      <div className="flex space-x-4 border-b">
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2 ${activeTab === "profile" ? "border-b-2 border-primary font-bold" : "text-gray-500"}`}
        >
          <User className="inline h-5 w-5 mr-1" /> Profile
        </button>

        <button
          onClick={() => setActiveTab("my-listing")}
          className={`px-4 py-2 ${activeTab === "my-listing" ? "border-b-2 border-primary font-bold" : "text-gray-500"}`}
        >
          <Building2 className="inline h-5 w-5 mr-1" /> My Listing
        </button>
      </div>

      {/* ✅ Render content based on the active tab */}
      <div className="mt-6">
        {activeTab === "profile" && <UserProfile />}
        {activeTab === "my-listing" && <UserListing />}
      </div>
    </div>
  );
}

export default UserPage;
