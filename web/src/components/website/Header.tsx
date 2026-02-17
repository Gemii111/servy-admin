import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useScrollTrigger,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { Link, useNavigate } from 'react-router-dom';
import { websiteContent } from '../../lib/content';

const Header: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
  });

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navItems = [
    { label: 'الرئيسية', path: '/' },
    { label: 'التطبيقات', path: '/#apps' },
    { label: 'الأسئلة الشائعة', path: '/faq' },
    { label: 'اتصل بنا', path: '/contact' },
  ];

  const drawer = (
    <Box sx={{ width: 280, pt: 2, bgcolor: 'background.paper', height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, mb: 2 }}>
        <Typography
          variant="h6"
          fontWeight="bold"
          sx={{
            background: 'linear-gradient(135deg, #86B573 0%, #6A9A5A 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {websiteContent.appNameAr}
        </Typography>
        <IconButton onClick={handleDrawerToggle}>
          <CloseIcon />
        </IconButton>
      </Box>
      <List>
        {navItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
              sx={{
                borderRadius: 2,
                mx: 1,
                mb: 0.5,
                '&:hover': {
                  bgcolor: 'rgba(134,181,115,0.15)',
                },
              }}
            >
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => {
              navigate('/login');
              setMobileOpen(false);
            }}
            sx={{
              mx: 1,
              mt: 1,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #86B573 0%, #6A9A5A 100%)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(135deg, #6A9A5A 0%, #5A8A4A 100%)',
              },
            }}
          >
            <ListItemText primary="تسجيل الدخول" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          bgcolor: trigger ? 'rgba(255, 255, 255, 0.98)' : 'transparent',
          backdropFilter: trigger ? 'blur(20px)' : 'none',
          boxShadow: trigger ? '0 4px 20px rgba(0,0,0,0.1)' : 0,
          transition: 'all 0.3s ease',
          borderBottom: trigger ? '1px solid rgba(0,0,0,0.1)' : 'none',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', py: 1.5 }}>
          <Typography
            variant="h5"
            component={Link}
            to="/"
            sx={{
              fontWeight: 900,
              background: 'linear-gradient(135deg, #86B573 0%, #6A9A5A 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textDecoration: 'none',
              fontSize: { xs: '1.5rem', md: '1.75rem' },
            }}
          >
            {websiteContent.appNameAr}
          </Typography>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, alignItems: 'center' }}>
            {navItems.map((item) => (
              <Button
                key={item.label}
                color="inherit"
                onClick={() => navigate(item.path)}
                sx={{
                  fontWeight: 500,
                  fontSize: '0.95rem',
                  px: 2,
                  borderRadius: 2,
                  color: trigger ? 'text.primary' : 'white',
                  '&:hover': {
                    bgcolor: 'rgba(134,181,115,0.2)',
                    color: trigger ? '#86B573' : 'white',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                {item.label}
              </Button>
            ))}
            <Button
              variant="contained"
              onClick={() => navigate('/login')}
              sx={{
                borderRadius: 3,
                px: 3,
                py: 1,
                background: 'linear-gradient(135deg, #86B573 0%, #6A9A5A 100%)',
                boxShadow: '0 4px 16px rgba(106,154,90,0.35)',
                fontWeight: 600,
                color: 'white',
                '&:hover': {
                  background: 'linear-gradient(135deg, #6A9A5A 0%, #5A8A4A 100%)',
                  boxShadow: '0 6px 24px rgba(106,154,90,0.4)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              تسجيل الدخول
            </Button>
          </Box>

          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{
              display: { md: 'none' },
              color: trigger ? 'text.primary' : 'white',
            }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 280,
            bgcolor: 'background.paper',
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Header;
