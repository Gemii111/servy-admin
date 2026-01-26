import React from 'react';
import { Box, Container, Typography, Card, CardContent } from '@mui/material';
import { websiteContent } from '../../lib/content';

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
        bgcolor: 'background.paper',
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
          لماذا Souq؟
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
                  bgcolor: 'background.default',
                  border: '1px solid rgba(255,255,255,0.1)',
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
                    background: gradients[index % gradients.length],
                    transform: 'scaleX(0)',
                    transformOrigin: 'left',
                    transition: 'transform 0.4s ease',
                  },
                  '&:hover': {
                    transform: 'translateY(-12px)',
                    boxShadow: `0 20px 60px rgba(102,126,234,0.3)`,
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
                      boxShadow: `0 8px 24px rgba(102,126,234,0.3)`,
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
                    }}
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ lineHeight: 1.8, fontSize: '0.95rem' }}
                  >
                    {item.description}
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
