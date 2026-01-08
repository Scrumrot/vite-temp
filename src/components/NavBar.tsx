import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import PaletteIcon from "@mui/icons-material/Palette";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import CloseIcon from "@mui/icons-material/Close";
import { useAuth } from "../contexts/AuthContext";
import SquareButton from "./SquareButton";
import ThemeEditorForm from "./ThemeEditorForm";
import JulianClock from "./JulianClock";
import { navConfig } from "@/configs/navConfig.tsx";
import { Nav } from "@/components/Nav";

interface NavBarProps {
  title?: string;
}

export default function NavBar({ title = "Store Front" }: NavBarProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(
    null,
  );
  const [themeDrawerOpen, setThemeDrawerOpen] = useState(false);
  const profileMenuOpen = Boolean(profileAnchorEl);


  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileAnchorEl(null);
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    logout();
    navigate("/cac-login");
  };

  const handleThemes = () => {
    handleProfileMenuClose();
    setThemeDrawerOpen(true);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <>
      <Nav
        title={title}
        config={navConfig}
        rightContent={
          <>
            <JulianClock sx={{ mx: 1 }} />
            {user && (
              <Avatar
                onClick={handleAvatarClick}
                sx={{
                  cursor: "pointer",
                  bgcolor: "secondary.main",
                  width: 40,
                  height: 40,
                  fontSize: "1rem",
                  fontWeight: "bold",
                  "&:hover": {
                    opacity: 0.8,
                  },
                }}
              >
                {getInitials(user.firstName, user.lastName)}
              </Avatar>
            )}
            <Menu
              anchorEl={profileAnchorEl}
              open={profileMenuOpen}
              onClose={handleProfileMenuClose}
              onClick={handleProfileMenuClose}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              slotProps={{
                paper: {
                  sx: { minWidth: 220, mt: 1 },
                },
              }}
            >
              {user && (
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="subtitle2">
                    {user.firstName} {user.lastName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user.email}
                  </Typography>
                </Box>
              )}
              <Divider />
              <MenuItem onClick={handleProfileMenuClose}>
                <ListItemIcon>
                  <AccountCircleIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Account</ListItemText>
              </MenuItem>
              <Divider />
              <Typography
                variant="overline"
                sx={{
                  px: 2,
                  py: 0.5,
                  display: "block",
                  color: "text.secondary",
                }}
              >
                Personalization
              </Typography>
              <MenuItem onClick={handleThemes}>
                <ListItemIcon>
                  <PaletteIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Themes</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleProfileMenuClose}>
                <ListItemIcon>
                  <PhotoCameraIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Profile Picture</ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Logout</ListItemText>
              </MenuItem>
            </Menu>
          </>
        }
      />
      <Drawer
        anchor="right"
        open={themeDrawerOpen}
        onClose={() => setThemeDrawerOpen(false)}
        variant="persistent"
        sx={{
          "& .MuiDrawer-paper": {
            width: 400,
            p: 2,
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6">Theme Editor</Typography>
          <SquareButton
            icon={<CloseIcon />}
            label="Close"
            size="small"
            onClick={() => setThemeDrawerOpen(false)}
          />
        </Box>
        <ThemeEditorForm />
      </Drawer>
    </>
  );
}
