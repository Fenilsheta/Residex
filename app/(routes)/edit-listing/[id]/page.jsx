"use client";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Formik } from "formik";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "utils/supabase/client";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import FileUpload from "app/(routes)/edit-listing/_components/FileUpload";
import { Loader } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

function EditListing() {
  const params = useParams();
  const { user } = useUser();
  const router = useRouter();
  const [listing, setListing] = useState({});
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [listingCount, setListingCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchUserRole();
      verifyUserRecord();
    }
  }, [user]);

  const fetchUserRole = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("admin")
      .select("id, role, listing_count")
      .eq("email", user?.primaryEmailAddress?.emailAddress)
      .single();

    if (error || !data) {
      console.error("❌ Error fetching user role:", error);
      setUserRole("user"); // Default to user role
      return;
    }

    console.log("✅ User Role Fetched:", data);
    setUserRole(data.role);
    setListingCount(data.listing_count);
  };

  const verifyUserRecord = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("listing")
      .select("*, listingImages(listing_id, url)")
      .eq("createdBy", user?.primaryEmailAddress?.emailAddress)
      .eq("id", params.id)
      .single();

    if (error) {
      console.error("❌ Error fetching listing:", error);
      router.replace("/");
      return;
    }

    console.log("✅ Listing Fetched:", data);
    setListing(data);
  };

  /** ✅ Check If User Can Post a Listing */
  const canPostListing = () => {
    if (userRole === "admin") return true;
    if (userRole === "agent" && listingCount < 10) return true;
    if (userRole === "user" && listingCount < 1) return true;
    return false;
  };

  /** ✅ Handle Listing Submission */
  const onSubmitHandler = async (formValue) => {
    if (!canPostListing()) {
      toast.error("🚫 You have reached your listing limit!");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("listing")
      .insert([{ ...formValue, createdBy: user?.primaryEmailAddress?.emailAddress }])
      .select();

    if (error) {
      setLoading(false);
      toast.error("❌ Error adding property.");
      return;
    }

    console.log("✅ Listing Added:", data);
    toast.success("🎉 Property added successfully!");

    const updatedCount = listingCount + 1;

    // ✅ Update Listing Count in Admin Table
    const { error: updateError } = await supabase
      .from("admin")
      .update({ listing_count: updatedCount })
      .eq("email", user?.primaryEmailAddress?.emailAddress);

    if (updateError) {
      console.error("❌ Error updating listing count:", updateError);
    }

    setLoading(false);
    router.push("/edit-listing/" + data[0].id);
  };

  /** ✅ Handle Publish Listing */
  const publishBtnHandler = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("listing")
      .update({ active: true })
      .eq("id", params?.id)
      .select();

    if (error) {
      setLoading(false);
      toast.error("❌ Error publishing listing.");
      return;
    }

    toast.success("🎉 Listing Published!");
    setLoading(false);
  };

  return (
    <div className="px-10 md:px-20">
      <h2 className="font-bold text-2xl">Enter some more details about your listing</h2>

      <Formik
        initialValues={{
          type: "",
          propertyType: "",
          profileImage: user?.imageUrl,
          fullName: user?.fullName,
        }}
        onSubmit={(values) => {
          console.log(values);
          onSubmitHandler(values);
        }}
      >
        {({ values, handleChange, handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <div className="p-5 border rounded-lg shadow-md grid gap-7 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                <div className="flex flex-col gap-2">
                  <h2 className="text-lg text-slate-500">Do you want to Rent or Sell?</h2>
                  <RadioGroup
                    defaultValue={listing?.type}
                    onValueChange={(v) => (values.type = v)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Rent" id="Rent" />
                      <Label htmlFor="Rent">Rent</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Sell" id="Sell" />
                      <Label htmlFor="Sell">Sell</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div>
                <h2 className="font-lg text-gray-500 my-2">Upload Property Images</h2>
                <FileUpload setImages={(value) => setImages(value)} imageList={listing.listingImages} />
              </div>

              <div className="flex gap-7 justify-end">
                <div className="flex gap-4">
                  <Button disabled={loading} variant="outline" className="text-primary border-primary">
                    {loading ? <Loader className="animate-spin" /> : "Save"}
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button type="button" disabled={loading} className="">
                        {loading ? <Loader className="animate-spin" /> : "Save & Publish"}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Ready to Publish?</AlertDialogTitle>
                        <AlertDialogDescription>Do you really want to publish the listing?</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => publishBtnHandler()}>
                          {loading ? <Loader className="animate-spin" /> : "Continue"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </form>
        )}
      </Formik>
    </div>
  );
}

export default EditListing;
