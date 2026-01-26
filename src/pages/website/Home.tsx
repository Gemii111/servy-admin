import React from 'react';
import { Box } from '@mui/material';
import Header from '../../components/website/Header';
import Footer from '../../components/website/Footer';
import Hero from '../../components/website/Hero';
import Features from '../../components/website/Features';
import Apps from '../../components/website/Apps';
import WhySouq from '../../components/website/WhySouq';
import HowToStart from '../../components/website/HowToStart';

const HomePage: React.FC = () => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header />
      <Box sx={{ pt: 8 }}>
        <Hero />
        <Features />
        <Apps />
        <WhySouq />
        <HowToStart />
      </Box>
      <Footer />
    </Box>
  );
};

export default HomePage;
