import React from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';
import Header from '../../components/website/Header';
import Footer from '../../components/website/Footer';
import { websiteContent } from '../../lib/content';

const PrivacyPage: React.FC = () => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header />
      <Box sx={{ pt: 8, pb: 4 }}>
        <Container maxWidth="lg">
          <Paper sx={{ p: 4, bgcolor: 'background.paper' }}>
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              سياسة الخصوصية
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              آخر تحديث: {websiteContent.privacy.lastUpdated}
            </Typography>

            {websiteContent.privacy.sections.map((section, index) => (
              <Box key={index} sx={{ mb: 4 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mt: 3 }}>
                  {section.title}
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}
                >
                  {section.content}
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
