import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

interface InfoCardProps {
  iconSrc: string;
  title: React.ReactNode;
  subtitle: string;
  description: string;
}

const InfoCard = ({ iconSrc, title, subtitle, description }: InfoCardProps) => {
  return (
    <div className="flex items-start gap-x-6 md:gap-x-8">
      <div className="w-[50px] h-[50px] md:w-[60px] md:h-[60px] flex-shrink-0">
        <Image src={iconSrc} alt={`${subtitle} icon`} width={60} height={60} className="w-full h-full" />
      </div>
      <div>
        <h3 className="font-body text-[24px] font-medium leading-[1.2] -tracking-[0.48px] text-primary">
          {title}
        </h3>
        <p className="font-display text-[20px] leading-[1.2] text-primary mt-[18px] mb-[15px]">
          {subtitle}
        </p>
        <p className="text-base leading-[1.4] text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
};

const TransparencyEthos = () => {
  return (
    <section className="bg-secondary pt-[120px] pb-[160px] relative overflow-x-clip">
      <div className="container mx-auto px-4 relative">
        <p className="text-[13px] tracking-[1.3px] uppercase text-primary mb-4 lg:mb-[10px]">Ethos</p>

        <div className="absolute top-[100px] -left-[200px] md:top-[-40px] md:-left-[150px] lg:-left-[120px] w-[400px] md:w-[600px] z-0 pointer-events-none">
          <Image
            src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/3b0516f1-9fa9-4c4a-b3a3-3ad67e6bf33b-truekindskincare-com/assets/images/texture-20.png?"
            alt="Cosmetic texture swatches"
            width={607}
            height={962}
            className="w-full h-auto object-contain"
          />
        </div>

        <div className="flex flex-col lg:flex-row lg:justify-between items-start gap-y-16 lg:gap-x-8">
          <div className="lg:w-7/12 relative z-10 flex flex-col">
            <div>
              <h2 className="font-body text-[70px] sm:text-[100px] lg:text-[120px] font-medium text-primary leading-[0.9] -tracking-[3.6px] lg:-ml-1">
                Radical <span className="font-display">Transparency.</span>
              </h2>
              <h2 className="font-body text-[70px] sm:text-[100px] lg:text-[120px] font-medium text-primary leading-[0.9] -tracking-[3.6px] lg:-ml-1 mt-1 sm:mt-2">
                Hide <span className="font-display">Nothing.</span>
              </h2>
            </div>
            <Link href="/philosophy" className="group mt-16 md:mt-24 inline-flex items-center gap-4 self-start">
              <div className="w-16 h-16 rounded-full border border-primary flex items-center justify-center transition-colors duration-300 group-hover:bg-primary text-primary group-hover:text-white">
                <ArrowUpRight className="w-6 h-6" />
              </div>
              <span className="font-body text-[11px] uppercase tracking-[1.1px] text-primary underline leading-tight">
                Our
                <br />
                Philosophy
              </span>
            </Link>
          </div>

          <div className="lg:w-5/12 flex flex-col gap-12 lg:gap-16 justify-center z-10 lg:pt-8 xl:pr-10">
            <InfoCard
              iconSrc="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/3b0516f1-9fa9-4c4a-b3a3-3ad67e6bf33b-truekindskincare-com/assets/svgs/icon-highest-standards-5.svg?"
              title={
                <>
                  100% Transparent
                  <br />
                  Formulas
                </>
              }
              subtitle="Highest Standards."
              description="We formulate to the highest standards of efficacy and safety – using only proven, verified ingredients in bio-compatible bases; and free from over 1800 questionable ingredients"
            />
            <InfoCard
              iconSrc="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/3b0516f1-9fa9-4c4a-b3a3-3ad67e6bf33b-truekindskincare-com/assets/svgs/icon-real-results-6.svg?"
              title={
                <>
                  Only Verified
                  <br />
                  Ingredients
                </>
              }
              subtitle="Real Results."
              description="Skin care packed with anti oxidants, skin replenishing and skin restoring agents in stable pH levels that don’t promise miracles, but deliver real results."
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default TransparencyEthos;