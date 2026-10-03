import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import {
  AccountBalanceWallet,
  Close,
  Payment,
  Save,
} from "@mui/icons-material";

import { useEffect, useMemo, useState } from "react";

import { toast } from "react-toastify";

import { api } from "@/utils/api";


interface OwnerOption {
  _id: string;
  name: string;
  contact?: string;
  address?: string;
  totalDebt: number;
  totalPayment: number;
  balance: number;
  transactionCount: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  owners: OwnerOption[];
  debt?: Debts.DebtTransaction | null;
  defaultOwnerId?: string;
  defaultType?: Debts.DebtType;
  onSaved?: () => void | Promise<void>;
}

const getToday = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const DebtFormDialog = ({
  open,
  onClose,
  owners,
  debt,
  defaultOwnerId = "",
  defaultType = "DEBT",
  onSaved,
}: Props) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [saving, setSaving] = useState(false);
  const [ownerId, setOwnerId] = useState("");
  const [type, setType] = useState<Debts.DebtType>("DEBT");
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState(getToday());
  const [note, setNote] = useState("");

  const selectedOwner = useMemo(
    () => owners.find((owner) => owner._id === ownerId),
    [owners, ownerId]
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    if (debt) {
      setOwnerId(typeof debt.owner === "string" ? debt.owner : debt.owner._id);
      setType(debt.type);
      setAmount(Number(debt.amount || 0));
      setDate(debt.date ? debt.date.slice(0, 10) : getToday());
      setNote(debt.note || "");
      return;
    }

    setOwnerId(defaultOwnerId);
    setType(defaultType);
    setAmount(0);
    setDate(getToday());
    setNote("");
  }, [open, debt, defaultOwnerId, defaultType]);

  const formatMoneyInput = (value: number) => {
    if (!value) {
      return "";
    }
    return Number(value).toLocaleString("en-US");
  };

  const formatMoney = (value: number) =>
    `${Number(value || 0).toLocaleString("en-US")}đ`;

  const handleSave = async () => {
    if (!ownerId) {
      toast.warning("Vui lòng chọn chủ động vật");
      return;
    }

    if (amount <= 0) {
      toast.warning("Vui lòng nhập số tiền lớn hơn 0");
      return;
    }

    if (!date) {
      toast.warning("Vui lòng chọn ngày");
      return;
    }

    try {
      setSaving(true);

      const data: Debts.CreateDebtDto = {
        ownerId,
        type,
        amount: Number(amount),
        date,
        note: note.trim(),
      };

      if (debt?._id) {
        await api.debts.update(debt._id, data);
        toast.success("Cập nhật công nợ thành công");
      } else {
        await api.debts.create(data);
        toast.success(type === "DEBT" ? "Đã ghi nợ" : "Đã thu nợ");
      }

      try {
        await onSaved?.();
      } catch (refreshError) {
        console.error(
          "Đã lưu nhưng không thể đồng bộ giao diện:",
          refreshError
        );
      }

      onClose();
    } catch (error) {
      console.error("Lưu công nợ thất bại:", error);
      toast.error(
        error instanceof Error ? error.message : "Không thể lưu công nợ"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: {
            width: isMobile ? "calc(100% - 24px)" : "100%",
            borderRadius: 3,
            backgroundImage: "none",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          textAlign: "center",
          fontWeight: 900,
          pb: 1,
        }}
      >
        {debt ? "Sửa Công Nợ" : type === "DEBT" ? "Ghi Nợ" : "Thu Nợ"}
      </DialogTitle>

      <DialogContent>
        {/* TYPE */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 1,
            mb: 2,
            flexWrap: "wrap",
          }}
        >
          <Chip
            icon={<AccountBalanceWallet />}
            label="Ghi Nợ"
            clickable
            color={type === "DEBT" ? "error" : "default"}
            variant={type === "DEBT" ? "filled" : "outlined"}
            onClick={() => setType("DEBT")}
            sx={{
              minWidth: 120,
              fontWeight: 800,
            }}
          />

          <Chip
            icon={<Payment />}
            label="Thu Nợ"
            clickable
            color={type === "PAYMENT" ? "success" : "default"}
            variant={type === "PAYMENT" ? "filled" : "outlined"}
            onClick={() => setType("PAYMENT")}
            sx={{
              minWidth: 120,
              fontWeight: 800,
            }}
          />
        </Box>

        {/* OWNER */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Chủ động vật</InputLabel>
          <Select
            value={ownerId}
            label="Chủ động vật"
            onChange={(event) => setOwnerId(event.target.value)}
          >
            {owners.map((owner) => (
              <MenuItem key={owner._id} value={owner._id}>
                {owner.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* CURRENT BALANCE */}
        {selectedOwner && (
          <Box
            sx={{
              mb: 2,
              p: 1.5,
              borderRadius: 2.5,
              textAlign: "center",
              backgroundColor:
                selectedOwner.balance > 0
                  ? "rgba(255,152,0,0.08)"
                  : "rgba(76,175,80,0.08)",
              border: "1px solid",
              borderColor:
                selectedOwner.balance > 0 ? "warning.main" : "success.main",
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Công nợ hiện tại
            </Typography>
            <Typography
              sx={{
                mt: 0.25,
                fontWeight: 900,
                fontSize: 22,
                color:
                  selectedOwner.balance > 0 ? "warning.main" : "success.main",
              }}
            >
              {formatMoney(selectedOwner.balance)}
            </Typography>
          </Box>
        )}

        {/* QUICK AMOUNTS */}
        <Box
          sx={{
            mb: 1.5,
            textAlign: "center",
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: "block",
              mb: 1,
              fontWeight: 600,
            }}
          >
            Chọn nhanh số tiền
          </Typography>

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            {[100000, 200000, 500000, 1000000].map((value) => (
              <Chip
                key={value}
                label={`${value / 1000}k`}
                clickable
                variant={amount === value ? "filled" : "outlined"}
                color={amount === value ? "primary" : "default"}
                onClick={() => setAmount(value)}
                sx={{
                  minWidth: 72,
                  fontWeight: 700,
                }}
              />
            ))}
          </Box>
        </Box>

        {/* AMOUNT */}
        <TextField
          fullWidth
          label="Số tiền"
          value={formatMoneyInput(amount)}
          onChange={(event) => {
            const raw = event.target.value.replace(/\D/g, "");
            setAmount(raw ? Number(raw) : 0);
          }}
          slotProps={{
            htmlInput: {
              inputMode: "numeric",
              style: {
                textAlign: "center",
              },
            },
          }}
          helperText={
            type === "DEBT"
              ? "Số tiền ghi thêm vào công nợ"
              : "Số tiền khách/chủ động vật trả"
          }
          sx={{
            mb: 2,
            "& .MuiInputBase-input": {
              textAlign: "center",
              fontWeight: 800,
              fontSize: 20,
            },
            "& .MuiFormHelperText-root": {
              textAlign: "center",
            },
          }}
        />

        {/* DATE */}
        <TextField
          fullWidth
          type="date"
          label="Ngày"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          slotProps={{
            inputLabel: {
              shrink: true,
            },
          }}
          sx={{
            mb: 2,
          }}
        />

        {/* NOTE */}
        <TextField
          fullWidth
          multiline
          minRows={3}
          label="Ghi chú"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Ví dụ: Tiền hàng, tiền giết mổ, khách trả một phần..."
          sx={{
            mb: 2,
          }}
        />

        <Divider sx={{ mb: 2 }} />

        {/* ACTIONS */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
            },
            gap: 1.25,
          }}
        >
          <Button
            fullWidth
            variant="outlined"
            color="inherit"
            startIcon={<Close />}
            onClick={onClose}
            disabled={saving}
            sx={{
              minHeight: 44,
              fontWeight: 700,
            }}
          >
            Hủy
          </Button>

          <Button
            fullWidth
            variant="contained"
            color={type === "DEBT" ? "error" : "success"}
            startIcon={
              saving ? <CircularProgress size={17} color="inherit" /> : <Save />
            }
            onClick={handleSave}
            disabled={saving}
            sx={{
              minHeight: 44,
              fontWeight: 800,
            }}
          >
            {saving
              ? "Đang lưu..."
              : debt
              ? "Lưu Thay Đổi"
              : type === "DEBT"
              ? "Ghi Nợ"
              : "Thu Nợ"}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default DebtFormDialog;
