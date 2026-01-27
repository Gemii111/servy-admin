import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
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
              mb: 6,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
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
              <Paper sx={{ p: 4, bgcolor: 'white', height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderRadius: 4 }}>
                <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 3, color: '#1A1A1A' }}>
                  معلومات الاتصال
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <EmailIcon sx={{ color: '#667eea' }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: '#6B7280' }}>
                        البريد الإلكتروني
                      </Typography>
                      <Typography variant="body1" fontWeight={600} sx={{ color: '#1A1A1A', direction: 'ltr' }}>
                        {renderMixedText(websiteContent.contact.customerService.email)}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <PhoneIcon sx={{ color: '#667eea' }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: '#6B7280' }}>
                        الهاتف
                      </Typography>
                      <Typography variant="body1" fontWeight={600} sx={{ color: '#1A1A1A', direction: 'ltr' }}>
                        {renderMixedText(websiteContent.contact.customerService.phone)}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <WhatsAppIcon sx={{ color: '#667eea' }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: '#6B7280' }}>
                        واتساب
                      </Typography>
                      <Typography variant="body1" fontWeight={600} sx={{ color: '#1A1A1A', direction: 'ltr' }}>
                        {renderMixedText(websiteContent.contact.customerService.whatsapp)}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <AccessTimeIcon sx={{ color: '#667eea' }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: '#6B7280' }}>
                        ساعات العمل
                      </Typography>
                      <Typography variant="body1" fontWeight={600} sx={{ color: '#1A1A1A', direction: 'ltr' }}>
                        {renderMixedText(websiteContent.contact.customerService.hours)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: '#1A1A1A', direction: 'ltr' }}>
                    للشكاوى والاقتراحات
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6B7280', direction: 'ltr' }}>
                    {renderMixedText(websiteContent.contact.feedback.email)}
                  </Typography>
                </Box>

                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: '#1A1A1A', direction: 'ltr' }}>
                    للشراكة التجارية
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6B7280', direction: 'ltr' }}>
                    {renderMixedText(websiteContent.contact.business.email)}
                  </Typography>
                </Box>
              </Paper>
            </Box>

            <Box>
              <Paper sx={{ p: 4, bgcolor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderRadius: 4 }}>
                <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 3, color: '#1A1A1A' }}>
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
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      boxShadow: '0 4px 16px rgba(102,126,234,0.4)',
                      fontWeight: 600,
                      py: 1.5,
                      borderRadius: 3,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5568d3 0%, #6a3d8f 100%)',
                        boxShadow: '0 6px 24px rgba(102,126,234,0.5)',
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
