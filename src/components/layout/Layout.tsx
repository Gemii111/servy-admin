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
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        <Box
          sx={{
            maxWidth: 1440,
            mx: 'auto',
            px: 3, // 24px - consistent across all breakpoints
            py: 3, // 24px - consistent vertical spacing
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;


