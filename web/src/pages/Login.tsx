import React, { useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

type LoginFormValues = {
  email: string;
  password: string;
  rememberMe: boolean;
};

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setError(null);
    try {
      await login({
        email: values.email,
        password: values.password,
      });
      navigate('/dashboard', { replace: true });
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'حدث خطأ أثناء تسجيل الدخول (Mock)'
      );
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        px: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          py: 5,
          px: { xs: 3, sm: 4.5 },
          width: '100%',
          maxWidth: 460,
          borderRadius: 3,
          bgcolor: '#FFFFFF',
          border: '1px solid #B1C0B1',
          boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
        }}
      >
        <Typography
          variant="h5"
          mb={1}
          fontWeight={800}
          textAlign="center"
          sx={{
            background: 'linear-gradient(135deg, #86B573 0%, #6A9A5A 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          لوحة تحكم سيرفي
        </Typography>
        <Typography
          variant="body1"
          mb={3.5}
          sx={{ color: '#5A6A5A' }}
          textAlign="center"
        >
          من فضلك سجّل دخولك لمتابعة إدارة النظام
        </Typography>

        {error && (
          <Typography variant="body2" color="error" mb={2} textAlign="center">
            {error}
          </Typography>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <TextField
            label="البريد الإلكتروني"
            type="email"
            fullWidth
            dir="rtl"
            variant="outlined"
            InputLabelProps={{ sx: { color: '#5A6A5A' } }}
            InputProps={{
              sx: {
                color: '#1A2E1A',
                bgcolor: '#FFFFFF',
                '& fieldset': { borderColor: '#B1C0B1' },
                '&:hover fieldset': { borderColor: '#86B573' },
              },
            }}
            {...register('email')}
          />
          <TextField
            label="كلمة المرور"
            type="password"
            fullWidth
            dir="rtl"
            variant="outlined"
            InputLabelProps={{ sx: { color: '#5A6A5A' } }}
            InputProps={{
              sx: {
                color: '#1A2E1A',
                bgcolor: '#FFFFFF',
                '& fieldset': { borderColor: '#B1C0B1' },
                '&:hover fieldset': { borderColor: '#86B573' },
              },
            }}
            {...register('password')}
          />
          <FormControlLabel
            control={<Checkbox {...register('rememberMe')} />}
            label="تذكّرني"
            sx={{ mr: 0, ml: 'auto' }}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isSubmitting}
            sx={{
              mt: 1.5,
              py: 1.25,
              fontWeight: 600,
              fontSize: '0.95rem',
              borderRadius: 999,
              boxShadow: '0 10px 25px rgba(134,181,115,0.35)',
            }}
          >
            {isSubmitting ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginPage;

