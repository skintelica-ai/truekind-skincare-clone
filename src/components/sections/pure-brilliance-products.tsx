"use client";

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ShoppingBag } from 'lucide-react';

const products = [
  {
    category: 'Pure Brilliance',
    name: 'AHA Brightening Exfoliant Cleanser/Face Wash',
    price: '₹899',
    href: '/products/aha-brightening-exfoliant-cleanserface-wash',
    img1: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/3b0516f1-9fa9-4c4a-b3a3-3ad67e6bf33b-truekindskincare-com/assets/images/ZurDj7VsGrYSvh0W_1-5.jpg?',
    img2: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/3b0516f1-9fa9-4c4a-b3a3-3ad67e6bf33b-truekindskincare-com/assets/images/ZurDkbVsGrYSvh0X_2-6.jpg?',
  },
  {
    category: 'Pure Brilliance',
    name: 'Bio Exfoliant Brightening Sleeping Mask',
    price: '₹899',
    href: '/products/bio-exfoliant-brightening-sleeping-mask',
    img1: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/3b0516f1-9fa9-4c4a-b3a3-3ad67e6bf33b-truekindskincare-com/assets/images/ZurMbbVsGrYSviXa_1-7.jpg?',
    img2: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/3b0516f1-9fa9-4c4a-b3a3-3ad67e6bf33b-truekindskincare-com/assets/images/ZurMb7VsGrYSviXc_2-8.jpg?',
  },
  {
    category: 'Pure Brilliance',
    name: 'AHA Brightening Exfoliant Toner/Essence',
    price: '₹899',
    href: '/products/aha-brightening-exfoliant-toneressence',
    img1: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/3b0516f1-9fa9-4c4a-b3a3-3ad67e6bf33b-truekindskincare-com/assets/images/ZurL27VsGrYSviVl_1-9.jpg?',
    img2: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/3b0516f1-9fa9-4c4a-b3a3-3ad67e6bf33b-truekindskincare-com/assets/images/ZurL3bVsGrYSviVo_2-10.jpg?',
  },
];

interface ProductCardProps {
  category: string;
  name: string;
  price: string;
  href: string;
  img1: string;
  img2: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ category, name, price, href, img1, img2 }) => {
  return (
    <Link href={href} className="group block bg-accent rounded-2xl p-4 w-[250px] shrink-0 transform transition-transform hover:-translate-y-1">
      <div className="flex justify-between items-center mb-4">
        <span className="bg-white text-dark-gray text-[10px] font-semibold px-3 py-1.5 rounded-full uppercase tracking-wide">{category}</span>
        <button className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0">
          <ShoppingBag className="w-4 h-4 text-dark-gray" strokeWidth={1.5}/>
        </button>
      </div>

      <div className="relative aspect-[1/1] w-full mb-4">
        <Image src={img1} alt={name} fill style={{ objectFit: 'contain' }} className="transition-opacity duration-300 group-hover:opacity-0" sizes="(max-width: 768px) 50vw, 25vw" />
        <Image src={img2} alt={name} fill style={{ objectFit: 'contain' }} className="opacity-0 transition-opacity duration-300 group-hover:opacity-100" sizes="(max-width: 768px) 50vw, 25vw" />
      </div>

      <div className="text-center text-dark-gray">
        <h4 className="text-sm font-medium leading-tight h-10 flex items-center justify-center">{name}</h4>
        <p className="text-base mt-2 font-light">{price}</p>
      </div>
    </Link>
  );
};

export default function PureBrillianceProducts() {
  return (
    <section className="bg-background text-foreground py-16 md:py-24">
      <h2 className="text-center font-display text-5xl md:text-6xl font-normal leading-none text-dark-gray mb-10 md:mb-20">
        Explore <em className="font-light italic">pure potency</em>
      </h2>
      
      <div className="lg:grid lg:grid-cols-2 items-stretch">
        <div className="relative min-h-[500px] lg:min-h-0 w-full h-full">
          <Image
            src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/3b0516f1-9fa9-4c4a-b3a3-3ad67e6bf33b-truekindskincare-com/assets/images/explore-1-4.jpg?"
            alt="Close-up of a woman with skincare cream on her face"
            fill
            style={{ objectFit: 'cover' }}
            className="w-full h-full"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>

        <div className="bg-white p-8 md:p-12 lg:p-16 flex flex-col justify-center">
            <div className="flex justify-between items-start mb-10">
                <h3 className="font-display text-5xl md:text-6xl font-normal leading-tight text-dark-gray">
                    Pure <br />
                    <em className="font-light italic">Brilliance</em>
                </h3>
                <Link href="/products" className="w-16 h-16 md:w-20 md:h-20 bg-dark-gray rounded-full flex items-center justify-center text-white shrink-0 hover:scale-110 transition-transform">
                    <ArrowRight className="w-6 h-6 md:w-7 md:h-7" strokeWidth={1}/>
                </Link>
            </div>
            
            <div className="flex gap-x-6 overflow-x-auto -mx-8 md:-mx-12 lg:-mx-16 px-8 md:px-12 lg:px-16 pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {products.map((product) => (
                <ProductCard key={product.name} {...product} />
              ))}
            </div>

            <p className="text-medium-gray text-[13px] text-left mt-12 max-w-xs">
              Stay glowing and healthy without having to think about it.
            </p>
        </div>
      </div>
    </section>
  );
}