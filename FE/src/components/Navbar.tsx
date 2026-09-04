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
import { Logout } from "@mui/icons-material";

import { useAuth } from "../contexts/AuthContext";

import { toast } from "react-toastify";

const Navbar = () => {
  const navigate = useNavigate();

  const location = useLocation();

  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [drawerOpen, setDrawerOpen] = useState(false);

  ///auth

  const { admin, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();

      toast.success("Đã đăng xuất");

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      console.error(error);
    }
  };
  ///

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
      label: "Nhân Viên",
      path: "/employees",
      icon: <BadgeIcon fontSize="small" />,
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
            <>
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

              {/* =============================================
                  ADMIN
              ============================================= */}

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",

                  gap: 1,

                  pl: 1.5,
                  ml: 0.5,

                  borderLeft: "1px solid",

                  borderColor: "divider",
                }}
              >
                <Box
                  sx={{
                    textAlign: "right",

                    maxWidth: 130,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 700,

                      lineHeight: 1.2,

                      overflow: "hidden",

                      textOverflow: "ellipsis",

                      whiteSpace: "nowrap",
                    }}
                  >
                    {admin?.name || admin?.username || "Admin"}
                  </Typography>

                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.secondary",

                      fontSize: 10.5,
                    }}
                  >
                    Quản trị viên
                  </Typography>
                </Box>

                {/* DARK MODE */}

                <ThemeToggleButton />

                {/* LOGOUT */}

                <Tooltip title="Đăng xuất">
                  <IconButton
                    onClick={handleLogout}
                    sx={{
                      width: 40,
                      height: 40,

                      border: "1px solid",

                      borderColor: "divider",

                      color: "error.main",

                      "&:hover": {
                        backgroundColor: alpha(theme.palette.error.main, 0.08),

                        borderColor: alpha(theme.palette.error.main, 0.35),
                      },
                    }}
                  >
                    <Logout fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </>
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

              display: "flex",
              flexDirection: "column",

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
            sx={{
              display: "block",

              px: 1.5,
              mb: 1,

              fontWeight: 700,

              textTransform: "uppercase",

              letterSpacing: "0.7px",

              color: "text.secondary",
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
            ADMIN INFO MOBILE
        ================================================= */}

        <Box
          sx={{
            px: 1.5,
            pb: 2,
          }}
        >
          <Divider
            sx={{
              mb: 2,
            }}
          />

          <Typography
            variant="caption"
            sx={{
              display: "block",

              px: 1.5,
              mb: 1,

              fontWeight: 700,

              textTransform: "uppercase",

              letterSpacing: "0.7px",

              color: "text.secondary",
            }}
          >
            Tài khoản
          </Typography>

          <Box
            sx={{
              p: 1.5,

              borderRadius: 2.5,

              backgroundColor: alpha(
                theme.palette.primary.main,

                theme.palette.mode === "dark" ? 0.1 : 0.05
              ),
            }}
          >
            <Typography
              sx={{
                fontWeight: 700,

                color: "text.primary",
              }}
            >
              {admin?.name || admin?.username || "Admin"}
            </Typography>

            <Typography
              variant="caption"
              sx={{
                display: "block",

                mt: 0.2,
                mb: 1.5,

                color: "text.secondary",
              }}
            >
              @{admin?.username || "admin"}
            </Typography>

            <Button
              fullWidth
              variant="outlined"
              color="error"
              startIcon={<Logout />}
              onClick={handleLogout}
              sx={{
                borderRadius: 2,

                textTransform: "none",

                fontWeight: 600,
              }}
            >
              Đăng xuất
            </Button>
          </Box>
        </Box>

        {/* =================================================
            BOTTOM - THEME
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

              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                }}
              >
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
