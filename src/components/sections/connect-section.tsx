"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { Instagram } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const ConnectSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const instagramTextRef = useRef<HTMLHeadingElement>(null);
  const buttonRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Fade in title
      gsap.from(titleRef.current, {
        opacity: 0,
        y: 50,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
      });

      // Fade in instagram text
      gsap.from(instagramTextRef.current, {
        opacity: 0,
        scale: 0.8,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: instagramTextRef.current,
          start: "top 80%",
        },
      });

      // Fade in button
      gsap.from(buttonRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: buttonRef.current,
          start: "top 90%",
        },
      });

      // Animate images on scroll
      const images = sectionRef.current?.querySelectorAll("img");
      if (images) {
        gsap.from(images, {
          opacity: 0,
          scale: 0.9,
          duration: 0.8,
          stagger: 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="connect"
      className="bg-gradient-to-b from-background to-secondary text-foreground py-16 md:py-24 lg:pb-52 overflow-hidden"
    >
      {/* Mobile Layout */}
      <div className="md:hidden container mx-auto px-4 flex flex-col items-center text-center">
        <h2 ref={titleRef} className="font-display text-5xl font-light leading-none text-dark-gray">
          Connect <br /> With Us
        </h2>

        <div className="relative w-full max-w-sm mt-12 mb-16">
          <Image
            src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/3b0516f1-9fa9-4c4a-b3a3-3ad67e6bf33b-truekindskincare-com/assets/images/connect-m-28.jpg?"
            alt="Woman with natural makeup in sunlight"
            width={750}
            height={750}
            className="w-full h-auto object-cover rounded-lg shadow-lg"
          />
          <h2 ref={instagramTextRef} className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-full font-display text-6xl font-light italic text-primary">
            on instagram
          </h2>
        </div>

        <p className="mt-8 text-sm text-medium-gray px-4">
          Get the latest news about skincare tips and new products.
        </p>

        <a
          ref={buttonRef}
          href="https://www.instagram.com/truekind.skin/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center justify-between border-2 border-primary rounded-full py-2 pl-6 pr-2 text-sm uppercase font-body tracking-wider hover:bg-primary hover:text-white transition-all duration-300 group shadow-md hover:shadow-xl"
        >
          <span>Instagram</span>
          <div className="ml-4 w-10 h-10 rounded-full bg-primary flex items-center justify-center group-hover:bg-white transition-colors duration-300">
            <Instagram className="h-4 w-4 text-white group-hover:text-primary" />
          </div>
        </a>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block container mx-auto px-4 relative h-[700px] lg:h-[800px]">
        {/* Top-Left Image & Text */}
        <div className="absolute top-[8%] left-[7%] w-[18%] lg:w-[15%]">
          <div className="relative w-full aspect-[4/5] overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300">
            <Image
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/3b0516f1-9fa9-4c4a-b3a3-3ad67e6bf33b-truekindskincare-com/assets/images/connect-1-26.jpg?"
              alt="Woman applying skincare product"
              fill
              className="object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
          <p className="mt-4 text-[13px] leading-snug text-medium-gray">
            Get the latest news about skincare tips and new products.
          </p>
        </div>

        {/* Main Title "Connect With Us" */}
        <div className="absolute top-0 left-1/2 w-full -translate-x-1/2 text-center">
          <h2 ref={titleRef} className="font-display text-6xl font-light leading-none lg:text-7xl text-dark-gray">
            Connect <br /> With Us
          </h2>
        </div>

        {/* Center Image */}
        <div className="absolute top-1/2 left-1/2 w-[48%] -translate-x-1/2 -translate-y-[55%] lg:w-[42%]">
          <div className="relative w-full aspect-[6/5] overflow-hidden rounded-lg shadow-2xl hover:shadow-3xl transition-shadow duration-300">
            <Image
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/3b0516f1-9fa9-4c4a-b3a3-3ad67e6bf33b-truekindskincare-com/assets/images/connect-27.jpg?"
              alt="Woman with natural makeup in sunlight"
              fill
              className="object-cover hover:scale-105 transition-transform duration-700"
            />
          </div>
        </div>

        {/* "on instagram" Text */}
        <div className="absolute top-[62%] left-1/2 z-10 w-full -translate-x-1/2 text-center lg:top-[60%]">
          <h2 ref={instagramTextRef} className="font-display text-7xl font-light lg:text-8xl text-dark-gray">
            on <i className="font-light text-primary">instagram</i>
          </h2>
        </div>

        {/* Instagram Button */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
          <a
            ref={buttonRef}
            href="https://www.instagram.com/truekind.skin/"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center justify-between rounded-full border-2 border-primary py-2 pl-6 pr-2 font-body text-sm uppercase tracking-wider text-dark-gray transition-all duration-300 hover:bg-primary hover:text-white shadow-md hover:shadow-xl hover:scale-105"
          >
            <span>Instagram</span>
            <div className="ml-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary transition-colors duration-300 group-hover:bg-white">
              <Instagram className="h-4 w-4 text-white group-hover:text-primary" />
            </div>
          </a>
        </div>

        {/* Bottom-Right Image */}
        <div className="absolute bottom-[10%] right-[5%] w-[18%] lg:w-[15%]">
          <div className="relative w-full aspect-[4/5] overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300">
            <Image
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/3b0516f1-9fa9-4c4a-b3a3-3ad67e6bf33b-truekindskincare-com/assets/images/IMG_7461-29.jpg?"
              alt="Two women posing together"
              fill
              className="object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConnectSection;