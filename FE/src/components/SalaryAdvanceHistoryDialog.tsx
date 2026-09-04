import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import { Close, Delete, Payments } from "@mui/icons-material";

import { useCallback, useEffect, useState } from "react";

import dayjs from "dayjs";

import { toast } from "react-toastify";

import { api } from "@/utils/api";

interface Employee {
  _id: string;
  name: string;
}

interface SalaryAdvance {
  _id: string;

  amount: number;

  date: string;

  note?: string;

  createdAt?: string;
}

interface Props {
  open: boolean;

  onClose: () => void;

  employee: Employee | null;

  month: string;

  isFinalized?: boolean;

  onChanged?: () => void | Promise<void>;
}

const SalaryAdvanceHistoryDialog = ({
  open,
  onClose,
  employee,
  month,
  isFinalized = false,
  onChanged,
}: Props) => {
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [items, setItems] = useState<SalaryAdvance[]>([]);

  const [loading, setLoading] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const formatMoney = (value: number) =>
    `${Number(value || 0).toLocaleString("vi-VN")}đ`;

  const fetchData = useCallback(async () => {
    if (!employee) {
      return;
    }

    try {
      setLoading(true);

      const data = await api.salaryAdvances.getAll(employee._id, month);

      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Không thể tải lịch sử ứng lương");
    } finally {
      setLoading(false);
    }
  }, [employee, month]);

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open, fetchData]);

  const handleDelete = async (item: SalaryAdvance) => {
    if (isFinalized) {
      toast.info("Bảng lương đã chốt");
      return;
    }

    try {
      setDeletingId(item._id);

      await api.salaryAdvances.delete(item._id);

      toast.success("Đã xóa lần ứng lương");

      await fetchData();

      await onChanged?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể xóa lần ứng"
      );
    } finally {
      setDeletingId(null);
    }
  };

  const total = items.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={isMobile}
      fullWidth
      maxWidth="sm"
    >
      <Box
        sx={{
          p: {
            xs: 2,
            sm: 3,
          },
        }}
      >
        {/* HEADER */}

        <Box
          sx={{
            display: "flex",

            justifyContent: "space-between",

            alignItems: "flex-start",

            mb: 3,
          }}
        >
          <Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
              }}
            >
              Lịch Sử Ứng Lương
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {employee?.name} • {dayjs(`${month}-01`).format("MM/YYYY")}
            </Typography>
          </Box>

          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>

        {loading ? (
          <Box
            sx={{
              py: 6,

              display: "flex",

              justifyContent: "center",
            }}
          >
            <CircularProgress />
          </Box>
        ) : items.length === 0 ? (
          <Box
            sx={{
              py: 6,
              textAlign: "center",
            }}
          >
            <Payments
              sx={{
                fontSize: 50,

                color: "text.disabled",
              }}
            />

            <Typography
              color="text.secondary"
              sx={{
                mt: 1,
              }}
            >
              Chưa có lần ứng lương
            </Typography>
          </Box>
        ) : (
          <>
            <Box
              sx={{
                display: "flex",

                flexDirection: "column",

                gap: 1.25,
              }}
            >
              {items.map((item) => (
                <Box
                  key={item._id}
                  sx={{
                    p: 1.75,

                    border: "1px solid",

                    borderColor: "divider",

                    borderRadius: 2.5,

                    display: "flex",

                    justifyContent: "space-between",

                    alignItems: "center",

                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography
                      sx={{
                        fontWeight: 800,

                        color: "warning.main",
                      }}
                    >
                      {formatMoney(item.amount)}
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                      {dayjs(item.date).format("DD/MM/YYYY")}
                    </Typography>

                    {item.note && (
                      <Typography
                        variant="body2"
                        sx={{
                          mt: 0.5,
                        }}
                      >
                        {item.note}
                      </Typography>
                    )}
                  </Box>

                  <IconButton
                    color="error"
                    disabled={isFinalized || deletingId === item._id}
                    onClick={() => handleDelete(item)}
                  >
                    {deletingId === item._id ? (
                      <CircularProgress size={18} />
                    ) : (
                      <Delete />
                    )}
                  </IconButton>
                </Box>
              ))}
            </Box>

            <Box
              sx={(theme) => ({
                mt: 2,

                p: 2,

                borderRadius: 2.5,

                backgroundColor:
                  theme.palette.mode === "dark"
                    ? "rgba(255,193,7,0.08)"
                    : "rgba(255,193,7,0.08)",
              })}
            >
              <Typography variant="body2" color="text.secondary">
                Tổng đã ứng
              </Typography>

              <Typography
                sx={{
                  fontSize: 22,

                  fontWeight: 900,

                  color: "warning.main",
                }}
              >
                {formatMoney(total)}
              </Typography>
            </Box>
          </>
        )}

        <Box
          sx={{
            mt: 2,

            display: "flex",

            justifyContent: "flex-end",
          }}
        >
          <Button onClick={onClose}>Đóng</Button>
        </Box>
      </Box>
    </Dialog>
  );
};

export default SalaryAdvanceHistoryDialog;
