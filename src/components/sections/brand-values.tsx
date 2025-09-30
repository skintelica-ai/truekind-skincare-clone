import React from 'react';
import Image from 'next/image';

interface ValueCardProps {
  icon: string;
  alt: string;
  title: string;
  description: string;
  className?: string;
}

const ValueCard: React.FC<ValueCardProps> = ({ icon, alt, title, description, className }) => {
  return (
    <div className={`bg-secondary p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] ${className}`}>
      <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mb-4 mx-auto md:mx-0">
        <Image src={icon} alt={alt} width={32} height={32} />
      </div>
      <div className="text-center md:text-left">
        <h3 className="font-display text-[22px] font-medium text-dark-gray leading-tight">{title}</h3>
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
  return (
    <section className="bg-background py-20 md:py-32 overflow-x-clip">
      <div className="container mx-auto px-4">
        <div className="relative">
          <div className="md:max-w-[35%]">
             <h2 className="font-normal text-5xl leading-[1.1] text-dark-gray">
                CLEAN, CONSCIOUS,<br/> PERFORMANCE <span className="font-display italic border-b-2 border-dark-gray pb-1">skincare.</span>
              </h2>
            <p className="mt-6 text-lg text-medium-gray max-w-sm">
              Unreservedly honest products that truly work, be kind to skin and the planet – no exceptions!
            </p>
          </div>

           {/* --- DESKTOP LAYOUT --- */}
           <div className="hidden md:block absolute top-[-10rem] right-[-20rem] w-[60rem] h-[60rem]">
            <DesktopArrow />
            <div className="relative w-full h-full">

              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[44rem] h-[44rem] bg-beige-neutral rounded-full" />
              
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] rounded-full overflow-hidden z-[5]">
                <Image
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/3b0516f1-9fa9-4c4a-b3a3-3ad67e6bf33b-truekindskincare-com/assets/images/ingredients-clip-3.jpg?"
                  alt="Ingredients"
                  fill
                  className="object-cover"
                />
              </div>

              <Image
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/3b0516f1-9fa9-4c4a-b3a3-3ad67e6bf33b-truekindskincare-com/assets/images/leaf-1.png?"
                alt="Leaf"
                width={150}
                height={215}
                className="absolute top-[24%] right-[22%] z-10"
              />

              <Image
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/3b0516f1-9fa9-4c4a-b3a3-3ad67e6bf33b-truekindskincare-com/assets/images/empress-2.png?"
                alt="Empress"
                width={120}
                height={170}
                className="absolute bottom-[24%] left-[20%] z-10"
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
                        <div className="absolute inset-0 bg-beige-neutral rounded-full" />
                        <div className="absolute inset-[10%] rounded-full overflow-hidden z-[5]">
                            <Image
                                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/3b0516f1-9fa9-4c4a-b3a3-3ad67e6bf33b-truekindskincare-com/assets/images/ingredients-clip-3.jpg?"
                                alt="Woman smiling"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <Image
                            src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/3b0516f1-9fa9-4c4a-b3a3-3ad67e6bf33b-truekindskincare-com/assets/images/leaf-1.png?"
                            alt="Leaf"
                            width={80}
                            height={114}
                            className="absolute top-[5%] right-[-5%] z-10"
                        />
                         <Image
                            src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/3b0516f1-9fa9-4c4a-b3a3-3ad67e6bf33b-truekindskincare-com/assets/images/empress-2.png?"
                            alt="Orange Peel"
                            width={60}
                            height={85}
                            className="absolute bottom-[10%] left-[-5%] z-10"
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