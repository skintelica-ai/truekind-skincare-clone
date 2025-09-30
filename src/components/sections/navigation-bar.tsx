"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingBag, MapPin, Heart, User, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const TrueKindLogo = () => (
  <Link href="/" aria-label="Truekind homepage">
    <span className="font-display text-[28px] font-normal leading-none text-primary tracking-[0.015em]">
      TrueKind
    </span>
  </Link>
);

interface MegaMenuItem {
  title: string;
  items: string[];
}

interface CategoryMenu {
  [key: string]: MegaMenuItem[];
}

const megaMenuData: CategoryMenu = {
  MAKEUP: [
    {
      title: "Face",
      items: ["View All Face", "BB & CC Cream", "Blush", "Bronzer", "Concealer & Corrector", "Contour", "Face Palettes & Sets", "Face Primer", "Foundation", "Highlighter & Illuminator", "Powder", "Setting & Finishing Spray", "Tinted Moisturiser"]
    },
    {
      title: "Eyes",
      items: ["View All Eyes", "Eye Palettes & Sets", "Eye Primer", "Eyebrows", "Eyeliner", "Eyeshadow", "False Eyelashes", "Mascara", "Under Eye Concealer"]
    },
    {
      title: "Lips",
      items: ["View All Lips", "Lip Balm", "Lip Gloss", "Lip Liner", "Lip Palettes & Sets", "Lip Plumper", "Lip Primer", "Lip Stain & Tint", "Lipstick"]
    },
    {
      title: "Nails",
      items: ["View All Nails", "Base & Top Coat", "Nail Polish", "Nail Polish Remover", "Nail Sets", "Nail Treatments"]
    },
    {
      title: "Makeup Remover",
      items: ["View All Makeup Remover", "Eyes & Lips", "Face"]
    }
  ],
  SKINCARE: [
    {
      title: "Cleanser & Exfoliator",
      items: ["View All Cleanser & Exfoliator", "Facial Cleanser", "Scrub & Exfoliator"]
    },
    {
      title: "Toner",
      items: []
    },
    {
      title: "Moisturiser",
      items: ["View All Moisturiser", "Day Moisturiser", "Facial Mist", "Night Cream"]
    },
    {
      title: "Masks & Treatments",
      items: ["View All Masks & Treatments", "Eye Care", "Face Oil", "Lip Care", "Mask", "Peel", "Serum & Booster"]
    },
    {
      title: "Sun Care",
      items: ["View All Sun Care", "After Sun Care", "Face Sunscreen", "Self Tanner"]
    },
    {
      title: "Skincare Sets",
      items: []
    }
  ],
  HAIR: [
    {
      title: "Shampoo & Conditioner",
      items: ["View All Shampoo & Conditioner", "Conditioner", "Dry Shampoo", "Leave-In Conditioner", "Shampoo"]
    },
    {
      title: "Styling",
      items: ["View All Styling", "Hair Colour", "Hair Cream", "Hair Spray", "Heat Protection", "Mousse", "Pomade, Wax & Gel", "Texturiser", "Volumiser"]
    },
    {
      title: "Treatments",
      items: ["View All Treatments", "Hair Loss Treatment", "Hair Masks", "Hair Oil", "Hair Serum", "Scalp Treatment"]
    },
    {
      title: "Hair Care Sets",
      items: []
    }
  ],
  "TOOLS & BRUSHES": [
    {
      title: "Brushes",
      items: ["View All Brushes", "Brush Cleaners", "Brush Sets", "Eye Brushes", "Face Brushes", "Lip Brushes", "Multipurpose Brushes"]
    },
    {
      title: "Sponges & Applicators",
      items: ["View All Sponges & Applicators", "Powder Puffs", "Sponges"]
    },
    {
      title: "Makeup Accessories",
      items: ["View All Makeup Accessories", "Eyelash Curlers", "Pencil Sharpeners", "Tweezers & Brows"]
    },
    {
      title: "Hair Tools",
      items: ["View All Hair Tools", "Brushes & Combs", "Hair Accessories", "Hair Styling Devices"]
    },
    {
      title: "Manicure & Pedicure",
      items: ["View All Manicure & Pedicure", "Manicure & Pedicure Sets", "Pedicure Tools", "Scissors"]
    },
    {
      title: "Beauty Devices",
      items: ["View All Beauty Devices", "Makeup", "Skincare"]
    },
    {
      title: "Bags & Organisers",
      items: ["View All Bags & Organisers", "Containers", "Makeup Bags", "Palette Organisers"]
    }
  ],
  "BATH & BODY": [
    {
      title: "Bath & Shower",
      items: ["View All Bath & Shower", "Bath Soak", "Body Exfoliator", "Body Sponges", "Body Wash", "Hand Wash"]
    },
    {
      title: "Moisturiser",
      items: ["View All Moisturiser", "Body", "Foot Cream", "Hand Cream"]
    },
    {
      title: "Grooming",
      items: ["View All Grooming", "Deodorant", "Hair Removal"]
    },
    {
      title: "Suncare",
      items: ["View All Suncare", "After Sun Care", "Self Tanner", "Sun Protection"]
    }
  ],
  FRAGRANCE: [],
  CLEAN: [],
  GIFTS: [],
  SALE: []
};

export default function NavigationBar() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    updateCounts();
    
    const handleCartUpdate = () => updateCounts();
    const handleWishlistUpdate = () => updateCounts();
    
    window.addEventListener("cart-updated", handleCartUpdate);
    window.addEventListener("wishlist-updated", handleWishlistUpdate);
    
    return () => {
      window.removeEventListener("cart-updated", handleCartUpdate);
      window.removeEventListener("wishlist-updated", handleWishlistUpdate);
    };
  }, []);

  const updateCounts = async () => {
    try {
      const sessionId = localStorage.getItem("session_id");
      if (!sessionId) return;

      const [cartRes, wishlistRes] = await Promise.all([
        fetch(`/api/cart-items?sessionId=${sessionId}`),
        fetch(`/api/wishlist-items?sessionId=${sessionId}`),
      ]);

      const cartData = await cartRes.json();
      const wishlistData = await wishlistRes.json();

      setCartCount(cartData.items?.length || 0);
      setWishlistCount(wishlistData.items?.length || 0);
    } catch (error) {
      console.error("Error updating counts:", error);
    }
  };

  const categories = ["MAKEUP", "SKINCARE", "HAIR", "TOOLS & BRUSHES", "BATH & BODY", "FRAGRANCE", "CLEAN", "GIFTS", "SALE"];

  return (
    <>
      {/* Top utility bar */}
      <div className="w-full bg-black text-white">
        <div className="container flex h-9 items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <Link href="/orders" className="flex items-center gap-1.5 hover:text-gray-300 transition-colors">
              <User className="h-3.5 w-3.5" />
              <span>My Orders</span>
            </Link>
            <Link href="/shop" className="hover:text-gray-300 transition-colors">
              Shop All
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/shop" className="flex items-center gap-1.5 hover:text-gray-300 transition-colors">
              <MapPin className="h-3.5 w-3.5" />
              <span>Shop</span>
            </Link>
            <Link href="/wishlist" className="flex items-center gap-1.5 hover:text-gray-300 transition-colors relative">
              <Heart className="h-3.5 w-3.5" />
              <span>Wishlist</span>
              {wishlistCount > 0 && (
                <Badge className="ml-1 h-4 min-w-[16px] rounded-full bg-orange-accent px-1 text-[10px] leading-none">
                  {wishlistCount}
                </Badge>
              )}
            </Link>
            <Link href="/cart" className="flex items-center gap-1.5 hover:text-gray-300 transition-colors relative">
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>Cart</span>
              {cartCount > 0 && (
                <Badge className="ml-1 h-4 min-w-[16px] rounded-full bg-orange-accent px-1 text-[10px] leading-none">
                  {cartCount}
                </Badge>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background">
        <div className="container">
          <div className="flex h-[88px] items-center justify-between gap-8">
            <TrueKindLogo />

            {/* Search bar */}
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="search"
                  placeholder="Search for brands and products"
                  className="w-full h-10 pl-10 pr-4 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium">
                FREE SHIPPING<br />ABOVE ₹ 999
              </span>
            </div>
          </div>

          {/* Main navigation */}
          <nav className="flex items-center justify-center border-t border-border/40">
            <div className="flex items-center gap-1">
              {categories.map((category) => (
                <Link
                  key={category}
                  href="/shop"
                  onMouseEnter={() => setActiveMenu(category)}
                  className={`px-4 py-4 text-[13px] font-semibold tracking-wide transition-colors ${
                    activeMenu === category 
                      ? "text-[#d00000]" 
                      : "text-primary hover:text-[#d00000]"
                  }`}
                >
                  {category}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </header>

      {/* Mega menu dropdown */}
      {activeMenu && megaMenuData[activeMenu]?.length > 0 && (
        <div
          className="fixed left-0 right-0 top-[165px] z-40 bg-white border-b border-gray-200 shadow-lg"
          onMouseEnter={() => setActiveMenu(activeMenu)}
          onMouseLeave={() => setActiveMenu(null)}
        >
          <div className="container py-8">
            <div className="grid grid-cols-5 gap-8">
              {megaMenuData[activeMenu].map((section, index) => (
                <div key={index}>
                  {section.title && (
                    <h3 className="font-semibold text-sm mb-3 text-[#d00000] flex items-center gap-1">
                      {section.title}
                      <span className="text-[#d00000]">›</span>
                    </h3>
                  )}
                  <ul className="space-y-2">
                    {section.items.map((item, itemIndex) => (
                      <li key={itemIndex}>
                        <Link
                          href="/shop"
                          className="text-sm text-gray-700 hover:text-primary transition-colors block"
                        >
                          {item}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Overlay for mega menu */}
      {activeMenu && (
        <div
          className="fixed inset-0 bg-black/20 z-30 top-[165px]"
          onMouseEnter={() => setActiveMenu(null)}
        />
      )}
    </>
  );
}