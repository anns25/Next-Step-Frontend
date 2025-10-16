// "use client";

// import React, { useState } from 'react';
// import {
//   Box,
//   Drawer,
//   AppBar,
//   Toolbar,
//   List,
//   Typography,
//   Divider,
//   IconButton,
//   ListItem,
//   ListItemButton,
//   ListItemIcon,
//   ListItemText,
//   Avatar,
//   Menu,
//   MenuItem,
//   useTheme,
//   useMediaQuery,
//   Badge,
// } from '@mui/material';
// import {
//   Menu as MenuIcon,
//   Dashboard as DashboardIcon,
//   Business as BusinessIcon,
//   Work as WorkIcon,
//   People as PeopleIcon,
//   Assignment as AssignmentIcon,
//   Notifications as NotificationsIcon,
//   Settings as SettingsIcon,
//   Logout as LogoutIcon,
//   ChevronLeft as ChevronLeftIcon,
//   Analytics as AnalyticsIcon,
//   Email as EmailIcon,
// } from '@mui/icons-material';
// import { useAuth } from '@/contexts/authContext';
// import { useRouter } from 'next/navigation';

// const drawerWidth = 240;

// interface AdminLayoutProps {
//   children: React.ReactNode;
// }

// const menuItems = [
//   { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
//   { text: 'Companies', icon: <BusinessIcon />, path: '/admin/companies' },
//   { text: 'Jobs', icon: <WorkIcon />, path: '/admin/jobs' },
//   { text: 'Users', icon: <PeopleIcon />, path: '/admin/users' },
//   { text: 'Applications', icon: <AssignmentIcon />, path: '/admin/applications' },
//   { text: 'Analytics', icon: <AnalyticsIcon />, path: '/admin/analytics' },
//   { text: 'Notifications', icon: <NotificationsIcon />, path: '/admin/notifications' },
//   { text: 'Settings', icon: <SettingsIcon />, path: '/admin/settings' },
// ];

// export default function AdminLayout({ children }: AdminLayoutProps) {
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down('md'));
//   const [mobileOpen, setMobileOpen] = useState(false);
//   const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
//   const { user, logout } = useAuth();
//   const router = useRouter();

//   const handleDrawerToggle = () => {
//     setMobileOpen(!mobileOpen);
//   };

//   const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
//     setAnchorEl(event.currentTarget);
//   };

//   const handleProfileMenuClose = () => {
//     setAnchorEl(null);
//   };

//   const handleLogout = async () => {
//     await logout();
//     handleProfileMenuClose();
//   };

//   const drawer = (
//     <Box>
//       <Toolbar
//         sx={{
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'space-between',
//           px: 2,
//           py: 1,
//           backgroundColor: theme.palette.primary.main,
//           color: 'white',
//         }}
//       >
//         <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600 }}>
//           Admin Panel
//         </Typography>
//         {isMobile && (
//           <IconButton
//             color="inherit"
//             aria-label="close drawer"
//             onClick={handleDrawerToggle}
//             edge="start"
//           >
//             <ChevronLeftIcon />
//           </IconButton>
//         )}
//       </Toolbar>
//       <Divider />
//       <List sx={{ px: 1, py: 2 }}>
//         {menuItems.map((item) => (
//           <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
//             <ListItemButton
//               onClick={() => {
//                 router.push(item.path);
//                 if (isMobile) setMobileOpen(false);
//               }}
//               sx={{
//                 borderRadius: 2,
//                 '&:hover': {
//                   backgroundColor: theme.palette.primary.light + '20',
//                 },
//                 '&.Mui-selected': {
//                   backgroundColor: theme.palette.primary.main + '20',
//                   '&:hover': {
//                     backgroundColor: theme.palette.primary.main + '30',
//                   },
//                 },
//               }}
//             >
//               <ListItemIcon
//                 sx={{
//                   minWidth: 40,
//                   color: theme.palette.text.secondary,
//                 }}
//               >
//                 {item.icon}
//               </ListItemIcon>
//               <ListItemText
//                 primary={item.text}
//                 primaryTypographyProps={{
//                   fontSize: '0.9rem',
//                   fontWeight: 500,
//                 }}
//               />
//             </ListItemButton>
//           </ListItem>
//         ))}
//       </List>
//     </Box>
//   );

//   return (
//     <Box sx={{ display: 'flex' }}>
//       <AppBar
//         position="fixed"
//         sx={{
//           width: { md: `calc(100% - ${drawerWidth}px)` },
//           ml: { md: `${drawerWidth}px` },
//           backgroundColor: 'white',
//           color: theme.palette.text.primary,
//           boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
//         }}
//       >
//         <Toolbar>
//           <IconButton
//             color="inherit"
//             aria-label="open drawer"
//             edge="start"
//             onClick={handleDrawerToggle}
//             sx={{ mr: 2, display: { md: 'none' } }}
//           >
//             <MenuIcon />
//           </IconButton>

//           <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
//             Welcome back, {user?.firstName}
//           </Typography>

//           <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//             <IconButton color="inherit">
//               <Badge badgeContent={4} color="error">
//                 <NotificationsIcon />
//               </Badge>
//             </IconButton>

//             <IconButton
//               onClick={handleProfileMenuOpen}
//               sx={{ p: 0 }}
//             >
//               <Avatar
//                 src={user?.profilePicture}
//                 alt={user?.firstName}
//                 sx={{ width: 32, height: 32 }}
//               />
//             </IconButton>
//           </Box>

//           <Menu
//             anchorEl={anchorEl}
//             open={Boolean(anchorEl)}
//             onClose={handleProfileMenuClose}
//             onClick={handleProfileMenuClose}
//             PaperProps={{
//               elevation: 0,
//               sx: {
//                 overflow: 'visible',
//                 filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
//                 mt: 1.5,
//                 '& .MuiAvatar-root': {
//                   width: 32,
//                   height: 32,
//                   ml: -0.5,
//                   mr: 1,
//                 },
//                 '&:before': {
//                   content: '""',
//                   display: 'block',
//                   position: 'absolute',
//                   top: 0,
//                   right: 14,
//                   width: 10,
//                   height: 10,
//                   bgcolor: 'background.paper',
//                   transform: 'translateY(-50%) rotate(45deg)',
//                   zIndex: 0,
//                 },
//               },
//             }}
//             transformOrigin={{ horizontal: 'right', vertical: 'top' }}
//             anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
//           >
//             <MenuItem onClick={() => router.push('/admin/profile')}>
//               <Avatar src={user?.profilePicture} /> Profile
//             </MenuItem>
//             <MenuItem onClick={() => router.push('/admin/settings')}>
//               <SettingsIcon sx={{ mr: 1 }} /> Settings
//             </MenuItem>
//             <Divider />
//             <MenuItem onClick={handleLogout}>
//               <LogoutIcon sx={{ mr: 1 }} /> Logout
//             </MenuItem>
//           </Menu>
//         </Toolbar>
//       </AppBar>

//       <Box
//         component="nav"
//         sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
//       >
//         <Drawer
//           variant="temporary"
//           open={mobileOpen}
//           onClose={handleDrawerToggle}
//           ModalProps={{
//             keepMounted: true,
//           }}
//           sx={{
//             display: { xs: 'block', md: 'none' },
//             '& .MuiDrawer-paper': {
//               boxSizing: 'border-box',
//               width: drawerWidth,
//             },
//           }}
//         >
//           {drawer}
//         </Drawer>
//         <Drawer
//           variant="permanent"
//           sx={{
//             display: { xs: 'none', md: 'block' },
//             '& .MuiDrawer-paper': {
//               boxSizing: 'border-box',
//               width: drawerWidth,
//             },
//           }}
//           open
//         >
//           {drawer}
//         </Drawer>
//       </Box>

//       <Box
//         component="main"
//         sx={{
//           flexGrow: 1,
//           p: 3,
//           width: { md: `calc(100% - ${drawerWidth}px)` },
//           mt: 8,
//           backgroundColor: theme.palette.background.default,
//           minHeight: '100vh',
//         }}
//       >
//         {children}
//       </Box>
//     </Box>
//   );
// }

"use client";

import React, { useState } from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
  useMediaQuery,
  IconButton,
  AppBar,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import WorkIcon from "@mui/icons-material/Work";
import BusinessIcon from "@mui/icons-material/Business";
import EventIcon from "@mui/icons-material/Event";
import PersonIcon from "@mui/icons-material/Person";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import theme from "@/theme";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/authContext";
import { Description, People } from "@mui/icons-material";


const drawerWidth = 240;
const collapsedWidth = 64;

const menuItems = [
  { text: "Dashboard", icon: <DashboardIcon />, link: "/admin/dashboard" },
  { text: "Companies", icon: <BusinessIcon />, link: "/admin/companies" },
  { text: "Users", icon: <People />, link: "/admin/users" },
  { text: "Jobs", icon: <WorkIcon />, link: "/admin/jobs" },
  { text: "Applications", icon: <Description />, link: "/admin/applications" },
  { text: "Interviews", icon: <EventIcon />, link: "/admin/interviews" },
  { text: "Profile", icon: <PersonIcon />, link: "/admin/profile" },
];




const AdminSidebarLayout = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const pathname = usePathname();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  }

  // Drawer content (shared between desktop + mobile)
  // Drawer content (shared between desktop + mobile)
  const drawerContent = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: open ? "flex-start" : "center",
          px: 2,
        }}
      >
        <Box
          component="img"
          src="/NextStepLogo.png"
          alt="NextStep"
          sx={{ width: 40, height: 40, borderRadius: "8px" }}
        />
        {open && (
          <Box display="flex" alignItems="center" ml={1}>
            <Typography variant="h6" fontWeight="bold" color="text.primary">
              Next
            </Typography>
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{ color: "#c5ccd1", ml: 0.3 }}
            >
              Step
            </Typography>
          </Box>
        )}
      </Toolbar>

      <Divider sx={{ opacity: 0.4 }} />

      <List sx={{ flexGrow: 1 }}>
        {menuItems.map((item, idx) => (
          <ListItem key={idx} disablePadding sx={{ display: "block" }}>
            <Link href={item.link} style={{ textDecoration: "none", color: "inherit" }}>
              <ListItemButton
                sx={{
                  minHeight: 48,
                  justifyContent: open ? "initial" : "center",
                  px: 2.5,
                  borderRadius: 2,
                  mx: 1,
                  my: 0.5,
                  background: pathname === item.link ? "rgba(255,255,255,0.25)" : "transparent",
                  "&:hover": {
                    background: "rgba(255,255,255,0.25)",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 2 : "auto",
                    justifyContent: "center",
                    color: "text.primary",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {(open || isXs) && <ListItemText primary={item.text} />}
              </ListItemButton>
            </Link>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ opacity: 0.4 }} />

      {/* Sign Out at bottom */}
      <ListItem disablePadding sx={{ display: "block" }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            minHeight: 48,
            justifyContent: open ? "initial" : "center",
            px: 2.5,
            borderRadius: 2,
            "&:hover": {
              background: "rgba(255,0,0,0.1)",
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: open ? 2 : "auto",
              justifyContent: "center",
              color: "#b71c1c",
            }}
          >
            <ExitToAppIcon />
          </ListItemIcon>

          {(open || isXs) && (
            <ListItemText
              primary="Sign Out"
              primaryTypographyProps={{
                fontWeight: 600,
                sx: { color: "#b71c1c" },
              }}
            />
          )}
        </ListItemButton>
      </ListItem>
    </Box>
  );


  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        backgroundImage: "url('/office.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0,0,0,0.4)",
          zIndex: 0,
        },
      }}
    >
      {/* MOBILE: Hamburger + Temporary Drawer */}
      {isXs ? (
        <>
          <AppBar
            position="fixed"
            sx={{
              background: "rgba(255,255,255,0.12)",
              backdropFilter: "blur(18px) saturate(180%)",
              WebkitBackdropFilter: "blur(18px) saturate(180%)",
              zIndex: theme.zIndex.drawer + 1,
            }}
          >
            <Toolbar>
              <IconButton
                edge="start"
                color="inherit"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                <MenuIcon />
              </IconButton>
              {/* <Box
                component="img"
                src="/NextStepLogo.png"
                alt="NextStep"
                sx={{ width: 40, height: 40, borderRadius: "8px" }}
              /> */}
              <Box display="flex" alignItems="center" ml={1}>
                <Typography variant="h6" fontWeight="bold" color="text.primary">
                  Next
                </Typography>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{ color: "#fff", ml: 0.3 }}
                >
                  Step
                </Typography>
              </Box>
            </Toolbar>
          </AppBar>

          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{
              "& .MuiDrawer-paper": {
                width: drawerWidth,
                boxSizing: "border-box",
                background: "rgba(255,255,255,0.12)",
                backdropFilter: "blur(18px) saturate(180%)",
                WebkitBackdropFilter: "blur(18px) saturate(180%)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
              },
            }}
          >
            {drawerContent}
          </Drawer>
        </>
      ) : (
        // DESKTOP: Collapsible Permanent Drawer
        <Drawer
          variant="permanent"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          sx={{
            width: open ? drawerWidth : collapsedWidth,
            flexShrink: 0,
            whiteSpace: "nowrap",
            transition: "width 0.3s ease",
            "& .MuiDrawer-paper": {
              width: open ? drawerWidth : collapsedWidth,
              boxSizing: "border-box",
              borderRight: "none",
              overflowX: "hidden",
              transition: "width 0.3s ease",
              background: "rgba(255, 255, 255, 0.12)",
              backdropFilter: "blur(18px) saturate(180%)",
              WebkitBackdropFilter: "blur(18px) saturate(180%)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              boxShadow: "4px 0 20px rgba(20,30,60,0.12)",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          transition: "margin-left 0.3s ease",
          ml: "5px",
          mt: isXs ? "64px" : 0, // push content below AppBar on mobile
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default AdminSidebarLayout;
