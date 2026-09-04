import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  Divider,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import { CheckCircle, Lock, Payments } from "@mui/icons-material";

interface PayrollFinalizeDialogProps {
  open: boolean;

  employeeName: string;

  monthLabel: string;

  baseSalary: number;

  presentDays: number;

  absenceDays: number;

  totalDeduction: number;

  finalSalary: number;

  totalAdvance?: number;

  remainingSalary?: number;

  loading?: boolean;

  onClose: () => void;

  onConfirm: () => void | Promise<void>;
}

const PayrollFinalizeDialog = ({
  open,
  employeeName,
  monthLabel,
  baseSalary,
  presentDays,
  absenceDays,
  totalDeduction,
  finalSalary,
  totalAdvance = 0,
  remainingSalary = finalSalary,
  loading = false,
  onClose,
  onConfirm,
}: PayrollFinalizeDialogProps) => {
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const formatMoney = (value: number) =>
    `${Number(value || 0).toLocaleString("vi-VN")}đ`;

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      fullScreen={isMobile}
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: "rgba(0,0,0,0.65)",

            backdropFilter: "blur(3px)",
          },
        },

        paper: {
          sx: {
            borderRadius: isMobile ? 0 : 3,

            m: isMobile ? 0 : 2,

            backgroundImage: "none",

            overflow: "hidden",

            boxShadow: theme.shadows[24],
          },
        },
      }}
    >
      {/* HEADER */}

      <Box
        sx={(theme) => ({
          px: {
            xs: 2,
            sm: 3,
          },

          pt: {
            xs: 2.5,
            sm: 3,
          },

          pb: 2,

          textAlign: "center",

          borderBottom: "1px solid",

          borderColor: "divider",

          backgroundColor:
            theme.palette.mode === "dark"
              ? "rgba(25,118,210,0.08)"
              : "rgba(25,118,210,0.04)",
        })}
      >
        <Box
          sx={{
            width: 56,
            height: 56,

            mx: "auto",
            mb: 1.5,

            borderRadius: "50%",

            display: "flex",

            alignItems: "center",

            justifyContent: "center",

            backgroundColor: "success.main",

            color: "success.contrastText",
          }}
        >
          <Payments />
        </Box>

        <Typography
          variant={isMobile ? "h6" : "h5"}
          sx={{
            fontWeight: 900,
          }}
        >
          Chốt Lương Tháng
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mt: 0.75,
          }}
        >
          Xác nhận chốt lương <strong>{monthLabel}</strong> cho{" "}
          <strong>{employeeName}</strong>
        </Typography>
      </Box>

      {/* CONTENT */}

      <Box
        sx={{
          p: {
            xs: 2,
            sm: 3,
          },
        }}
      >
        <Box
          sx={{
            display: "grid",

            gridTemplateColumns: {
              xs: "1fr 1fr",
              sm: "1fr 1fr",
            },

            gap: 1.25,
          }}
        >
          {[
            {
              label: "Lương gốc",

              value: formatMoney(baseSalary),

              color: "primary.main",
            },

            {
              label: "Đi làm",

              value: `${presentDays} ngày`,

              color: "success.main",
            },

            {
              label: "Ngày nghỉ",

              value: `${absenceDays} ngày`,

              color: "warning.main",
            },

            {
              label: "Tiền trừ",

              value: formatMoney(totalDeduction),

              color: "error.main",
            },

            {
              label: "Sau khấu trừ",

              value: formatMoney(finalSalary),

              color: "success.main",
            },

            {
              label: "Đã ứng",

              value: formatMoney(totalAdvance),

              color: "warning.main",
            },
          ].map((item) => (
            <Box
              key={item.label}
              sx={(theme) => ({
                p: 1.5,

                borderRadius: 2,

                border: "1px solid",

                borderColor: "divider",

                backgroundColor:
                  theme.palette.mode === "dark"
                    ? "rgba(255,255,255,0.025)"
                    : "#f8fafc",
              })}
            >
              <Typography variant="caption" color="text.secondary">
                {item.label}
              </Typography>

              <Typography
                sx={{
                  mt: 0.25,

                  fontWeight: 800,

                  color: item.color,
                }}
              >
                {item.value}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* REMAINING */}

        <Box
          sx={(theme) => ({
            mt: 2,

            p: 2,

            borderRadius: 2.5,

            textAlign: "center",

            border: "1px solid",

            borderColor: "success.main",

            backgroundColor:
              theme.palette.mode === "dark"
                ? "rgba(76,175,80,0.10)"
                : "rgba(76,175,80,0.06)",
          })}
        >
          <Typography variant="body2" color="text.secondary">
            Còn phải trả sau ứng lương
          </Typography>

          <Typography
            sx={{
              mt: 0.5,

              fontSize: {
                xs: 24,
                sm: 30,
              },

              fontWeight: 900,

              color: "success.main",
            }}
          >
            {formatMoney(remainingSalary)}
          </Typography>
        </Box>

        {/* WARNING */}

        <Box
          sx={(theme) => ({
            mt: 2,

            p: 1.5,

            display: "flex",

            alignItems: "flex-start",

            gap: 1,

            borderRadius: 2,

            backgroundColor:
              theme.palette.mode === "dark"
                ? "rgba(255,193,7,0.08)"
                : "rgba(255,193,7,0.10)",

            border: "1px solid",

            borderColor: "warning.main",
          })}
        >
          <Lock fontSize="small" color="warning" />

          <Typography
            variant="body2"
            sx={{
              color: "warning.main",

              fontWeight: 600,
            }}
          >
            Sau khi chốt, tháng này sẽ bị khóa. Không thể chỉnh sửa ngày nghỉ
            hoặc tiền ứng.
          </Typography>
        </Box>

        <Divider
          sx={{
            my: 2.5,
          }}
        />

        {/* ACTIONS */}

        <Box
          sx={{
            display: "flex",

            flexDirection: {
              xs: "column-reverse",
              sm: "row",
            },

            justifyContent: "flex-end",

            gap: 1.25,
          }}
        >
          <Button
            variant="outlined"
            color="inherit"
            onClick={onClose}
            disabled={loading}
            fullWidth={isMobile}
          >
            Hủy
          </Button>

          <Button
            variant="contained"
            color="success"
            startIcon={
              loading ? (
                <CircularProgress size={17} color="inherit" />
              ) : (
                <CheckCircle />
              )
            }
            onClick={onConfirm}
            disabled={loading}
            fullWidth={isMobile}
          >
            {loading ? "Đang chốt..." : "Xác Nhận Chốt Lương"}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

export default PayrollFinalizeDialog;
