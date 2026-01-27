import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Header from '../../components/website/Header';
import Footer from '../../components/website/Footer';
import { websiteContent } from '../../lib/content';
import { renderMixedText } from '../../utils/textUtils';

const FAQPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { value: 'all', label: 'الكل' },
    { value: 'general', label: 'عام' },
    { value: 'customers', label: 'للعملاء' },
    { value: 'vendors', label: 'للتجار' },
    { value: 'drivers', label: 'للسائقين' },
    { value: 'technical', label: 'تقني' },
    { value: 'payment', label: 'الدفع والأسعار' },
    { value: 'support', label: 'المشاكل والدعم' },
  ];

  const filteredFAQs =
    selectedCategory === 'all'
      ? websiteContent.faq
      : websiteContent.faq.filter((faq) => faq.category === selectedCategory);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F8F9FA', direction: 'ltr' }}>
      <Header />
      <Box sx={{ pt: 8, pb: 4 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            fontWeight={800}
            textAlign="center"
            gutterBottom
            sx={{
              mb: 4,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            الأسئلة الشائعة
          </Typography>

          <Paper sx={{ mb: 4, p: 2, bgcolor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderRadius: 3 }}>
            <Tabs
              value={selectedCategory}
              onChange={(_, newValue) => setSelectedCategory(newValue)}
              variant="scrollable"
              scrollButtons="auto"
            >
              {categories.map((category) => (
                <Tab key={category.value} label={category.label} value={category.value} />
              ))}
            </Tabs>
          </Paper>

          <Box>
            {filteredFAQs.map((faq, index) => (
              <Accordion
                key={index}
                sx={{
                  mb: 2,
                  bgcolor: 'white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  borderRadius: 2,
                  '&:before': { display: 'none' },
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6" fontWeight={700} sx={{ color: '#1A1A1A', direction: 'ltr' }}>
                    {renderMixedText(faq.question)}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography
                    variant="body1"
                    sx={{ whiteSpace: 'pre-line', lineHeight: 1.8, color: '#6B7280', direction: 'ltr' }}
                  >
                    {renderMixedText(faq.answer)}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
};

export default FAQPage;
