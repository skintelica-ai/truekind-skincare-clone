"use client";

import { useState, useEffect } from "react";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Search, SlidersHorizontal } from "lucide-react";

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  originalPrice: number | null;
  brandId: number | null;
  categoryId: number | null;
  rating: number | null;
  reviewCount: number;
  isNew: boolean;
  isFeatured: boolean;
}

interface ProductImage {
  productId: number;
  imageUrl: string;
  isPrimary: boolean;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Brand {
  id: number;
  name: string;
  slug: string;
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [sortBy, setSortBy] = useState("featured");
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, imagesRes, categoriesRes, brandsRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/product-images"),
        fetch("/api/categories"),
        fetch("/api/brands"),
      ]);

      const productsData = await productsRes.json();
      const imagesData = await imagesRes.json();
      const categoriesData = await categoriesRes.json();
      const brandsData = await brandsRes.json();

      setProducts(productsData.products || []);
      setProductImages(imagesData.images || []);
      setCategories(categoriesData.categories || []);
      setBrands(brandsData.brands || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getProductImage = (productId: number) => {
    const image = productImages.find(
      (img) => img.productId === productId && img.isPrimary
    );
    return image?.imageUrl || "/placeholder-product.jpg";
  };

  const getBrandName = (brandId: number | null) => {
    if (!brandId) return undefined;
    return brands.find((b) => b.id === brandId)?.name;
  };

  const filteredProducts = products
    .filter((product) => {
      // Search filter
      if (
        searchQuery &&
        !product.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Category filter
      if (
        selectedCategory !== "all" &&
        product.categoryId !== parseInt(selectedCategory)
      ) {
        return false;
      }

      // Brand filter
      if (selectedBrand !== "all" && product.brandId !== parseInt(selectedBrand)) {
        return false;
      }

      // Price filter
      if (product.price < priceRange[0] || product.price > priceRange[1]) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "name":
          return a.name.localeCompare(b.name);
        case "newest":
          return a.isNew === b.isNew ? 0 : a.isNew ? -1 : 1;
        case "featured":
        default:
          return a.isFeatured === b.isFeatured ? 0 : a.isFeatured ? -1 : 1;
      }
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="mb-8 h-12 w-1/3" />
          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            <Skeleton className="h-96" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-square w-full rounded-2xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 font-display text-5xl font-light text-dark-gray">
            Shop All Products
          </h1>
          <p className="text-medium-gray">
            Discover our complete collection of clean, conscious skincare
          </p>
        </div>

        {/* Search and Sort */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-medium-gray" />
            <Input
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          {/* Filters Sidebar */}
          <aside
            className={`space-y-6 ${showFilters ? "block" : "hidden lg:block"}`}
          >
            <div className="rounded-xl border border-border bg-white p-6">
              <h3 className="mb-4 font-display text-xl font-medium text-dark-gray">
                Filters
              </h3>

              {/* Category Filter */}
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-dark-gray">
                  Category
                </label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Brand Filter */}
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-dark-gray">
                  Brand
                </label>
                <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Brands" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Brands</SelectItem>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id.toString()}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div>
                <label className="mb-2 block text-sm font-medium text-dark-gray">
                  Price Range
                </label>
                <div className="space-y-3">
                  <Slider
                    min={0}
                    max={2000}
                    step={50}
                    value={priceRange}
                    onValueChange={(value) => setPriceRange(value as [number, number])}
                    className="mt-2"
                  />
                  <div className="flex items-center justify-between text-sm text-medium-gray">
                    <span>₹{priceRange[0]}</span>
                    <span>₹{priceRange[1]}</span>
                  </div>
                </div>
              </div>

              {/* Reset Filters */}
              <Button
                variant="outline"
                className="mt-6 w-full"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setSelectedBrand("all");
                  setPriceRange([0, 2000]);
                  setSortBy("featured");
                }}
              >
                Reset Filters
              </Button>
            </div>
          </aside>

          {/* Products Grid */}
          <div>
            <p className="mb-4 text-sm text-medium-gray">
              Showing {filteredProducts.length} of {products.length} products
            </p>
            {filteredProducts.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-lg text-medium-gray">
                  No products found matching your filters.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                    setSelectedBrand("all");
                    setPriceRange([0, 2000]);
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    slug={product.slug}
                    price={product.price}
                    originalPrice={product.originalPrice}
                    imageUrl={getProductImage(product.id)}
                    brandName={getBrandName(product.brandId)}
                    rating={product.rating}
                    reviewCount={product.reviewCount}
                    isNew={product.isNew}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}