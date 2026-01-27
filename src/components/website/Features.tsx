import React from 'react';
import { Box, Container, Typography, Card, CardContent } from '@mui/material';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import StoreIcon from '@mui/icons-material/Store';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { websiteContent } from '../../lib/content';
import { renderMixedText } from '../../utils/textUtils';

const Features: React.FC = () => {
  const sections = [
    {
      title: 'للعملاء',
      icon: <RestaurantIcon sx={{ fontSize: 50 }} />,
      features: websiteContent.home.features.customers,
      color: '#667eea',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
      title: 'للتجار',
      icon: <StoreIcon sx={{ fontSize: 50 }} />,
      features: websiteContent.home.features.vendors,
      color: '#f093fb',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
    {
      title: 'للسائقين',
      icon: <LocalShippingIcon sx={{ fontSize: 50 }} />,
      features: websiteContent.home.features.drivers,
      color: '#4facfe',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    },
  ];

  return (
    <Box
      sx={{
        py: { xs: 6, md: 10 },
        bgcolor: '#F8F9FA',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(102,126,234,0.3), transparent)',
        },
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h2"
          textAlign="center"
          fontWeight={800}
          gutterBottom
          sx={{
            mb: 8,
            fontSize: { xs: '2rem', md: '3rem' },
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          مميزات التطبيق
        </Typography>

        {sections.map((section, sectionIndex) => (
          <Box key={sectionIndex} sx={{ mb: { xs: 6, md: 10 } }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                mb: 5,
                justifyContent: 'center',
              }}
            >
              <Box
                sx={{
                  p: 2,
                  borderRadius: 3,
                  background: section.gradient,
                  boxShadow: `0 8px 32px ${section.color}30`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Box sx={{ color: 'white' }}>{section.icon}</Box>
              </Box>
              <Typography
                variant="h3"
                fontWeight={700}
                sx={{
                  fontSize: { xs: '1.75rem', md: '2.5rem' },
                  background: section.gradient,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {section.title}
              </Typography>
            </Box>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                },
                gap: 3,
              }}
            >
              {section.features.map((feature, index) => (
                <Box key={index}>
                  <Card
                    sx={{
                      height: '100%',
                      bgcolor: 'white',
                      border: '1px solid rgba(0,0,0,0.08)',
                      borderRadius: 4,
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: section.gradient,
                        transform: 'scaleX(0)',
                        transformOrigin: 'left',
                        transition: 'transform 0.4s ease',
                      },
                      '&:hover': {
                        transform: 'translateY(-12px)',
                        boxShadow: `0 20px 60px ${section.color}20, 0 0 0 1px ${section.color}15`,
                        '&::before': {
                          transform: 'scaleX(1)',
                        },
                      },
                    }}
                  >
                    <CardContent sx={{ p: 4 }}>
                      <Typography
                        variant="h6"
                        fontWeight={700}
                        gutterBottom
                        sx={{
                          mb: 2,
                          fontSize: '1.1rem',
                          color: '#1A1A1A',
                          direction: 'ltr',
                        }}
                      >
                        {renderMixedText(feature.title)}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          lineHeight: 1.8,
                          fontSize: '0.95rem',
                          color: '#6B7280',
                          direction: 'ltr',
                        }}
                      >
                        {renderMixedText(feature.description)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
          </Box>
        ))}
      </Container>
    </Box>
  );
};

export default Features;
