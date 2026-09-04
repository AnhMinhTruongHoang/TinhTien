import { Box, Button, Typography } from "@mui/material";

import { toast } from "react-toastify";

import type { ReactNode } from "react";

interface ToastConfirmOptions {
  title?: string;

  message: ReactNode;

  confirmText?: string;

  cancelText?: string;

  confirmColor?: "primary" | "success" | "warning" | "error";
}

export const toastConfirm = ({
  title = "Xác nhận",
  message,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  confirmColor = "primary",
}: ToastConfirmOptions): Promise<boolean> => {
  return new Promise((resolve) => {
    let settled = false;

    const finish = (value: boolean, closeToast?: () => void) => {
      if (settled) {
        return;
      }

      settled = true;

      resolve(value);

      closeToast?.();
    };

    toast.info(
      ({ closeToast }) => (
        <Box
          sx={{
            minWidth: {
              xs: 240,
              sm: 300,
            },
          }}
        >
          <Typography
            sx={{
              fontWeight: 800,
              mb: 1,
            }}
          >
            {title}
          </Typography>

          <Box
            sx={{
              color: "text.secondary",
              fontSize: 14,
              mb: 2,
            }}
          >
            {message}
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 1,
            }}
          >
            <Button
              size="small"
              color="inherit"
              onClick={() => finish(false, closeToast)}
            >
              {cancelText}
            </Button>

            <Button
              size="small"
              variant="contained"
              color={confirmColor}
              onClick={() => finish(true, closeToast)}
            >
              {confirmText}
            </Button>
          </Box>
        </Box>
      ),
      {
        autoClose: false,

        closeOnClick: false,

        draggable: false,

        closeButton: false,

        onClose: () => {
          if (!settled) {
            settled = true;

            resolve(false);
          }
        },
      }
    );
  });
};
