import React from 'react';
import { Box, Container, Typography, Card, CardContent } from '@mui/material';
import { websiteContent } from '../../lib/content';
import { renderMixedText } from '../../utils/textUtils';

const WhySouq: React.FC = () => {
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
  ];

  return (
    <Box
      sx={{
        py: { xs: 6, md: 10 },
        bgcolor: '#F8F9FA',
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
            {renderMixedText('لماذا (Souq)؟')}
          </Typography>
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
          {websiteContent.home.whySouq.map((item, index) => (
            <Box key={index}>
              <Card
                sx={{
                  height: '100%',
                  textAlign: 'center',
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
                    background: gradients[index % gradients.length],
                    transform: 'scaleX(0)',
                    transformOrigin: 'left',
                    transition: 'transform 0.4s ease',
                  },
                  '&:hover': {
                    transform: 'translateY(-12px)',
                    boxShadow: '0 20px 60px rgba(102,126,234,0.2)',
                    '&::before': {
                      transform: 'scaleX(1)',
                    },
                  },
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box
                    sx={{
                      mb: 3,
                      display: 'inline-flex',
                      p: 2,
                      borderRadius: 3,
                      background: gradients[index % gradients.length],
                      boxShadow: `0 8px 24px rgba(102,126,234,0.2)`,
                    }}
                  >
                    <Typography variant="h2" sx={{ fontSize: '3rem' }}>
                      {item.icon}
                    </Typography>
                  </Box>
                  <Typography
                    variant="h5"
                    fontWeight={700}
                    gutterBottom
                    sx={{
                      mb: 2,
                      background: gradients[index % gradients.length],
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      direction: 'ltr',
                    }}
                  >
                    {renderMixedText(item.title)}
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
                    {renderMixedText(item.description)}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default WhySouq;
