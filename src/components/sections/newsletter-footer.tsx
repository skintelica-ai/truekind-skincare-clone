'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const TrueKindFooterLogo = () => (
  <svg
    className="h-7 w-auto text-primary"
    viewBox="0 0 142 28"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M11.967 27.0549L12.012 16.5919L18.428 27.0549H24.394L16.29 16.0359L23.837 5.67293H17.871L11.99 15.2239L11.945 5.67293H6.109L6.087 27.0549H11.967Z"></path>
    <path d="M28.0283 27.3546C34.7233 27.3546 38.6573 22.8406 38.6573 16.4916C38.6573 10.1876 34.6783 5.67261 28.0283 5.67261H21.5673V27.3546H28.0283ZM27.1633 21.8216H27.1183L27.1413 11.1616H27.1633C30.4083 11.1616 32.6183 13.0906 32.6183 16.5136C32.6183 19.9366 30.4083 21.8216 27.1633 21.8216Z"></path>
    <path d="M52.3481 27.0549L52.3931 16.5919L58.8091 27.0549H64.7751L56.6711 16.0359L64.2181 5.67293H58.2521L52.3711 15.2239L52.3261 5.67293H46.4901L46.4681 27.0549H52.3481Z"></path>
    <path d="M68.0493 27.3546C74.6503 27.3546 79.1653 22.9966 79.1653 16.5136C79.1653 10.0306 74.6503 5.67261 68.0493 5.67261C61.4483 5.67261 56.9333 10.0306 56.9333 16.5136C56.9333 22.9966 61.4483 27.3546 68.0493 27.3546ZM68.0493 21.8436C64.9143 21.8436 62.7933 19.5536 62.7933 16.5136C62.7933 13.4736 64.9143 11.1836 68.0493 11.1836C71.1843 11.1836 73.3053 13.4736 73.3053 16.5136C73.3053 19.5536 71.1843 21.8436 68.0493 21.8436Z"></path>
    <path d="M92.0581 5.67293V27.0549H97.8941V5.67293H92.0581Z"></path>
    <path d="M101.444 27.0549V11.2069L108.431 27.0549H114.397L106.012 8.76193C108.069 7.92793 109.13 6.13093 109.13 4.29093C109.13 1.62193 107.051 0.134932 104.292 0.134932H98.113L98.091 27.0549H101.444ZM104.139 2.78193C105.155 2.78193 105.816 3.42093 105.816 4.31293C105.816 5.20493 105.155 5.84393 104.139 5.84393H101.444V2.78193H104.139Z"></path>
    <path d="M117.844 27.3546C124.539 27.3546 128.473 22.8406 128.473 16.4916C128.473 10.1876 124.494 5.67261 117.844 5.67261H111.383V27.3546H117.844ZM116.979 21.8216H116.934L116.957 11.1616H116.979C120.224 11.1616 122.434 13.0906 122.434 16.5136C122.434 19.9366 120.224 21.8216 116.979 21.8216Z"></path>
    <path d="M43.9572 27.0546V5.67261H38.1212V27.0546H43.9572Z"></path>
    <path d="M91.8389 27.0549L85.4229 16.5919V27.0549H79.5869V5.67293H85.4229V15.2239L91.8389 5.67293H97.8049L90.1029 16.1459L98.2419 27.0549H91.8389Z"></path>
    <path d="M135.532 5.67293L129.116 16.1359V5.67293H123.28V27.0549H129.116V16.5919L135.532 27.0549H141.498L133.796 16.0359L141.935 5.67293H135.532Z"></path>
  </svg>
);

const ArrowIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="13"
    height="8"
    viewBox="0 0 13 8"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12.3536 4.35355C12.5488 4.15829 12.5488 3.84171 12.3536 3.64645L9.17157 0.464466C8.97631 0.269204 8.65973 0.269204 8.46447 0.464466C8.2692 0.659728 8.2692 0.976311 8.46447 1.17157L11.2929 4L8.46447 6.82843C8.2692 7.02369 8.2692 7.34027 8.46447 7.53553C8.65973 7.7308 8.97631 7.7308 9.17157 7.53553L12.3536 4.35355ZM0 4.5H12V3.5H0V4.5Z"
      fill="currentColor"
    />
  </svg>
);


const NewsletterFooter = () => {
  const newsletterRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!newsletterRef.current || !formRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(formRef.current, {
        opacity: 0,
        y: 50,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: newsletterRef.current,
          start: "top 80%",
        },
      });
    }, newsletterRef);

    return () => ctx.revert();
  }, []);

  const imageUrl = "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/3b0516f1-9fa9-4c4a-b3a3-3ad67e6bf33b-truekindskincare-com/assets/images/footer-30.jpg?";

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <footer className="bg-background text-foreground">
      <div ref={newsletterRef} className="relative h-[700px] md:h-[800px] lg:h-[860px]">
        <Image
          src={imageUrl}
          alt="Skincare products on a purple background"
          fill
          className="object-cover object-center"
          sizes="100vw"
          quality={95}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-accent/30" />
        <div className="relative container mx-auto h-full px-4 sm:px-6 lg:px-8 flex
         justify-center md:justify-end items-center">
          <div ref={formRef} className="w-full max-w-sm md:max-w-md lg:max-w-lg bg-primary text-primary-foreground p-10 md:p-14 lg:p-20 rounded-2xl shadow-2xl backdrop-blur-sm">
            <h2 className="font-serif text-[44px] md:text-5xl font-light leading-none mb-4">
              HEAR MORE <br /> FROM US
            </h2>
            <p className="font-sans text-base text-white/90 mb-10">
              Get the latest news about skincare tips and new products.
            </p>
            <form onSubmit={handleSubmit} className="mb-10">
              <div className="relative border-b-2 border-white/60 mb-4 group">
                <input
                  type="email"
                  placeholder="ENTER YOUR EMAIL"
                  className="w-full bg-transparent border-0 py-3 text-white placeholder-white/70 focus:ring-0 text-sm uppercase tracking-widest"
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="absolute right-[-15px] bottom-[-20px] h-16 w-16 rounded-full border-2 border-white flex items-center justify-center text-white bg-primary hover:bg-white hover:text-primary transition-all duration-300 hover:scale-110 shadow-lg"
                >
                  <ArrowIcon className="w-4 h-4" />
                </button>
              </div>
              <button type="submit" className="text-xs font-semibold tracking-widest cursor-pointer mt-10 text-left hover:underline transition-all">SUBSCRIBE</button>
            </form>
            <hr className="border-white/40 mb-6" />
            <p className="font-sans text-xs text-white/80 leading-relaxed">
              No spam, only quality articles to help you be more radiant. You can opt out anytime.
            </p>
          </div>
        </div>
      </div>

      <div className="py-16 md:py-24 border-b border-border bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-8">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">Explore</p>
              <ul className="space-y-3 font-sans text-sm">
                <li><Link href="/products" className="hover:text-primary transition-colors">Shop</Link></li>
                <li><Link href="/philosophy" className="hover:text-primary transition-colors">Philosophy</Link></li>
                <li><Link href="/gallery" className="hover:text-primary transition-colors">Gallery</Link></li>
                <li><Link href="/journal" className="hover:text-primary transition-colors">Journal</Link></li>
                <li><Link href="/login" className="hover:text-primary transition-colors">Sign Up/Login</Link></li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">Follow Us</p>
              <ul className="space-y-3 font-sans text-sm">
                <li><a href="https://www.instagram.com/truekind.skin/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Instagram</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Facebook</a></li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">Contact Us</p>
              <ul className="space-y-3 font-sans text-sm">
                <li><a href="mailto:tk@anandsofia.com" className="hover:text-primary transition-colors">tk@anandsofia.com</a></li>
                <li><a href="tel:1111-2222-3333" className="hover:text-primary transition-colors">1111-2222-3333</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="max-w-xs">
              <Link href="/" aria-label="TrueKind Home">
                <TrueKindFooterLogo />
              </Link>
              <p className="mt-4 text-sm text-muted-foreground">
                Clean, Conscious, Clinical Skincare! Honest products that truly work.
              </p>
              <p className="mt-4 text-xs text-gray-400">
                © 2023 Truekind, All Rights Reserved
              </p>
            </div>
            <div className="text-sm">
              <ul className="flex flex-col md:flex-row md:items-center gap-x-6 gap-y-2 text-muted-foreground">
                <li><Link href="#" className="hover:text-primary transition-colors">Disclaimer</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Credits</Link></li>
                <li className="text-xs text-gray-400">
                  Website by: <a href="#" className="underline hover:text-primary transition-colors">abhishek</a> &amp; <a href="#" className="underline hover:text-primary transition-colors">reksa</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default NewsletterFooter;