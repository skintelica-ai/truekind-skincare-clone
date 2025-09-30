"use client";

import Image from "next/image";
import { Instagram } from "lucide-react";

const ConnectSection = () => {
  return (
    <section
      id="connect"
      className="bg-background text-foreground py-16 md:py-24 lg:pb-52 overflow-hidden"
    >
      {/* Mobile Layout */}
      <div className="md:hidden container mx-auto px-4 flex flex-col items-center text-center">
        <h2 className="font-display text-5xl font-light leading-none">
          Connect <br /> With Us
        </h2>

        <div className="relative w-full max-w-sm mt-12 mb-16">
          <Image
            src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/3b0516f1-9fa9-4c4a-b3a3-3ad67e6bf33b-truekindskincare-com/assets/images/connect-m-28.jpg?"
            alt="Woman with natural makeup in sunlight"
            width={750}
            height={750}
            className="w-full h-auto object-cover"
          />
          <h2 className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-full font-display text-6xl font-light italic">
            on instagram
          </h2>
        </div>

        <p className="mt-8 text-sm text-medium-gray px-4">
          Get the latest news about skincare tips and new products.
        </p>

        <a
          href="https://www.instagram.com/truekind.skin/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center justify-between border border-foreground rounded-full py-2 pl-6 pr-2 text-sm uppercase font-body tracking-wider hover:bg-foreground hover:text-background transition-colors duration-300 group"
        >
          <span>Instagram</span>
          <div className="ml-4 w-10 h-10 rounded-full bg-foreground flex items-center justify-center">
            <Instagram className="h-4 w-4 text-background" />
          </div>
        </a>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block container mx-auto px-4 relative h-[700px] lg:h-[800px]">
        {/* Top-Left Image & Text */}
        <div className="absolute top-[8%] left-[7%] w-[18%] lg:w-[15%]">
          <div className="relative w-full aspect-[4/5]">
            <Image
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/3b0516f1-9fa9-4c4a-b3a3-3ad67e6bf33b-truekindskincare-com/assets/images/connect-1-26.jpg?"
              alt="Woman applying skincare product"
              fill
              className="object-cover"
            />
          </div>
          <p className="mt-4 text-[13px] leading-snug text-medium-gray">
            Get the latest news about skincare tips and new products.
          </p>
        </div>

        {/* Main Title "Connect With Us" */}
        <div className="absolute top-0 left-1/2 w-full -translate-x-1/2 text-center">
          <h2 className="font-display text-6xl font-light leading-none lg:text-7xl">
            Connect <br /> With Us
          </h2>
        </div>

        {/* Center Image */}
        <div className="absolute top-1/2 left-1/2 w-[48%] -translate-x-1/2 -translate-y-[55%] lg:w-[42%]">
          <div className="relative w-full aspect-[6/5]">
            <Image
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/3b0516f1-9fa9-4c4a-b3a3-3ad67e6bf33b-truekindskincare-com/assets/images/connect-27.jpg?"
              alt="Woman with natural makeup in sunlight"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* "on instagram" Text */}
        <div className="absolute top-[62%] left-1/2 z-10 w-full -translate-x-1/2 text-center lg:top-[60%]">
          <h2 className="font-display text-7xl font-light lg:text-8xl">
            on <i className="font-light">instagram</i>
          </h2>
        </div>

        {/* Instagram Button */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
          <a
            href="https://www.instagram.com/truekind.skin/"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center justify-between rounded-full border border-foreground py-2 pl-6 pr-2 font-body text-sm uppercase tracking-wider text-foreground transition-colors duration-300 hover:bg-foreground hover:text-background"
          >
            <span>Instagram</span>
            <div className="ml-4 flex h-10 w-10 items-center justify-center rounded-full bg-foreground">
              <Instagram className="h-4 w-4 text-background" />
            </div>
          </a>
        </div>

        {/* Bottom-Right Image */}
        <div className="absolute bottom-[10%] right-[5%] w-[18%] lg:w-[15%]">
          <div className="relative w-full aspect-[4/5]">
            <Image
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/3b0516f1-9fa9-4c4a-b3a3-3ad67e6bf33b-truekindskincare-com/assets/images/IMG_7461-29.jpg?"
              alt="Two women posing together"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConnectSection;