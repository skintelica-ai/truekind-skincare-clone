import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const JournalSection = () => {
  return (
    <section className="bg-black text-white py-24 sm:py-32">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-x-20 gap-y-16 items-start">
          
          <Link href="/journal/beauty-secrets-from-around-the-world-rituals-and-ingredients-you-need-to-try" className="group block">
            <div className="relative">
              <span className="absolute top-5 left-5 bg-white text-black text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full z-10">
                Featured
              </span>
              <div className="overflow-hidden">
                <Image
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/3b0516f1-9fa9-4c4a-b3a3-3ad67e6bf33b-truekindskincare-com/assets/images/Z-Ac73dAxsiBvxdO_elegant-glass-dropper-bottles-23.jpg?"
                  alt="Beauty Secrets from Around the World: Rituals and Ingredients You Need to Try"
                  width={580}
                  height={386}
                  className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </div>
            <div className="bg-white text-primary p-8">
              <h3 className="font-display text-[22px] leading-snug mb-3 text-primary">
                Beauty Secrets from Around the World: Rituals and Ingredients You Need to Try
              </h3>
              <p className="font-body text-base text-medium-gray mb-6 leading-relaxed">
                Drawing from our rich ayurvedic legacy of over 30 years and embracing dermal science, we aim to create transparent skincare that is incredibly effective, safe and without harming the environment or the planet.
              </p>
              <div className="flex justify-between items-center text-sm font-body border-t border-border pt-4">
                <span className="text-medium-gray text-xs">8 Feb 2025</span>
                <span className="text-xs font-bold uppercase tracking-wider text-primary underline decoration-transparent underline-offset-4 group-hover:decoration-primary transition-all">
                  Read more
                </span>
              </div>
            </div>
          </Link>
          
          <div className="flex flex-col">
            <div className="mb-10">
              <h2 className="text-white mb-4 text-5xl md:text-[64px] leading-none">
                <span className="font-body font-normal">clean</span>
                <br />
                <span className="font-display italic font-normal">Journal</span>
              </h2>
              <p className="text-lg text-neutral-300 max-w-sm">
                Healthy tips on skincare, regimen and overall a better lifestyle.
              </p>
            </div>
            
            <div className="space-y-8">
              <Link href="/journal/your-skincare-and-makeup-routine-impacts-your-well-being" className="group block">
                <div className="bg-white text-primary">
                  <div className="overflow-hidden">
                    <Image
                      src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/3b0516f1-9fa9-4c4a-b3a3-3ad67e6bf33b-truekindskincare-com/assets/images/Z-6shXdAxsiBwSng_journal-2-24.jpg?"
                      alt="Your Skincare and Makeup Routine Impacts Your Well-Being"
                      width={480}
                      height={320}
                      className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-display text-xl mb-4 leading-tight text-primary">
                      Your Skincare and Makeup Routine Impacts Your Well-Being
                    </h3>
                    <div className="flex justify-between items-center text-sm font-body border-t border-border pt-[18px]">
                      <span className="text-medium-gray text-xs">20 Dec 2024</span>
                      <span className="text-xs font-bold uppercase tracking-wider text-primary underline decoration-transparent underline-offset-4 group-hover:decoration-primary transition-all">
                        Read more
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
              
              <Link href="/journal/how-to-make-your-routine-more-eco-friendly" className="group block">
                <div className="bg-white text-primary">
                  <div className="overflow-hidden">
                    <Image
                      src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/3b0516f1-9fa9-4c4a-b3a3-3ad67e6bf33b-truekindskincare-com/assets/images/Z-6uzHdAxsiBwSpf_journal-3-25.jpg?"
                      alt="How to Make Your Routine More Eco-Friendly"
                      width={480}
                      height={320}
                      className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-display text-xl mb-4 leading-tight text-primary">
                      How to Make Your Routine More Eco-Friendly
                    </h3>
                    <div className="flex justify-between items-center text-sm font-body border-t border-border pt-[18px]">
                      <span className="text-medium-gray text-xs">25 Jan 2025</span>
                      <span className="text-xs font-bold uppercase tracking-wider text-primary underline decoration-transparent underline-offset-4 group-hover:decoration-primary transition-all">
                        Read more
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
            
            <Link href="/journal" className="mt-16 self-end inline-flex items-center gap-4 group">
              <span className="text-sm font-bold tracking-widest uppercase">See all</span>
              <div className="w-16 h-16 rounded-full border border-neutral-600 flex items-center justify-center transition-colors group-hover:bg-white group-hover:border-white">
                <ArrowRight className="w-6 h-6 text-white transition-colors group-hover:text-black" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default JournalSection;