import React from 'react';
import { Box, Container, Typography, Link, IconButton } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import { websiteContent } from '../../lib/content';
import { renderMixedText } from '../../utils/textUtils';

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
        bgcolor: '#F8F9FA',
        borderTop: '1px solid rgba(0,0,0,0.1)',
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
          background: 'linear-gradient(90deg, transparent, rgba(102,126,234,0.3), transparent)',
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
                background: 'linear-gradient(135deg, #86B573 0%, #6A9A5A 50%, #9BCB88 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {websiteContent.appNameAr}
            </Typography>
            <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, mb: 3, color: '#6B7280', direction: 'ltr' }}>
              {renderMixedText(websiteContent.description)}
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
                    color: '#6B7280',
                    border: '1px solid rgba(0,0,0,0.1)',
                    bgcolor: 'white',
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
                color: '#1A1A1A',
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
                    color: '#6B7280',
                    fontSize: '0.95rem',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      color: '#86B573',
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
                color: '#1A1A1A',
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
                    color: '#6B7280',
                    fontSize: '0.95rem',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      color: '#86B573',
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
                color: '#1A1A1A',
              }}
            >
              اتصل بنا
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Typography variant="body2" sx={{ fontSize: '0.95rem', color: '#6B7280', direction: 'ltr' }}>
                📧 {renderMixedText(websiteContent.contact.customerService.email)}
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.95rem', color: '#6B7280', direction: 'ltr' }}>
                📱 {renderMixedText(websiteContent.contact.customerService.phone)}
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.95rem', color: '#6B7280', direction: 'ltr' }}>
                ⏰ {renderMixedText(websiteContent.contact.customerService.hours)}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            mt: 6,
            pt: 4,
            borderTop: '1px solid rgba(0,0,0,0.1)',
            textAlign: 'center',
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontSize: '0.9rem',
              color: '#5A6A5A',
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
