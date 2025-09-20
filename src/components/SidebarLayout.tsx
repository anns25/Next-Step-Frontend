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
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import WorkIcon from "@mui/icons-material/Work";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BusinessIcon from "@mui/icons-material/Business";
import EventIcon from "@mui/icons-material/Event";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";

const drawerWidth = 240;
const collapsedWidth = 64;

const menuItems = [
  { text: "Dashboard", icon: <DashboardIcon /> },
  { text: "Find Jobs", icon: <WorkIcon /> },
  { text: "My Applications", icon: <WorkIcon /> },
  { text: "Saved Jobs", icon: <BookmarkIcon /> },
  { text: "Companies", icon: <BusinessIcon /> },
  { text: "Interviews", icon: <EventIcon /> },
  { text: "Job Alerts", icon: <NotificationsIcon /> },
  { text: "Profile", icon: <PersonIcon /> },
  { text: "Settings", icon: <SettingsIcon /> },
];

const SidebarLayout = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);

  return (
    <Box sx={{ display: "flex" }}>
      {/* Sidebar */}
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

            // 🔥 Glassmorphism
            background: "rgba(255, 255, 255, 0.12)", // slightly lighter
            backdropFilter: "blur(18px) saturate(180%)",
            WebkitBackdropFilter: "blur(18px) saturate(180%)",
            border: "1px solid rgba(255, 255, 255, 0.2)", // frosted border
            boxShadow: "4px 0 20px rgba(20,30,60,0.12)",
          },
        }}
      >

        {/* Logo / App Name */}
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
            <Typography
              variant="h6"
              fontWeight="bold"
              color="primary"
              sx={{ ml: 1 }}
            >
              NextStep
            </Typography>
          )}
        </Toolbar>

        <Divider sx={{ opacity: 0.4 }} />

        {/* Menu Items */}
        <List>
          {menuItems.map((item, idx) => (
            <ListItem key={idx} disablePadding sx={{ display: "block" }}>
              <ListItemButton
                sx={{
                  minHeight: 48,
                  justifyContent: open ? "initial" : "center",
                  px: 2.5,
                  borderRadius: 2,
                  mx: 1,
                  my: 0.5,
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
                {open && <ListItemText primary={item.text} />}
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider sx={{ opacity: 0.4, mt: "auto" }} />

        {/* Bottom Sign Out */}
        <Box mt="auto" p={1}>
          <ListItem disablePadding sx={{ display: "block" }}>
            <ListItemButton
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
              {open && (
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
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          transition: "margin-left 0.3s ease",
          ml: open ? `${drawerWidth}px` : `${collapsedWidth}px`,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default SidebarLayout;
