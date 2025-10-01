"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function ExcitingOffers() {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !textRef.current || !imageRef.current) return;

    const ctx = gsap.context(() => {
      // Fade in text content
      gsap.from(textRef.current, {
        opacity: 0,
        y: 50,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
      });

      // Fade and scale in image
      gsap.from(imageRef.current, {
        opacity: 0,
        scale: 0.8,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
      });

      // Floating animation for image
      gsap.to(imageRef.current, {
        y: -20,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="relative overflow-hidden" 
      style={{ background: 'linear-gradient(115deg, #FFDCCD 60%, #FFB89A 60%)' }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-x-16 gap-y-12 py-24 lg:py-40">
          {/* Text Content */}
          <div ref={textRef} className="relative z-10 text-center lg:text-left">
            <h3 className="font-display text-5xl md:text-6xl lg:text-7xl font-light text-dark-gray leading-none">
              Exciting offers
              <br />
              <em className="font-display italic text-primary">awaits</em>
            </h3>
            <p className="mt-6 text-lg text-medium-gray max-w-sm mx-auto lg:mx-0">
              Shop now to get a chance to win 2 extra products. Grab the offer before it ends.
            </p>
            <div className="mt-12 flex items-center justify-center lg:justify-start space-x-6">
              <Link href="/products" className="group" aria-label="Shop Now">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-2xl shadow-lg border-2 border-primary/20 group-hover:border-primary">
                  <ArrowRight className="w-8 h-8 text-primary transition-transform duration-300 group-hover:translate-x-1"/>
                </div>
              </Link>
              <span className="font-body text-sm font-bold uppercase tracking-widest text-dark-gray">
                SHOP NOW
              </span>
            </div>
          </div>

          {/* Image */}
          <div ref={imageRef} className="relative h-96 lg:h-[600px] flex justify-center items-center">
             <Image
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/3b0516f1-9fa9-4c4a-b3a3-3ad67e6bf33b-truekindskincare-com/assets/images/offer-22.jpg?"
              alt="TrueKind Product Offer"
              width={550}
              height={660}
              className="object-contain drop-shadow-2xl h-full w-auto max-w-none lg:absolute lg:left-1/2 lg:-translate-x-1/4 lg:h-[110%] lg:w-auto transition-transform duration-500 hover:scale-105"
            />
          </div>
        </div>
      </div>
    </section>
  );
}