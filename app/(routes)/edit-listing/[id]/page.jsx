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

const amenitiesList = [
    "Air Conditioning", "Barbeque", "Dryer", "Gym", "Laundry",
    "Lawn", "Microwave", "Outdoor Shower", "Refrigerator", "Sauna",
    "Swimming Pool", "TV Cable", "Washer", "WiFi", "Window Coverings"
  ];

function EditListing() {
  const params = useParams();
  const { user } = useUser();
  const router = useRouter();
  const [listing, setListing] = useState({});
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [listingCount, setListingCount] = useState(0);
  const [selectedAmenities, setSelectedAmenities] = useState([]);

  const handleCheckboxChange = (amenity) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter((item) => item !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

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
    setSelectedAmenities(data.amenities || []); // Load amenities
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

    const updatedFormValue = {
        ...formValue,
        amenities: selectedAmenities.length > 0 ? selectedAmenities : null, // Set NULL if empty
    };

    // ✅ Update Listing in Database
    const { data, error } = await supabase
        .from("listing")
        .update(updatedFormValue)
        .eq('id', params.id)
        .select();

    if (error) {
        console.error("❌ Error updating property:", error);
        setLoading(false);
        toast.error("❌ Error updating property.");
        return;
    }

    console.log("✅ Listing Updated:", data);
    toast.success("🎉 Property updated successfully!");

    // ✅ Upload Images
    for (const image of images) {
        setLoading(true);
        const file = image;
        const fileName = Date.now().toString();
        const fileExt = file.name.split('.').pop(); // Fix filename extraction
        const { data: imageData, error: imageError } = await supabase.storage
            .from('listingImages')
            .upload(`${fileName}.${fileExt}`, file, {
                contentType: `image/${fileExt}`,
                upsert: false
            });

        if (imageError) {
            console.error("❌ Image Upload Error:", imageError);
            toast.error("Error uploading images");
            continue; // Continue to next image
        }

        const imageUrl = process.env.NEXT_PUBLIC_IMAGE_URL + fileName + "." + fileExt;

        await supabase
            .from('listingImages')
            .insert([{ url: imageUrl, listing_id: params?.id }])
            .select();
        
        setLoading(false);
    }

    // ✅ ONLY UPDATE LISTING COUNT IF PROPERTY WAS POSTED SUCCESSFULLY
    const updatedCount = listingCount + 1;

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

    if (data) {
      setLoading(false);
      toast.success("🎉 Listing Published!");
    }

    
  };

  return (
    <div className='px-10 md:px-20'>
        <h2 className='font-bold text-2xl'>Enter some more details about your listing</h2>

        <Formik
            initialValues={{
                type: '',
                propertyType: '',
                profileImage: user?.imageUrl,
                fullName: user?.fullName

            }}
            onSubmit={(values) => {
                
                onSubmitHandler(values);
            }}
        >
            {({
                values,
                handleChange,
                handleSubmit
            }) => (
                <form onSubmit={handleSubmit}>
                    <div className='p-5 border rounded-lg shadow-md grid gap-7 mt-6'>
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10'>
                            <div className="flex flex-col gap-2">
                                <h2 className="text-lg text-slate-500">Do you want to Rent it Sell it?</h2>
                                <RadioGroup defaultValue={listing?.type}
                                    onValueChange={(v) => values.type = v}>
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
                            <div className="flex flex-col gap-2">
                                <h2 className='text-lg text-slate-500'>Property Type</h2>
                                <Select onValueChange={(e) => values.propertyType = e} defaultValue={listing?.propertyType} name="propertyType">
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder={listing?.propertyType ? listing?.propertyType : "Select Property Type"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Single Family House">Single Family House</SelectItem>
                                        <SelectItem value="Town House">Town House</SelectItem>
                                        <SelectItem value="Condo">Condo</SelectItem>
                                    </SelectContent>
                                </Select>

                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            <div className="flex gap-2 flex-col">
                                <h2 className="text-gray-500">Bedroom</h2>
                                <input className="border-gray-500 border 2px" type="number" placeholder="Ex.2" name="bedroom" defaultValue={listing?.bedroom}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="flex gap-2 flex-col">
                                <h2 className="text-gray-500">Bathroom</h2>
                                <input className="border-gray-500 border 2px" type="number" placeholder="Ex.2" name="bathroom" defaultValue={listing?.bathroom} onChange={handleChange} />
                            </div>
                            <div className="flex gap-2 flex-col">
                                <h2 className="text-gray-500">Built In</h2>
                                <input className="border-gray-500 border 2px" type="number" placeholder="Ex.1900 Sq.ft" name="builtIn" defaultValue={listing?.builtIn} onChange={handleChange} />
                            </div>

                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            <div className="flex gap-2 flex-col">
                                <h2 className="text-gray-500">Parking</h2>
                                <input className="border-gray-500 border 2px" type="number" placeholder="Ex.2" name="parking" defaultValue={listing?.parking} onChange={handleChange} />
                            </div>
                            <div className="flex gap-2 flex-col">
                                <h2 className="text-gray-500">Lot Size(Sq.Ft)</h2>
                                <input className="border-gray-500 border 2px" type="number" placeholder="" name="lotSize" defaultValue={listing?.lotSize} onChange={handleChange} />
                            </div>
                            <div className="flex gap-2 flex-col">
                                <h2 className="text-gray-500">Area(Sq.Ft)</h2>
                                <input className="border-gray-500 border 2px" type="number" placeholder="Ex.1900" name="area" defaultValue={listing?.area} onChange={handleChange} />
                            </div>

                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            <div className="flex gap-2 flex-col">
                                <h2 className="text-gray-500">Selling Price($)</h2>
                                <input className="border-gray-500 border 2px" type="number" placeholder="400000" name="price" defaultValue={listing?.price} onChange={handleChange} />
                            </div>
                            <div className="flex gap-2 flex-col">
                                <h2 className="text-gray-500">HOA (Per Month)($)</h2>
                                <input className="border-gray-500 border 2px" type="number" placeholder="100" name="hoa" defaultValue={listing?.hoa} onChange={handleChange} />
                            </div>

                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-10">
                            <div className="flex gap-2 flex-col">
                            <h2 className="text-lg text-slate-500">Select Amenities</h2>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                {amenitiesList.map((amenity) => (
                                    <label key={amenity} className="flex gap-2 items-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedAmenities.includes(amenity)}
                                            onChange={() => handleCheckboxChange(amenity)}
                                            defaultValue={listing?.amenities}
                                        />
                                        {amenity}
                                    </label>
                                ))}
                            </div>
                            </div>
                           

                        </div>

                        <div className="grid grid-cols-1 gap-10">
                            <div className="flex gap-2 flex-col">
                                <h2 className="text-gray-500">Description</h2>
                                <textarea placeholder=""  className="border-gray-500 border 2px" name="description" defaultValue={listing?.description} onChange={handleChange} />
                            </div>
                        </div>

                        <div>
                            <h2 className="font-lg text-gray-500 my-2">Upload Property Images</h2>
                            <FileUpload
                                setImages={(value) => setImages(value)}
                                imageList={listing.listingImages}
                            />
                        </div>

                        <div className="flex gap-7 justify-end">
                            <div className="flex gap-4">
                                <Button disabled={loading} variant="outline" className="text-primary border-primary">
                                    {loading ? <Loader className="animate-spin" /> : 'Save'}</Button>

                                <AlertDialog>
                                    <AlertDialogTrigger asChild><Button type="button" disabled={loading} className="">
                                    {loading ? <Loader className="animate-spin" /> : 'Save & Publish'}</Button></AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Ready to Publish?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Do you really want to publish the listing?
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={()=>publishBtnHandler()}>
                                                {loading?<Loader className="animate-spin"/>:'Countinue'}
                                                </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>

                                
                            </div>

                        </div>

                    </div>
                </form>)}
        </Formik>
    </div>
);
}

export default EditListing;
