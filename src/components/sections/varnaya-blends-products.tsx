"use client";

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ShoppingBag } from 'lucide-react';

interface Product {
  name: string;
  href: string;
  image1: string;
  image2: string;
  price: string;
  category: string;
}

const products: Product[] = [
  {
    name: 'Rosehip & Bakuchiol Skin Perfecting Oil',
    href: '/products/rosehip-bakuchiol-skin-perfecting-oil',
    image1: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/3b0516f1-9fa9-4c4a-b3a3-3ad67e6bf33b-truekindskincare-com/assets/images/ZurQ9LVsGrYSvimZ_1-12.jpg?',
    image2: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/3b0516f1-9fa9-4c4a-b3a3-3ad67e6bf33b-truekindskincare-com/assets/images/ZurQ9rVsGrYSvimb_2-13.jpg?',
    price: '₹899',
    category: 'Varnaya Blends',
  },
  {
    name: 'Manjistha and Saffron Moisture Gel',
    href: '/products/manjistha-and-saffron-moisture-gel',
    image1: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/3b0516f1-9fa9-4c4a-b3a3-3ad67e6bf33b-truekindskincare-com/assets/images/ZurQjbVsGrYSvik0_1-14.jpg?',
    image2: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/3b0516f1-9fa9-4c4a-b3a3-3ad67e6bf33b-truekindskincare-com/assets/images/ZurQj7VsGrYSvik3_2-15.jpg?',
    price: '₹899',
    category: 'Varnaya Blends',
  },
  {
    name: 'Acne Calming Herb Rescue Mask',
    href: '/products/acne-calming-herb-rescue-mask',
    image1: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/3b0516f1-9fa9-4c4a-b3a3-3ad67e6bf33b-truekindskincare-com/assets/images/ZurNf7VsGrYSviaK_1-16.jpg?',
    image2: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/3b0516f1-9fa9-4c4a-b3a3-3ad67e6bf33b-truekindskincare-com/assets/images/ZurNgbVsGrYSviaN_2-17.jpg?',
    price: '₹899',
    category: 'Varnaya Blends',
  },
  {
    name: 'Kumkumadi Radiance Facial Oil',
    href: '/products/kumkumadi-radiance-facial-oil',
    image1: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/3b0516f1-9fa9-4c4a-b3a3-3ad67e6bf33b-truekindskincare-com/assets/images/ZurP_7VsGrYSvijF_1-18.jpg?',
    image2: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/3b0516f1-9fa9-4c4a-b3a3-3ad67e6bf33b-truekindskincare-com/assets/images/ZurQAbVsGrYSvijG_2-19.jpg?',
    price: '₹899',
    category: 'Varnaya Blends',
  },
];

const ProductCard = ({ product }: { product: Product }) => {
  return (
    <a href={product.href} className="w-[260px] flex-shrink-0 group block text-primary">
      <div className="relative bg-beige-neutral rounded-2xl aspect-[9/12] p-3 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={product.image1}
            alt={product.name}
            width={260}
            height={346}
            className="absolute inset-0 w-full h-full object-contain p-6 transition-opacity duration-300 group-hover:opacity-0"
          />
          <Image
            src={product.image2}
            alt={product.name}
            width={260}
            height={346}
            className="absolute inset-0 w-full h-full object-contain p-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
        </div>
        <div className="relative z-10 flex justify-between items-start">
          <span className="text-[10px] uppercase bg-white/50 backdrop-blur-sm rounded-full py-1.5 px-3 font-body font-medium text-primary tracking-wider">
            {product.category}
          </span>
          <button
            aria-label="Add to cart"
            className="bg-white/50 backdrop-blur-sm rounded-full w-8 h-8 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300"
            onClick={(e) => e.preventDefault()}
          >
            <ShoppingBag size={14} />
          </button>
        </div>
      </div>
      <div className="mt-4 px-1 text-center">
        <h3 className="text-sm font-body font-medium leading-snug h-10 flex items-center justify-center">
          {product.name}
        </h3>
        <p className="mt-1 text-sm font-body">{product.price}</p>
      </div>
    </a>
  );
};

const VarnayaBlendsProducts = () => {
    return (
        <div className="bg-background text-primary">
            <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="relative min-h-[500px] lg:min-h-0 lg:col-start-2">
                    <Image
                        src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/3b0516f1-9fa9-4c4a-b3a3-3ad67e6bf33b-truekindskincare-com/assets/images/explore-2-11.jpg?"
                        alt="Close-up portrait of a woman with freckles"
                        fill
                        className="object-cover"
                    />
                </div>
                <div className="flex flex-col justify-center px-6 py-16 md:px-12 lg:px-16 xl:px-24 lg:col-start-1 lg:row-start-1">
                    <div className="flex justify-between items-start mb-8 lg:mb-12">
                        <div>
                            <h2 className="font-display text-5xl md:text-6xl font-normal leading-none">Varnaya</h2>
                            <h2 className="font-display text-5xl md:text-6xl font-normal italic leading-tight -mt-1 md:-mt-2">Blends</h2>
                        </div>
                        <a
                            href="/products"
                            aria-label="View all Varnaya Blends products"
                            className="w-14 h-14 md:w-16 md:h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center shrink-0 hover:scale-110 transition-transform duration-300"
                        >
                            <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
                        </a>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 lg:-mx-16 lg:px-16 xl:-mx-24 xl:px-24 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        {products.map((product) => (
                            <ProductCard key={product.name} product={product} />
                        ))}
                    </div>
                    <p className="mt-8 lg:mt-12 text-sm uppercase text-medium-gray tracking-wider max-w-sm">
                        Stay glowing and healthy without having to think about it.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VarnayaBlendsProducts;