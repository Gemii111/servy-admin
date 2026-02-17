import React from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';
import Header from '../../components/website/Header';
import Footer from '../../components/website/Footer';
import { websiteContent } from '../../lib/content';
import { renderMixedText } from '../../utils/textUtils';

const TermsPage: React.FC = () => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F5F9F3', direction: 'ltr' }}>
      <Header />
      <Box sx={{ pt: 8, pb: 4 }}>
        <Container maxWidth="lg">
          <Paper sx={{ p: 4, bgcolor: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', borderRadius: 24 }}>
            <Typography
              variant="h3"
              fontWeight={800}
              gutterBottom
              sx={{
                mb: 2,
                background: 'linear-gradient(135deg, #86B573 0%, #6A9A5A 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              الشروط والأحكام
            </Typography>
            <Typography variant="body2" sx={{ color: '#3A4A3A', mb: 4 }} paragraph>
              آخر تحديث: {websiteContent.terms.lastUpdated}
            </Typography>

            {websiteContent.terms.sections.map((section, index) => (
              <Box key={index} sx={{ mb: 4 }}>
                <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mt: 3, mb: 2, color: '#1A2E1A', direction: 'ltr' }}>
                  {renderMixedText(section.title)}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ whiteSpace: 'pre-line', lineHeight: 1.8, color: '#3A4A3A', direction: 'ltr' }}
                >
                  {renderMixedText(section.content)}
                </Typography>
              </Box>
            ))}
          </Paper>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
};

export default TermsPage;
