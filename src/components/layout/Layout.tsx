import React from 'react';
import { Box, Toolbar } from '@mui/material';
import Sidebar, { drawerWidth } from './Sidebar';
import TopBar from './TopBar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  return (
    <Box sx={{ display: 'flex', bgcolor: 'background.default', minHeight: '100vh' }}>
      <TopBar onMenuClick={handleDrawerToggle} />
      <Sidebar mobileOpen={mobileOpen} onClose={handleDrawerToggle} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { xs: '100%', sm: `calc(100% - ${drawerWidth}px)` },
          transition: 'width 0.3s ease',
        }}
      >
        <Toolbar />
        <Box
          sx={{
            maxWidth: 1440,
            mx: 'auto',
            px: { xs: 1.5, sm: 2, md: 3 }, // Responsive padding: 12px mobile, 16px tablet, 24px desktop
            py: { xs: 2, sm: 2.5, md: 3 }, // Responsive vertical spacing
            width: '100%',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;


