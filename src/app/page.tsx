import NavigationBar from '@/components/sections/navigation-bar';
import HeroSection from '@/components/sections/hero-section';
import BrandValues from '@/components/sections/brand-values';
import PureBrillianceProducts from '@/components/sections/pure-brilliance-products';
import VarnayaBlendsProducts from '@/components/sections/varnaya-blends-products';
import TransparencyEthos from '@/components/sections/transparency-ethos';
import PhilosophySection from '@/components/sections/philosophy-section';
import ExcitingOffers from '@/components/sections/exciting-offers';
import JournalSection from '@/components/sections/journal-section';
import ConnectSection from '@/components/sections/connect-section';
import NewsletterFooter from '@/components/sections/newsletter-footer';

export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      <NavigationBar />
      
      <HeroSection />
      
      <BrandValues />
      
      <PureBrillianceProducts />
      
      <VarnayaBlendsProducts />
      
      <TransparencyEthos />
      
      <PhilosophySection />
      
      <ExcitingOffers />
      
      <JournalSection />
      
      <ConnectSection />
      
      <NewsletterFooter />
    </main>
  );
}