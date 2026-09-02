import {
  AppBar,
  Toolbar,
  Button,
  Box,
  Typography,
  Drawer,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import SavingsIcon from "@mui/icons-material/Savings";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { useState } from "react";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const menuItems = [
    { label: "Bảng diều Khiển", path: "/" },
    { label: "Lô Động Vật", path: "/batches" },
    { label: "Chủ Động Vật", path: "/owners" },
    { label: "Loại Động Vật", path: "/animal-types" },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    setDrawerOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <AppBar position="sticky" sx={{ mb: 2 }}>
        <Toolbar>
          <SavingsIcon sx={{ mr: 2 }} />
          <Typography
            variant="h6"
            sx={{ flexGrow: 1, cursor: "pointer", fontWeight: "bold" }}
            onClick={() => handleNavigation("/")}
          >
            Tính Tiền
          </Typography>

          {/* Desktop Menu */}
          {!isMobile && (
            <Box sx={{ display: "flex", gap: 1 }}>
              {menuItems.map((item) => (
                <Button
                  key={item.path}
                  color="inherit"
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    fontWeight: isActive(item.path) ? "bold" : "normal",
                    borderBottom: isActive(item.path)
                      ? "2px solid white"
                      : "none",
                    pb: isActive(item.path) ? "6px" : "8px",
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          {/* Mobile Hamburger */}
          {isMobile && (
            <IconButton color="inherit" onClick={() => setDrawerOpen(true)}>
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          "& .MuiDrawer-paper": {
            width: 250,
          },
        }}
      >
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Menu
          </Typography>
          <IconButton onClick={() => setDrawerOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, p: 2 }}>
          {menuItems.map((item) => (
            <Button
              key={item.path}
              fullWidth
              onClick={() => handleNavigation(item.path)}
              sx={{
                justifyContent: "flex-start",
                fontWeight: isActive(item.path) ? "bold" : "normal",
                color: isActive(item.path) ? "#1976d2" : "inherit",
                backgroundColor: isActive(item.path)
                  ? "rgba(25, 118, 210, 0.1)"
                  : "transparent",
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;
