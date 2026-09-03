import { useEffect, useState } from "react";
import dayjs from "dayjs";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import {
  Box,
  Button,
  Dialog,
  MenuItem,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import { api } from "@/utils/api";

interface OwnerOption {
  _id: string;
  name: string;
}

interface AnimalTypeOption {
  _id: string;
  name: string;
}

interface DailyLog {
  _id: string;

  owner: string | OwnerOption;

  animalType: string | AnimalTypeOption;

  date: string;

  quantity: number;

  notes?: string;
}

interface DailyLogFormDialogProps {
  open: boolean;

  onClose: () => void;

  dailyLog?: DailyLog | null;

  owners: OwnerOption[];

  animalTypes: AnimalTypeOption[];

  onSaved?: () => void | Promise<void>;
}

const defaultFormData = {
  ownerId: "",
  animalTypeId: "",
  date: "",
  quantity: 0,
  notes: "",
};

const DailyLogFormDialog = ({
  open,
  onClose,
  dailyLog,
  owners,
  animalTypes,
  onSaved,
}: DailyLogFormDialogProps) => {
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState(defaultFormData);

  // ================= INIT FORM =================

  useEffect(() => {
    if (!open) {
      return;
    }

    // ================= EDIT =================
    if (dailyLog) {
      setFormData({
        ownerId:
          typeof dailyLog.owner === "string"
            ? dailyLog.owner
            : dailyLog.owner?._id || "",

        animalTypeId:
          typeof dailyLog.animalType === "string"
            ? dailyLog.animalType
            : dailyLog.animalType?._id || "",

        date: dailyLog.date ? dayjs(dailyLog.date).format("YYYY-MM-DD") : "",

        quantity: dailyLog.quantity || 0,

        notes: dailyLog.notes || "",
      });

      return;
    }

    // ================= CREATE =================

    const defaultAnimalType = animalTypes.find(
      (type) => type.name.trim().toLowerCase() === "heo"
    );

    setFormData({
      ownerId: "",
      animalTypeId: defaultAnimalType?._id || "",
      date: dayjs().format("YYYY-MM-DD"),
      quantity: 0,
      notes: "",
    });
  }, [open, dailyLog, animalTypes]);
  // ================= SAVE =================

  const handleSave = async () => {
    if (
      !formData.ownerId ||
      !formData.animalTypeId ||
      !formData.date ||
      formData.quantity <= 0
    ) {
      alert("Vui lòng nhập đầy đủ Chủ, Loại động vật, Ngày và Số lượng");

      return;
    }

    try {
      setSaving(true);

      const data = {
        ownerId: formData.ownerId,

        animalTypeId: formData.animalTypeId,

        date: formData.date,

        quantity: Number(formData.quantity),

        notes: formData.notes.trim() || undefined,
      };

      if (dailyLog?._id) {
        await api.dailyLogs.update(dailyLog._id, data);
      } else {
        await api.dailyLogs.create(data);
      }

      await onSaved?.();

      onClose();
    } catch (error) {
      console.error("Lưu daily log thất bại:", error);

      alert("Lưu thất bại");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (saving) {
      return;
    }

    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullScreen={isMobile}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: {
            borderRadius: isMobile ? 0 : 3,
            m: isMobile ? 0 : 2,
          },
        },
      }}
    >
      <Box
        sx={{
          p: isMobile ? 2 : 3,
        }}
      >
        {/* HEADER */}

        <Box sx={{ mb: 3 }}>
          <Typography
            variant={isMobile ? "h6" : "h5"}
            sx={{
              fontWeight: 700,
              mb: 0.5,
              textAlign: "center",
            }}
          >
            {dailyLog ? "Sửa Nhật Ký Trong Ngày" : "Thêm Nhật Ký Trong Ngày"}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: "center" }}
          >
            {dailyLog
              ? "Cập nhật thông tin nhật ký đã tạo"
              : "Nhập thông tin nhật ký mới"}
          </Typography>
        </Box>

        {/* OWNER + ANIMAL TYPE */}

        <Box
          sx={{
            display: "grid",

            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",

            gap: 2,

            mb: 2,
          }}
        >
          <TextField
            select
            fullWidth
            label="Chủ động vật"
            value={formData.ownerId}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                ownerId: e.target.value,
              }))
            }
          >
            {owners.map((owner) => (
              <MenuItem key={owner._id} value={owner._id}>
                {owner.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            fullWidth
            label="Loại động vật"
            value={formData.animalTypeId}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                animalTypeId: e.target.value,
              }))
            }
          >
            {animalTypes.map((type) => (
              <MenuItem key={type._id} value={type._id}>
                {type.name}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {/* DATE */}

        <DatePicker
          label="Ngày"
          value={formData.date ? dayjs(formData.date) : null}
          onChange={(newValue) =>
            setFormData((prev) => ({
              ...prev,

              date: newValue ? newValue.format("YYYY-MM-DD") : "",
            }))
          }
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

        {/* QUANTITY */}

        <TextField
          fullWidth
          type="number"
          label="Số con"
          value={formData.quantity}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,

              quantity: parseInt(e.target.value, 10) || 0,
            }))
          }
          slotProps={{
            htmlInput: {
              min: 1,
            },
          }}
          sx={{
            mb: 2,
          }}
        />

        {/* NOTES */}

        <TextField
          fullWidth
          label="Ghi chú"
          multiline
          rows={isMobile ? 4 : 3}
          value={formData.notes}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              notes: e.target.value,
            }))
          }
          placeholder="Nhập ghi chú nếu có..."
          sx={{
            mb: 3,
          }}
        />

        {/* ACTIONS */}

        <Box
          sx={{
            display: "flex",

            flexDirection: isMobile ? "column-reverse" : "row",

            justifyContent: "flex-end",

            gap: 1.5,
          }}
        >
          <Button onClick={handleClose} disabled={saving} fullWidth={isMobile}>
            Hủy
          </Button>

          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            fullWidth={isMobile}
          >
            {saving ? "Đang lưu..." : dailyLog ? "Cập Nhật" : "Lưu"}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

export default DailyLogFormDialog;
