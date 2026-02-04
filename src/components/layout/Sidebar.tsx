import React from 'react';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material';
import logoImg from '../../assets/logo.png';
import DashboardIcon from '@mui/icons-material/SpaceDashboard';
import PeopleIcon from '@mui/icons-material/People';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CategoryIcon from '@mui/icons-material/Category';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';
import { useLocation, useNavigate } from 'react-router-dom';

const drawerWidth = 260;

type NavItem = {
  label: string;
  path: string;
  icon: React.ReactElement;
};

const navItems: NavItem[] = [
  { label: 'لوحة التحكم', path: '/dashboard', icon: <DashboardIcon /> },
  { label: 'المستخدمون', path: '/users', icon: <PeopleIcon /> },
  { label: 'المطاعم', path: '/restaurants', icon: <RestaurantIcon /> },
  { label: 'الطلبات', path: '/orders', icon: <ReceiptLongIcon /> },
  { label: 'الفئات', path: '/categories', icon: <CategoryIcon /> },
  { label: 'الكوبونات', path: '/coupons', icon: <LocalOfferIcon /> },
  { label: 'التقارير', path: '/reports', icon: <AssessmentIcon /> },
  { label: 'الإعدادات', path: '/settings', icon: <SettingsIcon /> },
];

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const content = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar
        sx={{
          px: 2,
          minHeight: 64,
          borderBottom: '1px solid #1F2933',
          bgcolor: '#020617',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            component="img"
            src={logoImg}
            alt="Souq"
            sx={{ width: 36, height: 36, borderRadius: 1, objectFit: 'contain' }}
          />
          <Box>
            <Typography
              variant="subtitle2"
              sx={{ color: '#9CA3AF', fontSize: 11, mb: 0.5 }}
            >
              لوحة الإدارة
            </Typography>
            <Typography
              variant="h6"
              sx={{ color: '#E5E7EB', fontWeight: 700, fontSize: 18 }}
            >
              Souq
            </Typography>
          </Box>
        </Box>
      </Toolbar>

      <List sx={{ flexGrow: 1, py: 1.5 }}>
        {navItems.map((item) => {
          const selected =
            item.path === '/dashboard'
              ? location.pathname === '/dashboard'
              : location.pathname.startsWith(item.path);

          return (
            <Box
              key={item.path}
              sx={{
                position: 'relative',
                mx: 1.5, // 12px - consistent horizontal margin
                mb: 0.5, // 4px - consistent vertical spacing between items
              }}
            >
              {selected && (
                <Box
                  sx={{
                    position: 'absolute',
                    left: 0,
                    top: 8,
                    bottom: 8,
                    width: 3,
                    borderRadius: 999,
                    bgcolor: 'primary.main',
                  }}
                />
              )}
              <ListItemButton
                selected={selected}
                onClick={() => {
                  navigate(item.path);
                  onClose();
                }}
                sx={{
                  pl: 3,
                  pr: 2,
                  py: 1.2,
                  borderRadius: 2,
                  bgcolor: selected ? 'rgba(30,64,175,0.15)' : 'transparent',
                  '&:hover': {
                    bgcolor: 'rgba(15,23,42,0.9)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: selected ? 'primary.main' : '#9CA3AF',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: 14,
                    color: selected ? '#E5E7EB' : '#9CA3AF',
                  }}
                />
              </ListItemButton>
            </Box>
          );
        })}
      </List>
    </Box>
  );

  return (
    <>
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: '#020617',
          },
        }}
      >
        {content}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: '#020617', // SidebarBg
            color: '#E5E7EB',
            borderInlineEnd: '1px solid #111827',
          },
        }}
        open
      >
        {content}
      </Drawer>
    </>
  );
};

export { drawerWidth };
export default Sidebar;


