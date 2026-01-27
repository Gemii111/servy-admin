import React from 'react';
import { Box, Container, Typography, Card, CardContent, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { websiteContent } from '../../lib/content';
import { renderMixedText } from '../../utils/textUtils';

const HowToStart: React.FC = () => {
  const sections = [
    {
      title: 'للعملاء',
      steps: websiteContent.home.howToStart.customers,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#667eea',
    },
    {
      title: 'للتجار',
      steps: websiteContent.home.howToStart.vendors,
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      color: '#f093fb',
    },
    {
      title: 'للسائقين',
      steps: websiteContent.home.howToStart.drivers,
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      color: '#4facfe',
    },
  ];

  return (
    <Box
      sx={{
        py: { xs: 6, md: 10 },
        bgcolor: 'white',
        position: 'relative',
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
          كيفية البدء
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(3, 1fr)',
            },
            gap: 4,
          }}
        >
          {sections.map((section, index) => (
            <Box key={index}>
              <Card
                sx={{
                  height: '100%',
                  bgcolor: '#F8F9FA',
                  border: '1px solid rgba(0,0,0,0.08)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  borderRadius: 4,
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
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
                    boxShadow: `0 20px 60px ${section.color}20`,
                    '&::before': {
                      transform: 'scaleX(1)',
                    },
                  },
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography
                    variant="h4"
                    fontWeight={700}
                    gutterBottom
                    sx={{
                      mb: 4,
                      background: section.gradient,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {section.title}
                  </Typography>
                  <List>
                    {section.steps.map((step, stepIndex) => (
                      <ListItem key={stepIndex} disablePadding sx={{ mb: 2 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <Box
                            sx={{
                              p: 0.5,
                              borderRadius: '50%',
                              background: section.gradient,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: `0 4px 12px ${section.color}30`,
                            }}
                          >
                            <CheckCircleIcon
                              sx={{
                                color: 'white',
                                fontSize: 20,
                              }}
                            />
                          </Box>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <>
                              {stepIndex + 1}. {renderMixedText(step)}
                            </>
                          }
                          primaryTypographyProps={{
                            variant: 'body1',
                            sx: {
                              fontSize: '0.95rem',
                              lineHeight: 1.7,
                              fontWeight: 500,
                              color: '#1A1A1A',
                              direction: 'ltr',
                            },
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default HowToStart;
