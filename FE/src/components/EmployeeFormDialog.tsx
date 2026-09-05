import {
  Box,
  Button,
  Dialog,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import { useEffect, useState } from "react";

import { toast } from "react-toastify";

import { api } from "@/utils/api";

interface Props {
  open: boolean;

  onClose: () => void;

  employee?: any | null;

  onSaved?: () => void | Promise<void>;
}

const EmployeeFormDialog = ({ open, onClose, employee, onSaved }: Props) => {
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    baseSalary: 0,
    notes: "",
  });

  useEffect(() => {
    if (!open) return;

    setFormData({
      name: employee?.name || "",

      phone: employee?.phone || "",

      address: employee?.address || "",

      baseSalary: Number(employee?.baseSalary || 0),

      notes: employee?.notes || "",
    });
  }, [open, employee]);

  ///
  const formatMoneyInput = (value: number) => {
    if (!value) {
      return "";
    }

    return Number(value).toLocaleString("en-US");
  };

  const numberToVietnameseWords = (value: number) => {
    const number = Math.floor(Number(value || 0));

    if (number === 0) {
      return "Không đồng";
    }

    const digits = [
      "không",
      "một",
      "hai",
      "ba",
      "bốn",
      "năm",
      "sáu",
      "bảy",
      "tám",
      "chín",
    ];

    const units = ["", "nghìn", "triệu", "tỷ", "nghìn tỷ", "triệu tỷ"];

    const readThreeDigits = (num: number) => {
      const hundred = Math.floor(num / 100);

      const ten = Math.floor((num % 100) / 10);

      const unit = num % 10;

      const parts: string[] = [];

      if (hundred > 0) {
        parts.push(digits[hundred], "trăm");
      }

      if (ten > 1) {
        parts.push(digits[ten], "mươi");

        if (unit === 1) {
          parts.push("mốt");
        } else if (unit === 4) {
          parts.push("tư");
        } else if (unit === 5) {
          parts.push("lăm");
        } else if (unit > 0) {
          parts.push(digits[unit]);
        }
      } else if (ten === 1) {
        parts.push("mười");

        if (unit === 5) {
          parts.push("lăm");
        } else if (unit > 0) {
          parts.push(digits[unit]);
        }
      } else if (unit > 0) {
        if (hundred > 0) {
          parts.push("lẻ");
        }

        parts.push(digits[unit]);
      }

      return parts.join(" ");
    };

    let remaining = number;

    let groupIndex = 0;

    const result: string[] = [];

    while (remaining > 0) {
      const group = remaining % 1000;

      if (group > 0) {
        const words = readThreeDigits(group);

        result.unshift([words, units[groupIndex]].filter(Boolean).join(" "));
      }

      remaining = Math.floor(remaining / 1000);

      groupIndex++;
    }

    const text = result.join(" ");

    return text.charAt(0).toUpperCase() + text.slice(1) + " đồng";
  };
  ///

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.warning("Vui lòng nhập tên nhân viên");

      return;
    }

    try {
      setSaving(true);

      const data = {
        ...formData,

        baseSalary: Number(formData.baseSalary),
      };

      if (employee?._id) {
        await api.employees.update(employee._id, data);

        toast.success("Cập nhật nhân viên thành công");
      } else {
        await api.employees.create(data);

        toast.success("Thêm nhân viên thành công");
      }

      await onSaved?.();

      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể lưu nhân viên"
      );
    } finally {
      setSaving(false);
    }
  };

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
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            textAlign: "center",
            mb: 3,
          }}
        >
          {employee ? "Sửa Nhân Viên" : "Thêm Nhân Viên"}
        </Typography>

        <TextField
          fullWidth
          label="Tên nhân viên"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              name: e.target.value,
            }))
          }
          sx={{
            mb: 2,
          }}
        />

        <TextField
          fullWidth
          label="Số điện thoại"
          value={formData.phone}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              phone: e.target.value,
            }))
          }
          sx={{
            mb: 2,
          }}
        />

        <TextField
          fullWidth
          label="Địa chỉ"
          value={formData.address}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              address: e.target.value,
            }))
          }
          sx={{
            mb: 2,
          }}
        />

        <TextField
          fullWidth
          type="text"
          label="Lương gốc"
          value={formatMoneyInput(formData.baseSalary)}
          onChange={(e) => {
            const rawValue = e.target.value.replace(/\D/g, "");

            setFormData((prev) => ({
              ...prev,

              baseSalary: rawValue === "" ? 0 : Number(rawValue),
            }));
          }}
          slotProps={{
            htmlInput: {
              inputMode: "numeric",
            },
          }}
          helperText={
            formData.baseSalary > 0
              ? numberToVietnameseWords(formData.baseSalary)
              : "Nhập mức lương gốc"
          }
          sx={{
            mb: 2,

            "& .MuiFormHelperText-root": {
              fontStyle: "italic",
              fontWeight: 500,
            },
          }}
        />

        <TextField
          fullWidth
          multiline
          rows={3}
          label="Ghi chú"
          value={formData.notes}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              notes: e.target.value,
            }))
          }
          sx={{
            mb: 3,
          }}
        />

        <Box
          sx={{
            display: "flex",
            gap: 1,

            flexDirection: {
              xs: "column-reverse",
              sm: "row",
            },

            justifyContent: "flex-end",
          }}
        >
          <Button onClick={onClose} disabled={saving}>
            Hủy
          </Button>

          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? "Đang lưu..." : "Lưu"}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

export default EmployeeFormDialog;
