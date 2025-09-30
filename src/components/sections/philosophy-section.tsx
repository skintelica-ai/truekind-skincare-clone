import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const PhilosophySection = () => {
  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-[1200px]">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Image and Button */}
          <div className="lg:w-1/2 w-full flex items-center justify-center gap-4 md:gap-8">
            <Link 
              href="/philosophy" 
              className="flex-shrink-0 group flex flex-col items-center justify-center w-32 h-32 md:w-36 md:h-36 bg-primary text-primary-foreground rounded-full text-center p-4 transition-transform duration-300 hover:scale-105"
            >
              <span className="font-body text-sm leading-tight">
                Our <br /> Philosophy
              </span>
              <ArrowRight className="mt-3 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <div className="flex-grow">
              <Image
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/3b0516f1-9fa9-4c4a-b3a3-3ad67e6bf33b-truekindskincare-com/assets/images/175A3642-3-741-21.jpg"
                alt="Philosophy"
                width={360}
                height={480}
                className="rounded-2xl object-cover w-full h-auto"
              />
            </div>
          </div>

          {/* Right Column: Text Content */}
          <div className="lg:w-1/2 w-full flex flex-col gap-5 items-start">
            <p className="border border-primary text-primary px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest self-start">
              QUALITY
            </p>
            <h3 className="font-display text-4xl md:text-[3.25rem] font-light text-primary leading-tight">
              Only proven Ingredients, quality over quantity always!
            </h3>
            <p className="font-body text-lg text-muted-foreground leading-relaxed">
              Its about what we don’t put in. Squeaky clean formulas with over 1500 Negative Ingredients.
            </p>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default PhilosophySection;