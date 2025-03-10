import React, { useState, useEffect } from 'react';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import Image from 'next/image';

function Slider({ imageList }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isSliding, setIsSliding] = useState(false);

   
    useEffect(() => {
        if (!imageList || imageList.length === 0) return;

        const interval = setInterval(() => {
            nextSlide();
        }, 3000); 

        return () => clearInterval(interval); 
    }, [currentIndex, imageList]);

   
    const nextSlide = () => {
        setIsSliding(true);
        setTimeout(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % imageList.length);
            setIsSliding(false);
        }, 500); 
    };

  
    const prevSlide = () => {
        setIsSliding(true);
        setTimeout(() => {
            setCurrentIndex((prevIndex) => (prevIndex - 1 + imageList.length) % imageList.length);
            setIsSliding(false);
        }, 500);
    };

    return (
        <div>
            {imageList && imageList.length > 0 ? (
                <Carousel>
                    <div className="relative overflow-hidden w-full h-[360px]">
                        <CarouselContent
                            className={`flex transition-transform duration-500 ease-in-out ${isSliding ? 'transform scale-95' : ''
                                }`}
                            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                        >
                            {imageList.map((item, index) => (
                                <CarouselItem key={index} className="flex-shrink-0 w-full">
                                    <Image
                                        src={item.url}
                                        width={800}
                                        height={300}
                                        alt={`image-${index}`}
                                        className="rounded-xl object-cover w-full h-[360px]"
                                    />
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                    </div>


                    <CarouselPrevious onClick={prevSlide} />
                    <CarouselNext onClick={nextSlide} />

                </Carousel>
            ) : (
                <div className="w-full h-[200px] bg-slate-200 animate-pulse rounded-lg"></div>
            )}
        </div>
    );
}

export default Slider;
