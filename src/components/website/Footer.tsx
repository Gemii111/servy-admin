import React from 'react';
import { Box, Container, Typography, Link, IconButton } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import { websiteContent } from '../../lib/content';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: 'الرئيسية', path: '/' },
    { label: 'التطبيقات', path: '/#apps' },
    { label: 'الأسئلة الشائعة', path: '/faq' },
    { label: 'اتصل بنا', path: '/contact' },
  ];

  const legalLinks = [
    { label: 'سياسة الخصوصية', path: '/privacy' },
    { label: 'الشروط والأحكام', path: '/terms' },
  ];

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'background.paper',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        pt: { xs: 6, md: 8 },
        pb: 4,
        mt: 8,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(102,126,234,0.5), transparent)',
        },
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(4, 1fr)',
            },
            gap: 4,
          }}
        >
          <Box>
            <Typography
              variant="h5"
              fontWeight={800}
              gutterBottom
              sx={{
                mb: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {websiteContent.appNameAr}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.8, mb: 3 }}>
              {websiteContent.description}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {[
                { icon: <FacebookIcon />, color: '#1877F2' },
                { icon: <TwitterIcon />, color: '#1DA1F2' },
                { icon: <InstagramIcon />, color: '#E4405F' },
                { icon: <LinkedInIcon />, color: '#0077B5' },
              ].map((social, index) => (
                <IconButton
                  key={index}
                  size="small"
                  sx={{
                    color: 'text.secondary',
                    border: '1px solid rgba(255,255,255,0.1)',
                    '&:hover': {
                      color: social.color,
                      borderColor: social.color,
                      bgcolor: `${social.color}15`,
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  {social.icon}
                </IconButton>
              ))}
            </Box>
          </Box>

          <Box>
            <Typography
              variant="h6"
              fontWeight={700}
              gutterBottom
              sx={{
                mb: 2,
                color: 'text.primary',
              }}
            >
              روابط سريعة
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {quickLinks.map((link) => (
                <Link
                  key={link.label}
                  component={RouterLink}
                  to={link.path}
                  sx={{
                    textDecoration: 'none',
                    color: 'text.secondary',
                    fontSize: '0.95rem',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      color: '#667eea',
                      transform: 'translateX(-4px)',
                    },
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </Box>
          </Box>

          <Box>
            <Typography
              variant="h6"
              fontWeight={700}
              gutterBottom
              sx={{
                mb: 2,
                color: 'text.primary',
              }}
            >
              قانوني
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {legalLinks.map((link) => (
                <Link
                  key={link.label}
                  component={RouterLink}
                  to={link.path}
                  sx={{
                    textDecoration: 'none',
                    color: 'text.secondary',
                    fontSize: '0.95rem',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      color: '#667eea',
                      transform: 'translateX(-4px)',
                    },
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </Box>
          </Box>

          <Box>
            <Typography
              variant="h6"
              fontWeight={700}
              gutterBottom
              sx={{
                mb: 2,
                color: 'text.primary',
              }}
            >
              اتصل بنا
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.95rem' }}>
                📧 {websiteContent.contact.customerService.email}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.95rem' }}>
                📱 {websiteContent.contact.customerService.phone}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.95rem' }}>
                ⏰ {websiteContent.contact.customerService.hours}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            mt: 6,
            pt: 4,
            borderTop: '1px solid rgba(255,255,255,0.1)',
            textAlign: 'center',
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontSize: '0.9rem',
              opacity: 0.7,
            }}
          >
            © {currentYear} {websiteContent.appNameAr}. جميع الحقوق محفوظة.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
