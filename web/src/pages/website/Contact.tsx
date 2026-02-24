import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Header from '../../components/website/Header';
import Footer from '../../components/website/Footer';
import { websiteContent } from '../../lib/content';
import { renderMixedText } from '../../utils/textUtils';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
    alert('شكراً لتواصلك معنا! سنرد عليك قريباً.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F5F9F3', direction: 'ltr' }}>
      <Header />
      <Box sx={{ pt: 8, pb: 4 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            fontWeight={800}
            textAlign="center"
            gutterBottom
            sx={{
              mb: 6,
              background: 'linear-gradient(135deg, #86B573 0%, #6A9A5A 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            اتصل بنا
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(2, 1fr)',
              },
              gap: 4,
            }}
          >
            <Box>
              <Paper sx={{ p: 4, bgcolor: 'white', height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', borderRadius: 4 }}>
                <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 3, color: '#1A2E1A' }}>
                  معلومات الاتصال
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <EmailIcon sx={{ color: '#86B573' }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: '#3A4A3A' }}>
                        البريد الإلكتروني
                      </Typography>
                      <Typography variant="body1" fontWeight={600} sx={{ color: '#1A2E1A', direction: 'ltr' }}>
                        {renderMixedText(websiteContent.contact.customerService.email)}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <PhoneIcon sx={{ color: '#86B573' }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: '#3A4A3A' }}>
                        الهاتف
                      </Typography>
                      <Typography variant="body1" fontWeight={600} sx={{ color: '#1A2E1A', direction: 'ltr' }}>
                        {renderMixedText(websiteContent.contact.customerService.phone)}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <WhatsAppIcon sx={{ color: '#86B573' }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: '#3A4A3A' }}>
                        واتساب
                      </Typography>
                      <Typography variant="body1" fontWeight={600} sx={{ color: '#1A2E1A', direction: 'ltr' }}>
                        {renderMixedText(websiteContent.contact.customerService.whatsapp)}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <AccessTimeIcon sx={{ color: '#86B573' }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: '#3A4A3A' }}>
                        ساعات العمل
                      </Typography>
                      <Typography variant="body1" fontWeight={600} sx={{ color: '#1A2E1A', direction: 'ltr' }}>
                        {renderMixedText(websiteContent.contact.customerService.hours)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: '#1A2E1A', direction: 'ltr' }}>
                    للشكاوى والاقتراحات
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#3A4A3A', direction: 'ltr' }}>
                    {renderMixedText(websiteContent.contact.feedback.email)}
                  </Typography>
                </Box>

                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: '#1A2E1A', direction: 'ltr' }}>
                    للشراكة التجارية
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#3A4A3A', direction: 'ltr' }}>
                    {renderMixedText(websiteContent.contact.business.email)}
                  </Typography>
                </Box>
              </Paper>
            </Box>

            <Box>
              <Paper sx={{ p: 4, bgcolor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderRadius: 4 }}>
                <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 3, color: '#1A2E1A' }}>
                  أرسل لنا رسالة
                </Typography>
                <Box component="form" onSubmit={handleSubmit}>
                  <TextField
                    fullWidth
                    label="الاسم"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="البريد الإلكتروني"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="الموضوع"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="الرسالة"
                    name="message"
                    multiline
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    required
                    margin="normal"
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    sx={{
                      mt: 3,
                      background: 'linear-gradient(135deg, #86B573 0%, #6A9A5A 100%)',
                      boxShadow: '0 4px 16px rgba(106,154,90,0.35)',
                      fontWeight: 600,
                      py: 1.5,
                      borderRadius: 3,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #6A9A5A 0%, #5A8A4A 100%)',
                        boxShadow: '0 6px 24px rgba(106,154,90,0.4)',
                      },
                    }}
                  >
                    إرسال الرسالة
                  </Button>
                </Box>
              </Paper>
            </Box>
          </Box>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
};

export default ContactPage;
