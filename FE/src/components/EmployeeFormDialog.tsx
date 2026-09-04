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
          type="number"
          label="Lương gốc"
          value={formData.baseSalary}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,

              baseSalary: Number(e.target.value),
            }))
          }
          slotProps={{
            htmlInput: {
              min: 0,
            },
          }}
          sx={{
            mb: 2,
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
