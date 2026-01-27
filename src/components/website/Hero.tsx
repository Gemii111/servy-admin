import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { websiteContent } from '../../lib/content';
import { renderMixedText } from '../../utils/textUtils';

const Hero: React.FC = () => {
  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)',
        backgroundSize: '400% 400%',
        animation: 'gradient 15s ease infinite',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          animation: 'float 20s linear infinite',
          opacity: 0.3,
        },
        '@keyframes gradient': {
          '0%': {
            backgroundPosition: '0% 50%',
          },
          '50%': {
            backgroundPosition: '100% 50%',
          },
          '100%': {
            backgroundPosition: '0% 50%',
          },
        },
        '@keyframes float': {
          '0%': {
            transform: 'translate(0, 0) rotate(0deg)',
          },
          '100%': {
            transform: 'translate(-50px, -50px) rotate(360deg)',
          },
        },
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: 12 }}>
        <Box
          sx={{
            textAlign: 'center',
            color: 'white',
            animation: 'fadeInUp 1s ease-out',
            '@keyframes fadeInUp': {
              from: {
                opacity: 0,
                transform: 'translateY(30px)',
              },
              to: {
                opacity: 1,
                transform: 'translateY(0)',
              },
            },
          }}
        >
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '3rem', sm: '4.5rem', md: '6rem', lg: '7rem' },
              fontWeight: 900,
              mb: 3,
              textShadow: '0 10px 40px rgba(0,0,0,0.3), 0 0 80px rgba(255,255,255,0.1)',
              letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 50%, #ffffff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              direction: 'ltr',
            }}
          >
            {renderMixedText(websiteContent.home.hero.title)}
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
              fontWeight: 600,
              mb: 3,
              opacity: 0.95,
              textShadow: '0 4px 20px rgba(0,0,0,0.2)',
              letterSpacing: '0.02em',
              direction: 'ltr',
            }}
          >
            {renderMixedText(websiteContent.home.hero.subtitle)}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontSize: { xs: '1.1rem', md: '1.3rem' },
              mb: 6,
              maxWidth: '700px',
              mx: 'auto',
              opacity: 0.9,
              lineHeight: 1.9,
              textShadow: '0 2px 10px rgba(0,0,0,0.2)',
              fontWeight: 400,
              direction: 'ltr',
            }}
          >
            {renderMixedText(websiteContent.home.hero.description)}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Hero;
