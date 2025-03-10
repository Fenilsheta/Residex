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
import { Delete, Loader, Trash } from "lucide-react";
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
    const [connectivity, setConnectivity] = useState([]);

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
        setSelectedAmenities(data.amenities || []);
        setConnectivity(data.connectivity || []); 
    };

    /** ✅ Check If User Can Post a Listing */
    const canPostListing = () => {
        if (userRole === "admin") return true;
        if (userRole === "agent" && listingCount < 10) return true;
        if (userRole === "user" && listingCount < 1) return true;
        return false;
    };

    const handleConnectivityChange = (index, field, value) => {
        const updatedConnectivity = [...connectivity];
        updatedConnectivity[index] = {
            ...updatedConnectivity[index],
            [field]: field === "distance" ? parseFloat(value) : value,
        };
        setConnectivity(updatedConnectivity);
    };

    const addConnectivityField = () => {
        setConnectivity([...connectivity, { name: "", distance: 0 }]);
    };

    const removeConnectivityField = (index) => {
        setConnectivity(connectivity.filter((_, i) => i !== index));
    };


    /** ✅ Handle Listing Submission */
    const onSubmitHandler = async (formValue) => {

        setLoading(true);

        const updatedFormValue = {

            type: formValue.type !== undefined ? formValue.type : listing?.type,
            propertyType: formValue.propertyType !== undefined ? formValue.propertyType : listing?.propertyType,
            configuration: formValue.configuration !== undefined ? formValue.configuration : listing?.configuration,
            developer: formValue.developer !== undefined ? formValue.developer : listing?.developer,
            projectSize: formValue.projectSize !== undefined ? parseFloat(formValue.projectSize) : listing?.projectSize,
            floors: formValue.floors !== undefined ? parseInt(formValue.floors) : listing?.floors,
            landParcel: formValue.landParcel !== undefined ? parseFloat(formValue.landParcel) : listing?.landParcel,
            possesion: formValue.possesion !== undefined ? formValue.possesion : listing?.possesion,
            reraNumber: formValue.reraNumber !== undefined ? formValue.reraNumber : listing?.reraNumber,
            pdpPhone: formValue.pdpPhone !== undefined ? formValue.pdpPhone : listing?.pdpPhone,
            bedroom: formValue.bedroom !== undefined ? parseInt(formValue.bedroom) : listing?.bedroom,
            bathroom: formValue.bathroom !== undefined ? parseInt(formValue.bathroom) : listing?.bathroom,
            builtIn: formValue.builtIn !== undefined ? parseInt(formValue.builtIn) : listing?.builtIn,
            parking: formValue.parking !== undefined ? parseInt(formValue.parking) : listing?.parking,
            lotSize: formValue.lotSize !== undefined ? parseFloat(formValue.lotSize) : listing?.lotSize,
            area: formValue.area !== undefined ? parseFloat(formValue.area) : listing?.area,
            price: formValue.price !== undefined ? parseFloat(formValue.price) : listing?.price,
            amenities: selectedAmenities.length > 0 ? selectedAmenities : listing?.amenities || null,
            connectivity: connectivity.length > 0 ? connectivity : listing?.connectivity || null,
            propertyName: formValue.propertyName !== undefined ? formValue.propertyName : listing?.propertyName,

        };
        console.log("🔍 Updated Form Data Before Sending:", updatedFormValue);


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
                    type: listing?.type || "",
                    profileImage: user?.imageUrl,
                    fullName: user?.fullName
                }}
                enableReinitialize={true}
                onSubmit={(values) => {

                    onSubmitHandler(values);
                }}
            >
                {({
                    values,
                    handleChange,
                    handleSubmit,
                    setFieldValue,
                }) => (
                    <form onSubmit={handleSubmit}>
                        <div className='p-5 border rounded-lg shadow-md  grid gap-7 mt-6'>
                            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10'>
                                <div className="flex flex-col gap-2">
                                    <h2 className="text-lg text-slate-500">Do you want to Rent it Sell it?</h2>
                                    <RadioGroup defaultValue={listing?.type}
                                        value={values.type}
                                        onValueChange={(v) => { setFieldValue("type", v); }}
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

                                <div className="flex gap-2 flex-col">
                                    <h2 className="text-gray-500">Property Name</h2>
                                    <input className="border-gray-500 rounded-md border 2px" type="text" placeholder="Ex. Carslline The Villa" name="propertyName" defaultValue={listing?.propertyName} onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                <div className="flex gap-2 flex-col">
                                    <h2 className="text-gray-500">Developer Name</h2>
                                    <input className="border-gray-500 rounded-md border 2px" type="text" placeholder="Ex. John Doe" name="developer" defaultValue={listing?.developer} onChange={handleChange}
                                    />
                                </div>
                                <div className="flex gap-2 flex-col">
                                    <h2 className="text-gray-500">Project Size</h2>
                                    <input className="border-gray-500 rounded-md border 2px" type="number" placeholder="Ex. 2 Tower/Units" name="projectSize" defaultValue={listing?.projectSize} onChange={handleChange} />
                                </div>
                                <div className="flex gap-2 flex-col">
                                    <h2 className="text-gray-500">Floors</h2>
                                    <input className="border-gray-500 rounded-md border 2px" type="number" placeholder="Ex. 4" name="floors" defaultValue={listing?.floors} onChange={handleChange} />
                                </div>

                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                <div className="flex gap-2 flex-col">
                                    <h2 className="text-gray-500">Bedroom</h2>
                                    <input className="border-gray-500 rounded-md border 2px" type="number" placeholder="Ex.2" name="bedroom" defaultValue={listing?.bedroom}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="flex gap-2 flex-col">
                                    <h2 className="text-gray-500">Bathroom</h2>
                                    <input className="border-gray-500 rounded-md border 2px" type="number" placeholder="Ex.2" name="bathroom" defaultValue={listing?.bathroom} onChange={handleChange} />
                                </div>
                                <div className="flex gap-2 flex-col">
                                    <h2 className="text-gray-500">Built In</h2>
                                    <input className="border-gray-500 rounded-md border 2px" type="number" placeholder="Ex.1900 Sq.ft" name="builtIn" defaultValue={listing?.builtIn} onChange={handleChange} />
                                </div>

                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                <div className="flex gap-2 flex-col">
                                    <h2 className="text-gray-500">Land Parcel</h2>
                                    <input className="border-gray-500 rounded-md border 2px" type="text" placeholder="Ex. 2 Acres" name="landParcel" defaultValue={listing?.landParcel}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="flex gap-2 flex-col">
                                    <h2 className="text-gray-500">Possesion</h2>
                                    <input className="border-gray-500 rounded-md border 2px" type="date" name="possesion" defaultValue={listing?.possesion} onChange={handleChange} />
                                </div>
                                <div className="flex gap-2 flex-col">
                                    <h2 className="text-gray-500">Rera Number</h2>
                                    <input className="border-gray-500 rounded-md border 2px" type="text" placeholder="Ex. 125-sfd...." name="reraNumber" defaultValue={listing?.reraNumber} onChange={handleChange} />
                                </div>

                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                <div className="flex gap-2 flex-col">
                                    <h2 className="text-gray-500">Parking</h2>
                                    <input className="border-gray-500 rounded-md border 2px" type="number" placeholder="Ex.2" name="parking" defaultValue={listing?.parking} onChange={handleChange} />
                                </div>
                                <div className="flex gap-2 flex-col">
                                    <h2 className="text-gray-500">Lot Size(Sq.Ft)</h2>
                                    <input className="border-gray-500 rounded-md border 2px" type="number" placeholder="" name="lotSize" defaultValue={listing?.lotSize} onChange={handleChange} />
                                </div>
                                <div className="flex gap-2 flex-col">
                                    <h2 className="text-gray-500">Area(Sq.Ft)</h2>
                                    <input className="border-gray-500 rounded-md border 2px" type="number" placeholder="Ex.1900" name="area" defaultValue={listing?.area} onChange={handleChange} />
                                </div>

                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                <div className="flex gap-2 flex-col">
                                    <h2 className="text-gray-500">Selling Price($)</h2>
                                    <input className="border-gray-500 rounded-md border 2px" type="number" placeholder="400000" name="price" defaultValue={listing?.price} onChange={handleChange} />
                                </div>
                                <div className="flex gap-2 flex-col">
                                    <h2 className="text-gray-500">Phone Number</h2>
                                    <input className="border-gray-500 rounded-md border 2px" type="number" placeholder="1234567890" name="pdpPhone" defaultValue={listing?.pdpPhone} onChange={handleChange} />
                                </div>
                                <div className="flex gap-2 flex-col">
                                    <h2 className="text-gray-500">Configuration</h2>
                                    <input className="border-gray-500 rounded-md border 2px" type="text" placeholder="1, 2, 3..." name="configuration" defaultValue={listing?.configuration} onChange={handleChange} />
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
                            <div className='grid top-1 grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-10'>
                                <h2 className="text-lg text-slate-500">Connectivity</h2>
                                {connectivity.map((item, index) => (
                                    <div key={index} className="flex gap-4">
                                        <input
                                            type="text"
                                            placeholder="Place Name"
                                            value={item.name}
                                            onChange={(e) => handleConnectivityChange(index, "name", e.target.value)}
                                            className="border p-2 rounded-md w-full"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Distance (km)"
                                            value={item.distance}
                                            onChange={(e) => handleConnectivityChange(index, "distance", e.target.value)}
                                            className="border p-2 rounded-md w-full"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeConnectivityField(index)}
                                            className="bg-red-500 text-white px-3 py-1 rounded hover:shadow-2xl hover:scale-105 transition-all duration-300 ease-in-out"
                                        >
                                            <Trash />
                                        </button>
                                    </div>
                                ))}
                                <div className="flex flex-wrap justify-between items-center mt-4 space-x-3">

                                    <button
                                        type="button"
                                        onClick={addConnectivityField}
                                        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-lg shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 ease-in-out"
                                    >
                                        <h2>+ Add Connectivity</h2>
                                    </button>


                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-lg shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 ease-in-out"
                                    >
                                        {loading ? <Loader className="animate-spin" /> : "Save"}
                                    </button>
                                </div>

                            </div>

                            <div className="grid grid-cols-1 gap-10">
                                <div className="flex gap-2 flex-col">
                                    <h2 className="text-gray-500">Description</h2>
                                    <textarea placeholder="" className="border-gray-500 border 2px" name="description" defaultValue={listing?.description} onChange={handleChange} />
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
                                                <AlertDialogAction onClick={() => publishBtnHandler()}>
                                                    {loading ? <Loader className="animate-spin" /> : 'Countinue'}
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
