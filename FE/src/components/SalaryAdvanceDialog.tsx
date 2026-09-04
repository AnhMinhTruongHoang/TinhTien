import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  IconButton,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import { AccountBalanceWallet, Close } from "@mui/icons-material";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import { useEffect, useState } from "react";

import dayjs, { type Dayjs } from "dayjs";

import { toast } from "react-toastify";
import { api } from "@/utils/api";

interface Employee {
  _id: string;
  name: string;
}

interface Props {
  open: boolean;

  onClose: () => void;

  employee: Employee | null;

  month: string;

  remainingSalary: number;

  onSaved?: () => void | Promise<void>;
}

const SalaryAdvanceDialog = ({
  open,
  onClose,
  employee,
  month,
  remainingSalary,
  onSaved,
}: Props) => {
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [amount, setAmount] = useState(0);

  const [date, setDate] = useState<Dayjs>(dayjs());

  const [note, setNote] = useState("");

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    setAmount(0);
    setDate(dayjs());
    setNote("");
  }, [open]);

  const formatMoney = (value: number) =>
    `${Number(value || 0).toLocaleString("vi-VN")}đ`;

  // =====================================================
  // PARTIAL
  // =====================================================

  const handleAdvance = async () => {
    if (!employee) {
      toast.error("Không tìm thấy nhân viên");
      return;
    }

    const value = Number(amount);

    if (value <= 0) {
      toast.warning("Số tiền ứng phải lớn hơn 0");
      return;
    }

    if (value > remainingSalary) {
      toast.warning(`Chỉ còn ${formatMoney(remainingSalary)} có thể ứng`);

      return;
    }

    try {
      setSaving(true);

      await api.salaryAdvances.create({
        employeeId: employee._id,

        month,

        amount: value,

        date: date.format("YYYY-MM-DD"),

        note: note.trim() || undefined,
      });

      toast.success(`Đã ứng ${formatMoney(value)}`);

      await onSaved?.();

      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể ứng lương"
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // FULL
  // =====================================================

  const handleFullAdvance = async () => {
    if (!employee) {
      return;
    }

    if (remainingSalary <= 0) {
      toast.info("Nhân viên không còn lương để ứng");
      return;
    }

    try {
      setSaving(true);

      await api.salaryAdvances.createFull({
        employeeId: employee._id,

        month,

        date: date.format("YYYY-MM-DD"),

        note: note.trim() || "Ứng toàn bộ phần lương còn lại",
      });

      toast.success(`Đã ứng toàn bộ ${formatMoney(remainingSalary)}`);

      await onSaved?.();

      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể ứng toàn bộ lương"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      fullScreen={isMobile}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: {
            borderRadius: isMobile ? 0 : 3,

            backgroundImage: "none",
          },
        },
      }}
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
            gap: 2,
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
              Ứng Trước Lương
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.5,
              }}
            >
              {employee?.name} • Tháng {dayjs(`${month}-01`).format("MM/YYYY")}
            </Typography>
          </Box>

          <IconButton onClick={onClose} disabled={saving}>
            <Close />
          </IconButton>
        </Box>

        {/* REMAINING */}

        <Box
          sx={(theme) => ({
            p: 2,

            mb: 3,

            borderRadius: 2.5,

            border: "1px solid",

            borderColor: "primary.main",

            backgroundColor:
              theme.palette.mode === "dark"
                ? "rgba(144,202,249,0.08)"
                : "rgba(25,118,210,0.05)",
          })}
        >
          <Typography variant="body2" color="text.secondary">
            Số tiền còn có thể ứng
          </Typography>

          <Typography
            sx={{
              mt: 0.5,
              fontSize: 26,
              fontWeight: 900,
              color: "primary.main",
            }}
          >
            {formatMoney(remainingSalary)}
          </Typography>
        </Box>

        {/* DATE */}

        <DatePicker
          label="Ngày ứng"
          value={date}
          onChange={(value) => {
            if (value) {
              setDate(value);
            }
          }}
          format="DD/MM/YYYY"
          slotProps={{
            textField: {
              fullWidth: true,
              sx: {
                mb: 2,
              },
            },
          }}
        />

        {/* AMOUNT */}

        <TextField
          fullWidth
          type="number"
          label="Số tiền ứng"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          slotProps={{
            htmlInput: {
              min: 0,
              max: remainingSalary,
            },
          }}
          helperText={`Tối đa ${formatMoney(remainingSalary)}`}
          sx={{
            mb: 2,
          }}
        />

        {/* NOTE */}

        <TextField
          fullWidth
          multiline
          rows={3}
          label="Ghi chú"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ví dụ: Ứng tiền sinh hoạt..."
          sx={{
            mb: 3,
          }}
        />

        {/* ACTION */}

        <Box
          sx={{
            display: "grid",

            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
            },

            gap: 1.5,
          }}
        >
          <Button
            variant="outlined"
            startIcon={<AccountBalanceWallet />}
            disabled={saving || remainingSalary <= 0}
            onClick={handleFullAdvance}
          >
            Ứng Toàn Bộ
          </Button>

          <Button
            variant="contained"
            disabled={saving || amount <= 0}
            onClick={handleAdvance}
          >
            {saving ? (
              <>
                <CircularProgress
                  size={17}
                  color="inherit"
                  sx={{
                    mr: 1,
                  }}
                />
                Đang lưu...
              </>
            ) : (
              "Xác Nhận Ứng"
            )}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

export default SalaryAdvanceDialog;
