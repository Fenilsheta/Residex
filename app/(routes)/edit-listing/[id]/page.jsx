"use client"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import React, { useEffect, useState } from 'react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Formik } from "formik"
import { useParams, usePathname, useRouter } from "next/navigation"
import { supabase } from "utils/supabase/client"
import { toast } from "sonner"
import { useUser } from "@clerk/nextjs"
// import { FileUpload } from "app/(routes)/edit-listing/_components/FileUpload";
import FileUpload from "app/(routes)/edit-listing/_components/FileUpload"
import { Loader } from "lucide-react"
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




function EditListing({ params }) {


    const { user } = useUser();
    const router = useRouter();
    const [listing, setListing] = useState([]);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // console.log(params.split('/')[2]);
        user && verifyUserRecord();
    }, [user]);

    const verifyUserRecord = async () => {
        const { data, error } = await supabase
            .from('listing')
            .select('*,listingImages(listing_id,url)')
            .eq('createdBy', user?.primaryEmailAddress?.emailAddress)
            .eq('id', params.id);
        if (data) {
            console.log(data);
            setListing(data[0]);
        }
        if (data?.length <= 0) {
            router.replace('/')
        }
    }

    const onSubmitHandler = async (formValue) => {
        setLoading(true);
        const { data, error } = await supabase
            .from('listing')
            .update(formValue)
            .eq('id', params.id)
            .select();

        if (data) {
            console.log(data);
            toast('Listing updated and published')
            setLoading(false)
        }

        for (const image of images) {
            setLoading(true);
            const file = image;
            const fileName = Date.now().toString();
            const fileExt = fileName.split('.').pop();
            const { data, error } = await supabase.storage
                .from('listingImages')
                .upload(`${fileName}`, file, {
                    contentType: `image/${fileExt}`,
                    upsert: false
                });

            if (error) {
                setLoading(false);
                toast('Error while uploading images')
            }
            else {
                const imageUrl = process.env.NEXT_PUBLIC_IMAGE_URL + fileName;

                const { data, error } = await supabase
                    .from('listingImages')
                    .insert([
                        { url: imageUrl, listing_id: params?.id }
                    ])
                    .select();

                if (error) {
                    setLoading(false);
                }
            }
            setLoading(false);

        }

    }

    const publishBtnHandler=async()=>{

        setLoading(true)
        const { data, error } = await supabase
            .from('listing')
            .update({ active: true })
            .eq('id', params?.id)
            .select()
        
            if(data){
                setLoading(false)
                toast('Listing Publish')
            }
    }

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
                    console.log(values);
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
                                    <input type="number" placeholder="Ex.2" name="bedroom" defaultValue={listing?.bedroom}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="flex gap-2 flex-col">
                                    <h2 className="text-gray-500">Bathroom</h2>
                                    <input type="number" placeholder="Ex.2" name="bathroom" defaultValue={listing?.bathroom} onChange={handleChange} />
                                </div>
                                <div className="flex gap-2 flex-col">
                                    <h2 className="text-gray-500">Built In</h2>
                                    <input type="number" placeholder="Ex.1900 Sq.ft" name="builtIn" defaultValue={listing?.builtIn} onChange={handleChange} />
                                </div>

                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                <div className="flex gap-2 flex-col">
                                    <h2 className="text-gray-500">Parking</h2>
                                    <input type="number" placeholder="Ex.2" name="parking" defaultValue={listing?.parking} onChange={handleChange} />
                                </div>
                                <div className="flex gap-2 flex-col">
                                    <h2 className="text-gray-500">Lot Size(Sq.Ft)</h2>
                                    <input type="number" placeholder="" name="lotSize" defaultValue={listing?.lotSize} onChange={handleChange} />
                                </div>
                                <div className="flex gap-2 flex-col">
                                    <h2 className="text-gray-500">Area(Sq.Ft)</h2>
                                    <input type="number" placeholder="Ex.1900" name="area" defaultValue={listing?.area} onChange={handleChange} />
                                </div>

                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                <div className="flex gap-2 flex-col">
                                    <h2 className="text-gray-500">Selling Price($)</h2>
                                    <input type="number" placeholder="400000" name="price" defaultValue={listing?.price} onChange={handleChange} />
                                </div>
                                <div className="flex gap-2 flex-col">
                                    <h2 className="text-gray-500">HOA (Per Month)($)</h2>
                                    <input type="number" placeholder="100" name="hoa" defaultValue={listing?.hoa} onChange={handleChange} />
                                </div>

                            </div>

                            <div className="grid grid-cols-1 gap-10">
                                <div className="flex gap-2 flex-col">
                                    <h2 className="text-gray-500">Description</h2>
                                    <textarea placeholder="" className="border-gray-500" name="description" defaultValue={listing?.description} onChange={handleChange} />
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
    )
}

export default EditListing