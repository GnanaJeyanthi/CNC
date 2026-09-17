import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import FeaturedCategories from '../components/FeaturedCategories';
import FAQ from '../components/FAQ';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import MarketplacePreview from '../components/MarketplacePreview';

const Home = () => {
  return (
    <div className="min-h-screen bg-background font-sans text-textMain overflow-x-hidden">
      <Navbar transparent={true} />
      <Hero />
      <FeaturedCategories />
      <MarketplacePreview />
      <FAQ />
      <Contact />
      <Footer />
    </div>
  );
};

export default Home;
