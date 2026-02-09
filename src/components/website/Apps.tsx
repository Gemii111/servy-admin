import React from 'react';
import { Box, Container, Typography, Card, CardContent, List, ListItem, ListItemIcon, ListItemText, Button } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import StoreIcon from '@mui/icons-material/Store';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { websiteContent } from '../../lib/content';
import { renderMixedText } from '../../utils/textUtils';

const Apps: React.FC = () => {
  const apps = [
    {
      ...websiteContent.home.apps.customer,
      icon: <PhoneAndroidIcon sx={{ fontSize: 70 }} />,
      color: '#667eea',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
      ...websiteContent.home.apps.vendor,
      icon: <StoreIcon sx={{ fontSize: 70 }} />,
      color: '#f093fb',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
    {
      ...websiteContent.home.apps.driver,
      icon: <LocalShippingIcon sx={{ fontSize: 70 }} />,
      color: '#4facfe',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    },
  ];

  return (
    <Box
      id="apps"
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
          التطبيقات الثلاثة
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
          {apps.map((app, index) => (
            <Box key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
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
                    background: app.gradient,
                    transform: 'scaleX(0)',
                    transformOrigin: 'left',
                    transition: 'transform 0.4s ease',
                  },
                  '&:hover': {
                    transform: 'translateY(-12px) scale(1.02)',
                    boxShadow: `0 24px 80px ${app.color}20, 0 0 0 1px ${app.color}15`,
                    '&::before': {
                      transform: 'scaleX(1)',
                    },
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 5, textAlign: 'center' }}>
                  <Box
                    sx={{
                      mb: 3,
                      display: 'inline-flex',
                      p: 3,
                      borderRadius: 4,
                      background: app.gradient,
                      boxShadow: `0 12px 40px ${app.color}30`,
                    }}
                  >
                    <Box sx={{ color: 'white' }}>{app.icon}</Box>
                  </Box>
                  <Typography
                    variant="h4"
                    fontWeight={700}
                    gutterBottom
                    sx={{
                      mb: 2,
                      background: app.gradient,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      direction: 'ltr',
                    }}
                  >
                    {renderMixedText(app.name)}
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    paragraph
                    sx={{ mb: 3, lineHeight: 1.8, direction: 'rtl' }}
                  >
                    {renderMixedText(app.description)}
                  </Typography>
                  <List dense sx={{ mb: 3, textAlign: 'right' }}>
                    {app.features.map((feature, featureIndex) => (
                      <ListItem key={featureIndex} disablePadding sx={{ mb: 1.5 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <CheckCircleIcon
                            sx={{
                              fontSize: 22,
                              color: app.color,
                            }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={renderMixedText(feature)}
                          primaryTypographyProps={{
                            variant: 'body2',
                            sx: { fontSize: '0.95rem', lineHeight: 1.6, color: '#1A1A1A', direction: 'rtl' },
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                  <Button
                    component="a"
                    href={app.downloadUrl}
                    download={app.downloadFileName}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="contained"
                    fullWidth
                    sx={{
                      mt: 'auto',
                      py: 1.5,
                      borderRadius: 3,
                      background: app.gradient,
                      boxShadow: `0 8px 24px ${app.color}30`,
                      fontWeight: 600,
                      fontSize: '1rem',
                      textTransform: 'none',
                      color: 'white',
                      textDecoration: 'none',
                      '&:hover': {
                        background: app.gradient,
                        boxShadow: `0 12px 32px ${app.color}40`,
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    تحميل التطبيق
                  </Button>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default Apps;
