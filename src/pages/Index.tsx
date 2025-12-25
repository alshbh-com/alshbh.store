import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import PricingSection from '@/components/PricingSection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <Features />
        <PricingSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
