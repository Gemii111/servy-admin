import React from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';
import Header from '../../components/website/Header';
import Footer from '../../components/website/Footer';
import { websiteContent } from '../../lib/content';
import { renderMixedText } from '../../utils/textUtils';

const PrivacyPage: React.FC = () => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F8F9FA', direction: 'ltr' }}>
      <Header />
      <Box sx={{ pt: 8, pb: 4 }}>
        <Container maxWidth="lg">
          <Paper sx={{ p: 4, bgcolor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderRadius: 4 }}>
            <Typography
              variant="h3"
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
              سياسة الخصوصية
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B7280', mb: 4 }} paragraph>
              آخر تحديث: {websiteContent.privacy.lastUpdated}
            </Typography>

            {websiteContent.privacy.sections.map((section, index) => (
              <Box key={index} sx={{ mb: 4 }}>
                <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mt: 3, mb: 2, color: '#1A1A1A', direction: 'ltr' }}>
                  {renderMixedText(section.title)}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ whiteSpace: 'pre-line', lineHeight: 1.8, color: '#6B7280', direction: 'ltr' }}
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

export default PrivacyPage;
