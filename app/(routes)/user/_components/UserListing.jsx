import { Button } from '@/components/ui/button';
import { useUser } from '@clerk/nextjs'
import { BathIcon, BedDouble, MapPin, Ruler, Trash } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react'
import { supabase } from 'utils/supabase/client'
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
} from "@/components/ui/alert-dialog"
import { toast } from 'sonner';

function UserListing() {

    const { user } = useUser();
    const [listing, setListing] = useState([]);

    useEffect(() => {
        if (user) GetUserListing();
    }, [user]);

    const GetUserListing = async () => {
        const { data, error } = await supabase
            .from('listing')
            .select(`*, listingImages(url, listing_id)`)
            .eq('createdBy', user?.primaryEmailAddress.emailAddress);

        if (error) {
            console.error("Error fetching listings:", error);
            toast.error("Failed to load listings.");
        } else {
            setListing(data);
        }
    };

    /** ✅ Delete Listing & Decrement Count */
    const deleteBtnHandler = async (propertyId) => {
        try {
            // ✅ Fetch user from "admin" table
            const { data: adminData, error: adminError } = await supabase
                .from("admin")
                .select("id, listing_count")
                .eq("email", user?.primaryEmailAddress?.emailAddress)
                .single();

            if (adminError || !adminData) {
                console.error("❌ Error fetching admin data:", adminError);
                return;
            }

            // ✅ Delete listing images first
            const { error: imageError } = await supabase
                .from('listingImages')
                .delete()
                .eq('listing_id', propertyId);

            if (imageError) throw new Error(imageError.message);

            // ✅ Delete the listing
            const { error: listingError } = await supabase
                .from('listing')
                .delete()
                .eq('id', propertyId);

            if (listingError) throw new Error(listingError.message);

            // ✅ Decrease listing count (ensure it doesn't go negative)
            const updatedCount = Math.max(0, adminData.listing_count - 1);

            const { error: updateError } = await supabase
                .from("admin")
                .update({ listing_count: updatedCount })
                .eq("id", adminData.id);

            if (updateError) throw new Error(updateError.message);

            toast.success("Property deleted successfully!");

            // ✅ Refresh Listings
            GetUserListing();
        } catch (error) {
            console.error("❌ Error deleting property:", error.message);
            toast.error("Failed to delete property. Try again!");
        }
    };

    return (
        <div>
            <h2 className='font-bold text-2xl'>Manage Your Listing</h2>
            <div className='relative grid grid-cols-1 md:grid-cols-2 gap-3'>
                {listing && listing.map((item, index) => (
                    <div key={index} className='p-3 hover:border hover:border-primary cursor-pointer rounded-lg '>
                        <h2 className='bg-primary m-1 rounded-lg text-white absolute px-2 text-sm p-1'>
                            {item.active ? 'Published' : 'Draft'}
                        </h2>
                        <Image
                            src={item?.listingImages[0] ? item?.listingImages[0]?.url : '/placeholder.svg'}
                            width={800}
                            height={180}
                            alt='images'
                            unoptimized={true}
                            className='rounded-lg object-cover h-[170px]'
                        />
                        <div className='flex mt-2 flex-col gap-2'>
                            <h2 className='font-bold text-xl'>$ {item?.price}</h2>
                            <h2 className='flex gap-2 text-sm text-gray-400'>
                                <MapPin className='h-4 w-4' />{item?.address}
                            </h2>

                            <div className='flex gap-2 mt-2 justify-between'>
                                <h2 className='flex gap-2 w-full text-sm bg-slate-200 rounded-md p-2 text-gray-500 justify-center items-center'>
                                    <BedDouble />{item?.bedroom}
                                </h2>

                                <h2 className='flex gap-2 w-full text-sm bg-slate-200 rounded-md p-2 text-gray-500 justify-center items-center'>
                                    <BathIcon />{item?.bathroom}
                                </h2>

                                <h2 className='flex gap-2 w-full text-sm bg-slate-200 rounded-md p-2 text-gray-500 justify-center items-center'>
                                    <Ruler />{item?.area}
                                </h2>
                            </div>

                            <div className='flex gap-4 justify-between'>
                                <Link href={'/view-listing/' + item?.id} className='w-full'>
                                    <Button size='sm' variant='outline' className='w-full'>View</Button>
                                </Link>

                                <Link href={'/edit-listing/' + item?.id} className='w-full'>
                                    <Button size='sm' className='w-full'>Edit</Button>
                                </Link>

                                {/* ✅ Delete Button with Confirmation */}
                                <AlertDialog>
                                    <AlertDialogTrigger>
                                        <Button size='sm' variant='destructive'><Trash /></Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Are you sure you want to delete this property? This action cannot be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => deleteBtnHandler(item?.id)}>Delete Property</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>

                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default UserListing;
