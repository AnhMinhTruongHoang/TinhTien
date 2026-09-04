import { useState, type FormEvent } from "react";

import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import {
  LockOutlined,
  PersonOutlineOutlined,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";

import { Navigate, useLocation, useNavigate } from "react-router-dom";

import { toast } from "react-toastify";

import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const navigate = useNavigate();
  const location = useLocation();

  const { login, isAuthenticated, loading: authLoading } = useAuth();

  const [username, setUsername] = useState("");

  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  // =====================================================
  // ĐÃ LOGIN
  // =====================================================

  if (!authLoading && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!username.trim() || !password) {
      toast.warning("Vui lòng nhập tài khoản và mật khẩu");

      return;
    }

    try {
      setSubmitting(true);

      await login(username.trim(), password);

      toast.success("Đăng nhập thành công");

      const state = location.state as {
        from?: {
          pathname?: string;
        };
      } | null;

      const from = state?.from?.pathname || "/";

      navigate(from, {
        replace: true,
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Đăng nhập thất bại"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <Box
      sx={{
        minHeight: "100dvh",

        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        px: 2,
        py: 4,

        background:
          theme.palette.mode === "dark"
            ? "linear-gradient(135deg, #0f172a 0%, #111827 45%, #172554 100%)"
            : "linear-gradient(135deg, #eff6ff 0%, #f8fafc 45%, #ecfdf5 100%)",
      }}
    >
      <Paper
        elevation={theme.palette.mode === "dark" ? 2 : 8}
        sx={{
          width: "100%",
          maxWidth: 440,

          p: isMobile ? 3 : 4,

          borderRadius: 4,

          border: "1px solid",
          borderColor: "divider",
        }}
      >
        {/* ICON */}

        <Box
          sx={{
            width: 64,
            height: 64,

            mx: "auto",
            mb: 2,

            borderRadius: "50%",

            display: "flex",
            alignItems: "center",
            justifyContent: "center",

            bgcolor: "primary.main",
            color: "primary.contrastText",
          }}
        >
          <LockOutlined
            sx={{
              fontSize: 32,
            }}
          />
        </Box>

        {/* TITLE */}

        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            textAlign: "center",
          }}
        >
          Đăng Nhập Hệ Thống
        </Typography>

        <Typography
          sx={{
            mt: 1,
            mb: 0.5,

            textAlign: "center",
            color: "text.secondary",
          }}
        >
          Cơ sở giết mổ gia súc, gia cầm
        </Typography>

        <Typography
          sx={{
            mb: 4,

            textAlign: "center",

            color: "primary.main",

            fontWeight: 700,
          }}
        >
          Hoàng Thị Liêm
        </Typography>

        {/* FORM */}

        <Box component="form" onSubmit={handleSubmit}>
          {/* USERNAME */}

          <TextField
            fullWidth
            label="Tài khoản"
            value={username}
            autoComplete="username"
            disabled={submitting}
            onChange={(e) => setUsername(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutlineOutlined />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              mb: 2,
            }}
          />

          {/* PASSWORD */}

          <TextField
            fullWidth
            type={showPassword ? "text" : "password"}
            label="Mật khẩu"
            value={password}
            autoComplete="current-password"
            disabled={submitting}
            onChange={(e) => setPassword(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined />
                  </InputAdornment>
                ),

                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      type="button"
                      edge="end"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              mb: 3,
            }}
          />

          {/* LOGIN BUTTON */}

          <Button
            fullWidth
            size="large"
            variant="contained"
            type="submit"
            disabled={submitting}
            sx={{
              minHeight: 48,
              borderRadius: 2,
              fontWeight: 700,
            }}
          >
            {submitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Đăng Nhập"
            )}
          </Button>
        </Box>

        <Typography
          variant="caption"
          sx={{
            display: "block",
            mt: 3,

            textAlign: "center",
            color: "text.secondary",
          }}
        >
          Hệ thống quản lý nội bộ
        </Typography>
      </Paper>
    </Box>
  );
}
