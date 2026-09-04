import { useState } from "react";

import {
  alpha,
  AppBar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import { useLocation, useNavigate } from "react-router-dom";

import SavingsIcon from "@mui/icons-material/Savings";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import ChecklistIcon from "@mui/icons-material/Checklist";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import PetsIcon from "@mui/icons-material/Pets";
import BadgeIcon from "@mui/icons-material/Badge";
import ThemeToggleButton from "@/components/ThemeToggleButton";

const Navbar = () => {
  const navigate = useNavigate();

  const location = useLocation();

  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [drawerOpen, setDrawerOpen] = useState(false);

  // =====================================================
  // MENU
  // =====================================================

  const menuItems = [
    {
      label: "Bảng Điều Khiển",
      path: "/",
      icon: <DashboardRoundedIcon fontSize="small" />,
    },
    {
      label: "Nhật Ký",
      path: "/batches",
      icon: <ChecklistIcon fontSize="small" />,
    },
    {
      label: "Chủ Động Vật",
      path: "/owners",
      icon: <PeopleAltRoundedIcon fontSize="small" />,
    },
    {
      label: "Loại Động Vật",
      path: "/animal-types",
      icon: <PetsIcon fontSize="small" />,
    },
    {
      label: "Nhân Viên",
      path: "/employees",
      icon: (
        <BadgeIcon fontSize="small" />
      ),
    },
  ];

  // =====================================================
  // NAVIGATION
  // =====================================================

  const handleNavigation = (path: string) => {
    navigate(path);

    setDrawerOpen(false);
  };

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }

    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          mb: 3,

          color: "text.primary",

          backgroundColor:
            theme.palette.mode === "dark"
              ? alpha(theme.palette.background.paper, 0.88)
              : alpha("#ffffff", 0.92),

          backdropFilter: "blur(14px)",

          borderBottom: "1px solid",

          borderColor: "divider",
        }}
      >
        <Toolbar
          sx={{
            minHeight: {
              xs: 64,
              md: 72,
            },

            px: {
              xs: 2,
              md: 3,
            },

            maxWidth: 1500,

            width: "100%",

            mx: "auto",
          }}
        >
          {/* =================================================
              LOGO
          ================================================= */}

          <Box
            onClick={() => handleNavigation("/")}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.2,

              cursor: "pointer",

              flexShrink: 0,
            }}
          >
            <Box
              sx={{
                width: 42,
                height: 42,

                display: "flex",
                alignItems: "center",
                justifyContent: "center",

                borderRadius: 2.5,

                backgroundColor: alpha(
                  theme.palette.primary.main,
                  theme.palette.mode === "dark" ? 0.18 : 0.1
                ),

                color: "primary.main",
              }}
            >
              <SavingsIcon
                sx={{
                  fontSize: 27,
                }}
              />
            </Box>

            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,

                  lineHeight: 1.05,

                  letterSpacing: "-0.4px",

                  color: "text.primary",
                }}
              >
                Tính Tiền
              </Typography>

              {!isMobile && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    lineHeight: 1,
                    fontSize: 11,
                  }}
                >
                  Quản lý chi phí
                </Typography>
              )}
            </Box>
          </Box>

          {/* SPACE */}

          <Box
            sx={{
              flexGrow: 1,
            }}
          />

          {/* =================================================
              DESKTOP MENU
          ================================================= */}

          {!isMobile && (
            <Box
              sx={{
                display: "flex",

                alignItems: "center",

                gap: 0.5,

                p: 0.5,

                borderRadius: 3,

                backgroundColor: alpha(
                  theme.palette.text.primary,
                  theme.palette.mode === "dark" ? 0.035 : 0.025
                ),

                mr: 1.5,
              }}
            >
              {menuItems.map((item) => {
                const active = isActive(item.path);

                return (
                  <Button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    startIcon={item.icon}
                    sx={{
                      px: 1.7,
                      py: 0.9,

                      borderRadius: 2.2,

                      textTransform: "none",

                      whiteSpace: "nowrap",

                      fontSize: 14,

                      fontWeight: active ? 700 : 500,

                      color: active ? "primary.main" : "text.secondary",

                      backgroundColor: active
                        ? alpha(
                            theme.palette.primary.main,
                            theme.palette.mode === "dark" ? 0.16 : 0.09
                          )
                        : "transparent",

                      "&:hover": {
                        color: "primary.main",

                        backgroundColor: alpha(
                          theme.palette.primary.main,
                          theme.palette.mode === "dark" ? 0.13 : 0.07
                        ),
                      },

                      transition: "all 0.2s ease",
                    }}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </Box>
          )}

          {/* =================================================
              DARK MODE
          ================================================= */}

          {!isMobile && (
            <Box
              sx={{
                ml: 0.5,

                display: "flex",

                alignItems: "center",
              }}
            >
              <ThemeToggleButton />
            </Box>
          )}

          {/* =================================================
              MOBILE HAMBURGER
          ================================================= */}

          {isMobile && (
            <Tooltip title="Mở menu">
              <IconButton
                onClick={() => setDrawerOpen(true)}
                sx={{
                  ml: 1,

                  width: 42,
                  height: 42,

                  border: "1px solid",

                  borderColor: "divider",

                  color: "text.primary",
                }}
              >
                <MenuIcon />
              </IconButton>
            </Tooltip>
          )}
        </Toolbar>
      </AppBar>

      {/* =====================================================
          MOBILE DRAWER
      ===================================================== */}

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        slotProps={{
          paper: {
            sx: {
              width: {
                xs: "86vw",
                sm: 320,
              },

              maxWidth: 320,

              backgroundImage: "none",

              backgroundColor: "background.paper",
            },
          },
        }}
      >
        {/* =================================================
            DRAWER HEADER
        ================================================= */}

        <Box
          sx={{
            p: 2,

            display: "flex",

            justifyContent: "space-between",

            alignItems: "center",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.2,
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,

                borderRadius: 2,

                display: "flex",

                alignItems: "center",

                justifyContent: "center",

                backgroundColor: alpha(theme.palette.primary.main, 0.12),

                color: "primary.main",
              }}
            >
              <SavingsIcon />
            </Box>

            <Box>
              <Typography
                sx={{
                  fontWeight: 800,
                  lineHeight: 1.1,
                }}
              >
                Tính Tiền
              </Typography>

              <Typography variant="caption" color="text.secondary">
                Quản lý chi phí
              </Typography>
            </Box>
          </Box>

          <IconButton onClick={() => setDrawerOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider />

        {/* =================================================
            MENU
        ================================================= */}

        <Box
          sx={{
            px: 1.5,
            py: 2,
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: "block",

              px: 1.5,
              mb: 1,

              fontWeight: 700,

              textTransform: "uppercase",

              letterSpacing: "0.7px",
            }}
          >
            Menu
          </Typography>

          <Box
            sx={{
              display: "flex",

              flexDirection: "column",

              gap: 0.5,
            }}
          >
            {menuItems.map((item) => {
              const active = isActive(item.path);

              return (
                <Button
                  key={item.path}
                  fullWidth
                  startIcon={item.icon}
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    justifyContent: "flex-start",

                    textTransform: "none",

                    px: 1.5,
                    py: 1.2,

                    borderRadius: 2,

                    fontWeight: active ? 700 : 500,

                    color: active ? "primary.main" : "text.primary",

                    backgroundColor: active
                      ? alpha(
                          theme.palette.primary.main,
                          theme.palette.mode === "dark" ? 0.16 : 0.09
                        )
                      : "transparent",

                    "&:hover": {
                      backgroundColor: alpha(
                        theme.palette.primary.main,
                        theme.palette.mode === "dark" ? 0.13 : 0.07
                      ),
                    },
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Box>
        </Box>

        {/* =================================================
            BOTTOM
        ================================================= */}

        <Box
          sx={{
            mt: "auto",
          }}
        >
          <Divider />

          <Box
            sx={{
              p: 2,

              display: "flex",

              alignItems: "center",

              justifyContent: "space-between",
            }}
          >
            <Box>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                }}
              >
                Giao diện
              </Typography>

              <Typography variant="caption" color="text.secondary">
                Sáng / tối
              </Typography>
            </Box>

            <ThemeToggleButton />
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;
