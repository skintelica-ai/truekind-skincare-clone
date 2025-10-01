"use client";

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ValueCardProps {
  icon: string;
  alt: string;
  title: string;
  description: string;
  className?: string;
}

const ValueCard: React.FC<ValueCardProps> = ({ icon, alt, title, description, className }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 30, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: cardRef.current,
            start: "top 80%",
          }
        }
      );
    }
  }, []);

  return (
    <div 
      ref={cardRef}
      className={`bg-secondary p-6 rounded-2xl shadow-[0_8px_30px_rgba(255,112,52,0.15)] hover:shadow-[0_12px_40px_rgba(255,112,52,0.25)] transition-all duration-500 hover:scale-105 hover:-translate-y-2 ${className}`}
    >
      <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mb-4 mx-auto md:mx-0 shadow-md">
        <Image src={icon} alt={alt} width={32} height={32} />
      </div>
      <div className="text-center md:text-left">
        <h3 className="font-display text-[22px] font-medium text-primary leading-tight">{title}</h3>
        <p className="text-sm text-medium-gray mt-2 leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

const values = [
  {
    icon: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/3b0516f1-9fa9-4c4a-b3a3-3ad67e6bf33b-truekindskincare-com/assets/svgs/icon-radical-transparency-2.svg?',
    alt: 'Radical Transparency',
    title: 'Radical Transparency',
    description: "No black boxes, nothing to hide, we disclose our full formulas, so you will never have to guess what's in it and how much.",
    desktopClassName: 'absolute top-[5%] left-[-20%] w-[48%] z-20',
  },
  {
    icon: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/3b0516f1-9fa9-4c4a-b3a3-3ad67e6bf33b-truekindskincare-com/assets/svgs/icon-clean-beyond-reproach-1.svg?',
    alt: 'Clean, Beyond Reproach',
    title: 'Clean, Beyond Reproach',
    description: 'Truly clean with only verified ingredients; and free from over 1800 questionable ingredients. Because what you put on your skin matters.',
    desktopClassName: 'absolute top-[55%] -translate-y-[20%] left-[-30%] w-[48%] z-20',
  },
  {
    icon: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/3b0516f1-9fa9-4c4a-b3a3-3ad67e6bf33b-truekindskincare-com/assets/svgs/icon-conscious-responsible-4.svg?',
    alt: 'Conscious & Responsible',
    title: 'Conscious & Responsible',
    description: 'Peta Certified Vegan and Cruelty Free. Our products are always housed in responsible packaging and made sustainably.',
    desktopClassName: 'absolute top-[25%] right-[-30%] w-[48%] z-20',
  },
  {
    icon: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/3b0516f1-9fa9-4c4a-b3a3-3ad67e6bf33b-truekindskincare-com/assets/svgs/icon-potent-multi-tasking-3.svg?',
    alt: 'Potent & Multi Tasking',
    title: 'Potent & Multi Tasking',
    description: 'Our formulas are chock-a-block with actives, anti oxidants, skin restoring agents backed by dermal science that aim to deliver real results.',
    desktopClassName: 'absolute bottom-[-10%] right-[-20%] w-[48%] z-20',
  },
];

const DesktopArrow = () => (
    <svg className="absolute top-[18%] left-[calc(100%_-_120px)] w-[443px] h-auto text-dark-gray" width="443" height="454" viewBox="0 0 443 454" fill="none" xmlns="http://www.w3.org/2000/svg">
         <path d="M1.00002 453C1.00002 453 283.5 -59.5 442 201.5" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10"/>
    </svg>
);

const MobileArrow = () => (
    <svg className="absolute top-[8rem] left-[5rem] w-32 h-auto text-dark-gray" width="122" height="195" viewBox="0 0 122 195" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1.5 1S37 194 121.5 194" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10"/>
    </svg>
);


const BrandValues = () => {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);
  const leafRef = useRef<HTMLImageElement>(null);
  const empressRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: headingRef.current,
        start: "top 80%",
      }
    });

    tl.fromTo(
      headingRef.current,
      { opacity: 0, x: -50 },
      { opacity: 1, x: 0, duration: 1, ease: "power3.out" }
    );

    if (circleRef.current) {
      gsap.fromTo(
        circleRef.current,
        { scale: 0.8, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: circleRef.current,
            start: "top 80%",
          }
        }
      );
    }

    // Floating animations for decorative elements
    if (leafRef.current) {
      gsap.to(leafRef.current, {
        y: -15,
        rotation: 5,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    }

    if (empressRef.current) {
      gsap.to(empressRef.current, {
        y: 15,
        rotation: -5,
        duration: 3.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    }
  }, []);

  return (
    <section className="bg-background py-20 md:py-32 overflow-x-clip">
      <div className="container mx-auto px-4">
        <div className="relative">
          <div className="md:max-w-[35%]">
             <h2 ref={headingRef} className="font-normal text-5xl leading-[1.1] text-dark-gray">
                CLEAN, CONSCIOUS,<br/> PERFORMANCE <span className="font-display italic border-b-2 border-primary pb-1 bg-gradient-to-r from-[#FF7034] to-[#FF9467] bg-clip-text text-transparent">skincare.</span>
              </h2>
            <p className="mt-6 text-lg text-medium-gray max-w-sm">
              Unreservedly honest products that truly work, be kind to skin and the planet – no exceptions!
            </p>
          </div>

           {/* --- DESKTOP LAYOUT --- */}
           <div className="hidden md:block absolute top-[-10rem] right-[-20rem] w-[60rem] h-[60rem]">
            <DesktopArrow />
            <div className="relative w-full h-full">

              <div ref={circleRef} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[44rem] h-[44rem] bg-gradient-to-br from-[#FFDCCD] to-[#FFB89A] rounded-full shadow-2xl" />
              
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] rounded-full overflow-hidden z-[5] shadow-2xl ring-4 ring-white/50">
                <Image
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/3b0516f1-9fa9-4c4a-b3a3-3ad67e6bf33b-truekindskincare-com/assets/images/ingredients-clip-3.jpg?"
                  alt="Ingredients"
                  fill
                  sizes="32rem"
                  className="object-cover"
                />
              </div>

              <Image
                ref={leafRef}
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/3b0516f1-9fa9-4c4a-b3a3-3ad67e6bf33b-truekindskincare-com/assets/images/leaf-1.png?"
                alt="Leaf"
                width={150}
                height={215}
                style={{ height: 'auto' }}
                className="absolute top-[24%] right-[22%] z-10 drop-shadow-2xl"
              />

              <Image
                ref={empressRef}
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/3b0516f1-9fa9-4c4a-b3a3-3ad67e6bf33b-truekindskincare-com/assets/images/empress-2.png?"
                alt="Empress"
                width={120}
                height={170}
                style={{ height: 'auto' }}
                className="absolute bottom-[24%] left-[20%] z-10 drop-shadow-2xl"
              />
            
              <div className='absolute top-[16rem] left-[13rem] w-[45rem] h-[45rem]'>
                 {values.map((value, index) => (
                    <ValueCard key={index} {...value} className={value.desktopClassName} />
                  ))}
              </div>
            </div>
           </div>

           {/* --- MOBILE LAYOUT --- */}
            <div className="md:hidden mt-24">
                <div className="relative max-w-sm mx-auto">
                    <MobileArrow />
                    <div className="relative w-full aspect-square">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#FFDCCD] to-[#FFB89A] rounded-full shadow-xl" />
                        <div className="absolute inset-[10%] rounded-full overflow-hidden z-[5] shadow-xl ring-4 ring-white/50">
                            <Image
                                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/3b0516f1-9fa9-4c4a-b3a3-3ad67e6bf33b-truekindskincare-com/assets/images/ingredients-clip-3.jpg?"
                                alt="Woman smiling"
                                fill
                                sizes="(max-width: 768px) 80vw, 512px"
                                className="object-cover"
                            />
                        </div>
                        <Image
                            src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/3b0516f1-9fa9-4c4a-b3a3-3ad67e6bf33b-truekindskincare-com/assets/images/leaf-1.png?"
                            alt="Leaf"
                            width={80}
                            height={114}
                            style={{ height: 'auto' }}
                            className="absolute top-[5%] right-[-5%] z-10 drop-shadow-xl"
                        />
                         <Image
                            src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/3b0516f1-9fa9-4c4a-b3a3-3ad67e6bf33b-truekindskincare-com/assets/images/empress-2.png?"
                            alt="Orange Peel"
                            width={60}
                            height={85}
                            style={{ height: 'auto' }}
                            className="absolute bottom-[10%] left-[-5%] z-10 drop-shadow-xl"
                         />
                    </div>
                </div>

                <div className="mt-12 space-y-6">
                    {values.map((value, index) => (
                        <ValueCard key={index} {...value} />
                    ))}
                </div>
            </div>

        </div>
      </div>
    </section>
  );
};

export default BrandValues;