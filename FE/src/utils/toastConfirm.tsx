import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import {
  CheckCircleOutlined,
  DeleteOutlineOutlined,
  HelpOutlineOutlined,
  WarningAmber,
} from "@mui/icons-material";

import { useEffect, useState, type ReactNode } from "react";

interface ToastConfirmOptions {
  title?: string;

  message: ReactNode;

  confirmText?: string;

  cancelText?: string;

  confirmColor?: "primary" | "success" | "warning" | "error";
}

interface ConfirmState extends ToastConfirmOptions {
  resolve: (value: boolean) => void;
}

const EVENT_NAME = "app:confirm-dialog";

// =====================================================
// HÀM GỌI TỪ BẤT KỲ FILE NÀO
// =====================================================

export const toastConfirm = (
  options: ToastConfirmOptions
): Promise<boolean> => {
  return new Promise((resolve) => {
    window.dispatchEvent(
      new CustomEvent(EVENT_NAME, {
        detail: {
          ...options,
          resolve,
        },
      })
    );
  });
};

// =====================================================
// HOST DIALOG
// Render 1 lần ở main.tsx
// =====================================================

export const ToastConfirmHost = () => {
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);

  useEffect(() => {
    const handleConfirm = (event: Event) => {
      const customEvent = event as CustomEvent<ConfirmState>;

      setConfirmState(customEvent.detail);
    };

    window.addEventListener(EVENT_NAME, handleConfirm);

    return () => {
      window.removeEventListener(EVENT_NAME, handleConfirm);
    };
  }, []);

  const finish = (value: boolean) => {
    if (!confirmState) {
      return;
    }

    confirmState.resolve(value);

    setConfirmState(null);
  };

  const confirmColor = confirmState?.confirmColor ?? "primary";

  const renderIcon = () => {
    switch (confirmColor) {
      case "error":
        return (
          <DeleteOutlineOutlined
            sx={{
              fontSize: 34,
            }}
          />
        );

      case "warning":
        return (
          <WarningAmber
            sx={{
              fontSize: 34,
            }}
          />
        );

      case "success":
        return (
          <CheckCircleOutlined
            sx={{
              fontSize: 34,
            }}
          />
        );

      default:
        return (
          <HelpOutlineOutlined
            sx={{
              fontSize: 34,
            }}
          />
        );
    }
  };

  return (
    <Dialog
      open={Boolean(confirmState)}
      onClose={() => finish(false)}
      fullWidth
      maxWidth="sm"
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: "blur(3px)",

            backgroundColor: "rgba(0,0,0,0.58)",
          },
        },

        paper: {
          sx: {
            width: isMobile ? "calc(100% - 32px)" : "100%",

            maxWidth: 480,

            m: isMobile ? 2 : 3,

            borderRadius: 3,

            backgroundImage: "none",

            overflow: "hidden",
          },
        },
      }}
    >
      {/* ICON */}

      <Box
        sx={{
          pt: 3,

          display: "flex",

          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,

            borderRadius: "50%",

            display: "flex",

            alignItems: "center",

            justifyContent: "center",

            color: `${confirmColor}.main`,

            bgcolor: `${confirmColor}.main`,

            // tạo nền nhạt
            "& svg": {
              color: `${confirmColor}.main`,
            },

            backgroundColor:
              theme.palette.mode === "dark"
                ? "rgba(255,255,255,0.05)"
                : "rgba(0,0,0,0.035)",

            border: "1px solid",

            borderColor: `${confirmColor}.main`,
          }}
        >
          {renderIcon()}
        </Box>
      </Box>

      {/* TITLE */}

      <DialogTitle
        sx={{
          pt: 1.5,
          pb: 0.5,

          textAlign: "center",

          fontSize: {
            xs: 19,
            sm: 21,
          },

          fontWeight: 800,
        }}
      >
        {confirmState?.title ?? "Xác nhận"}
      </DialogTitle>

      {/* CONTENT */}

      <DialogContent
        sx={{
          pt: "12px !important",
          px: {
            xs: 2.5,
            sm: 3.5,
          },

          textAlign: "center",
        }}
      >
        <Box
          sx={{
            color: "text.secondary",

            "& > *": {
              maxWidth: "100%",
            },

            "& p": {
              lineHeight: 1.55,
            },
          }}
        >
          {confirmState?.message}
        </Box>
      </DialogContent>

      {/* BUTTON */}

      <DialogActions
        sx={{
          px: {
            xs: 2.5,
            sm: 3.5,
          },

          pt: 1,
          pb: 3,

          display: "grid",

          gridTemplateColumns: "1fr 1fr",

          gap: 1.5,
        }}
      >
        <Button
          fullWidth
          variant="outlined"
          color="inherit"
          onClick={() => finish(false)}
          sx={{
            minHeight: 44,

            borderRadius: 2,

            fontWeight: 700,

            m: "0 !important",
          }}
        >
          {confirmState?.cancelText ?? "Hủy"}
        </Button>

        <Button
          fullWidth
          variant="contained"
          color={confirmColor}
          onClick={() => finish(true)}
          sx={{
            minHeight: 44,

            borderRadius: 2,

            fontWeight: 800,

            m: "0 !important",
          }}
        >
          {confirmState?.confirmText ?? "Xác nhận"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
