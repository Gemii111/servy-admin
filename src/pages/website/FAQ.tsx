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
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header />
      <Box sx={{ pt: 8, pb: 4 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" fontWeight="bold" textAlign="center" gutterBottom sx={{ mb: 4 }}>
            الأسئلة الشائعة
          </Typography>

          <Paper sx={{ mb: 4, p: 2 }}>
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
              <Accordion key={index} sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6" fontWeight="bold">
                    {faq.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}
                  >
                    {faq.answer}
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
