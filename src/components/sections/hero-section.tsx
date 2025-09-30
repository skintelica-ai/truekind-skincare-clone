import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background Video Player */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="hidden h-full w-full object-cover md:block"
        >
          <source src="https://truekindskincare.com/hero.mp4" type="video/mp4" />
          <p>Your browser does not support the video element. Please consider updating to a modern browser.</p>
        </video>
        <video
          autoPlay
          loop
          muted
          playsInline
          className="block h-full w-full object-cover md:hidden"
        >
          <source src="https://truekindskincare.com/hero-m.mp4" type="video/mp4" />
          <p>Your browser does not support the video element. Please consider updating to a modern browser.</p>
        </video>
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Centered Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center p-4 text-center text-white">
        <h1 className="font-display text-[42px] font-light leading-tight md:text-[80px] md:leading-[1.1]">
          <div>
            True to Oneself
          </div>
          <div>
            kind to <span className="italic">Nature</span>
          </div>
        </h1>
        <p className="mt-6 max-w-xl font-body text-base font-normal leading-relaxed md:text-lg">
          Unreservedly honest products that truly work, be
          <br />
          kind to skin and the planet – no exceptions!
        </p>
      </div>
      
      {/* Bottom CTA Button */}
      <Link
        href="/products"
        className="absolute bottom-6 left-1/2 flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 items-center justify-between rounded-full bg-beige-neutral p-2 text-dark-gray transition md:w-auto md:max-w-[390px]"
      >
        <span className="ml-4 font-body text-xs font-medium uppercase tracking-[0.1em] md:text-sm">
          Explore All Products
        </span>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-dark-gray text-white">
          <ArrowRight className="h-5 w-5" />
        </div>
      </Link>
    </section>
  );
};

export default HeroSection;