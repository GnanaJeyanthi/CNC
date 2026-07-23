import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import LiveTicker from '../components/LiveTicker';
import LiveWorkshopPreview from '../components/LiveWorkshopPreview';
import FeaturedCategories from '../components/FeaturedCategories';
import PopularWorkshops from '../components/PopularWorkshops';
import FeaturedCreators from '../components/FeaturedCreators';
import HowCastNcartWorks from '../components/HowCastNcartWorks';
import PlatformBenefits from '../components/PlatformBenefits';
import Testimonials from '../components/Testimonials';
import FAQ from '../components/FAQ';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import MarketplacePreview from '../components/MarketplacePreview';

const Home = () => {
  return (
    <div className="min-h-screen bg-background font-sans text-textMain overflow-x-hidden">
      <Navbar />
      <Hero />
      <LiveTicker />
      <LiveWorkshopPreview />
      <FeaturedCategories />
      <PopularWorkshops />
      <MarketplacePreview />
      <FeaturedCreators />
      <HowCastNcartWorks />
      <PlatformBenefits />
      <Testimonials />
      <FAQ />
      <Contact />
      <Footer />
    </div>
  );
};

export default Home;
