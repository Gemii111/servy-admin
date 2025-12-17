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
        backgroundImage:
          'radial-gradient(circle at 10% 0, rgba(56,189,248,0.22) 0, transparent 55%), radial-gradient(circle at 90% 100%, rgba(129,140,248,0.25) 0, transparent 55%)',
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
          bgcolor: 'rgba(15,23,42,0.88)',
          border: '1px solid rgba(148,163,184,0.5)',
          boxShadow: '0 26px 70px rgba(15,23,42,0.95)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <Typography variant="h5" mb={1} fontWeight={800} textAlign="center" color="white">
          لوحة تحكم سيرفي
        </Typography>
        <Typography
          variant="body1"
          mb={3.5}
          color="rgba(148,163,184,0.95)"
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
            InputLabelProps={{ sx: { color: 'rgba(148,163,184,0.9)' } }}
            InputProps={{
              sx: {
                color: 'white',
                bgcolor: 'rgba(15,23,42,0.9)',
                '& fieldset': { borderColor: 'rgba(148,163,184,0.5)' },
                '&:hover fieldset': { borderColor: 'rgba(129,140,248,0.9)' },
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
            InputLabelProps={{ sx: { color: 'rgba(148,163,184,0.9)' } }}
            InputProps={{
              sx: {
                color: 'white',
                bgcolor: 'rgba(15,23,42,0.9)',
                '& fieldset': { borderColor: 'rgba(148,163,184,0.5)' },
                '&:hover fieldset': { borderColor: 'rgba(129,140,248,0.9)' },
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
              boxShadow: '0 14px 35px rgba(59,130,246,0.55)',
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

