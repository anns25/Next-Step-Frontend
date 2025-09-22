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
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BusinessIcon from "@mui/icons-material/Business";
import EventIcon from "@mui/icons-material/Event";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import theme from "@/theme";
import { SearchIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/authContext";

const drawerWidth = 240;
const collapsedWidth = 64;

const menuItems = [
  { text: "Dashboard", icon: <DashboardIcon />, link: "/dashboard" },
  { text: "Find Jobs", icon: <SearchIcon />, link: "/dashboard/jobs" },
  { text: "My Applications", icon: <WorkIcon />, link: "/dashboard/applications" },
  { text: "Saved Jobs", icon: <BookmarkIcon />, link: "/dashboard/saved" },
  { text: "Companies", icon: <BusinessIcon />, link: "/dashboard/companies" },
  { text: "Interviews", icon: <EventIcon />, link: "/dashboard/interviews" },
  { text: "Job Alerts", icon: <NotificationsIcon />, link: "/dashboard/alerts" },
  { text: "Profile", icon: <PersonIcon />, link: "/dashboard/profile" },
  { text: "Settings", icon: <SettingsIcon />, link: "/dashboard/settings" },
];




const SidebarLayout = ({ children }: { children: React.ReactNode }) => {
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
            }}
          >
            <ExitToAppIcon color="error" />
          </ListItemIcon>
          {(open || isXs) && (
            <ListItemText
              primary="Sign Out"
              primaryTypographyProps={{
                fontWeight: 600,
                color: "error.main",
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

export default SidebarLayout;
