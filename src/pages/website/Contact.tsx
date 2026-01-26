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
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header />
      <Box sx={{ pt: 8, pb: 4 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" fontWeight="bold" textAlign="center" gutterBottom sx={{ mb: 6 }}>
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
              <Paper sx={{ p: 4, bgcolor: 'background.paper', height: '100%' }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
                  معلومات الاتصال
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <EmailIcon color="primary" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        البريد الإلكتروني
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {websiteContent.contact.customerService.email}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <PhoneIcon color="primary" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        الهاتف
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {websiteContent.contact.customerService.phone}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <WhatsAppIcon color="primary" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        واتساب
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {websiteContent.contact.customerService.whatsapp}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <AccessTimeIcon color="primary" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        ساعات العمل
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {websiteContent.contact.customerService.hours}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    للشكاوى والاقتراحات
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {websiteContent.contact.feedback.email}
                  </Typography>
                </Box>

                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    للشراكة التجارية
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {websiteContent.contact.business.email}
                  </Typography>
                </Box>
              </Paper>
            </Box>

            <Box>
              <Paper sx={{ p: 4, bgcolor: 'background.paper' }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
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
                    sx={{ mt: 3 }}
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
