import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import {
  Box,
  Button,
  Chip,
  Divider,
  MenuItem,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
  Dialog,
} from "@mui/material";

import { Calculate, Save } from "@mui/icons-material";

import { api } from "@/utils/api";

import { toast } from "react-toastify";

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

  onSaved?: (result?: {
    dailyLog?: any;
    calculation?: any;
  }) => void | Promise<void>;
}

const defaultFormData = {
  ownerId: "",
  animalTypeId: "",
  date: "",
  quantity: 0,
  notes: "",
};

const quickPrices = [
  70000, 120000, 130000, 140000, 150000, 160000, 170000, 180000,
];

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

  const [pricePerUnit, setPricePerUnit] = useState(0);

  // =====================================================
  // MONEY
  // =====================================================

  const formatMoneyInput = (value: number) => {
    if (!value) {
      return "";
    }

    return Number(value).toLocaleString("en-US");
  };

  const formatMoney = (value: number) =>
    `${Number(value || 0).toLocaleString("en-US")}đ`;

  const numberToVietnameseWords = (value: number) => {
    const number = Math.floor(Number(value || 0));

    if (number === 0) {
      return "";
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

  // =====================================================
  // TOTAL PREVIEW
  // =====================================================

  const totalCost = useMemo(() => {
    const quantity = Number(formData.quantity || 0);

    const price = Number(pricePerUnit || 0);

    return quantity * price;
  }, [formData.quantity, pricePerUnit]);

  // =====================================================
  // INIT FORM
  // =====================================================

  useEffect(() => {
    if (!open) {
      return;
    }

    setPricePerUnit(0);

    // ===================================================
    // EDIT
    // ===================================================

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

    // ===================================================
    // CREATE
    // ===================================================

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

  // =====================================================
  // SAVE
  // =====================================================

  const handleSave = async () => {
    if (
      !formData.ownerId ||
      !formData.animalTypeId ||
      !formData.date ||
      formData.quantity <= 0
    ) {
      toast.warning(
        "Vui lòng nhập đầy đủ Chủ, Loại động vật, Ngày và Số lượng"
      );

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

      // ===================================================
      // EDIT DAILY LOG
      // ===================================================

      if (dailyLog?._id) {
        const updatedLog = await api.dailyLogs.update(dailyLog._id, data);

        toast.success("Cập nhật nhật ký thành công");

        await onSaved?.({
          dailyLog: updatedLog,
        });

        onClose();

        return;
      }

      // ===================================================
      // CREATE DAILY LOG
      // ===================================================

      const createdLog = await api.dailyLogs.create(data);

      let calculationResult: any = null;

      if (pricePerUnit > 0) {
        try {
          calculationResult = await api.calculationHistory.create({
            dailyLogId: createdLog._id,
            pricePerUnit: Number(pricePerUnit),
          });

          toast.success("Đã thêm nhật ký và tính chi phí");
        } catch (calculationError) {
          console.error(
            "Nhật ký đã lưu nhưng tính chi phí thất bại:",
            calculationError
          );

          toast.warning(
            calculationError instanceof Error
              ? `Nhật ký đã được lưu nhưng chưa tính được chi phí: ${calculationError.message}`
              : "Nhật ký đã được lưu nhưng chưa tính được chi phí"
          );
        }
      } else {
        toast.success("Thêm nhật ký thành công");
      }

      // =====================================================
      // SYNC PARENT
      // Không để lỗi refresh làm hiểu nhầm rằng lưu thất bại
      // =====================================================

      try {
        await onSaved?.({
          dailyLog: createdLog,
          calculation: calculationResult,
        });
      } catch (syncError) {
        console.error("Đã lưu nhưng không thể đồng bộ giao diện:", syncError);
      }

      onClose();
    } catch (error) {
      console.error("Lưu daily log thất bại:", error);

      toast.error(
        error instanceof Error ? error.message : "Lưu nhật ký thất bại"
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // CLOSE
  // =====================================================

  const handleClose = () => {
    if (saving) {
      return;
    }

    setPricePerUnit(0);

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

            backgroundImage: "none",
          },
        },
      }}
    >
      <Box
        sx={{
          p: isMobile ? 2 : 3,
        }}
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <Box sx={{ mb: 3 }}>
          <Typography
            variant={isMobile ? "h6" : "h5"}
            sx={{
              fontWeight: 800,

              mb: 0.5,

              textAlign: "center",
            }}
          >
            {dailyLog ? "Sửa Nhật Ký Trong Ngày" : "Thêm Nhật Ký Trong Ngày"}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              textAlign: "center",
            }}
          >
            {dailyLog
              ? "Cập nhật thông tin nhật ký đã tạo"
              : "Nhập thông tin nhật ký và tính chi phí nếu đã có đơn giá"}
          </Typography>
        </Box>

        {/* =================================================
            OWNER + ANIMAL TYPE
        ================================================= */}

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

        {/* =================================================
            DATE
        ================================================= */}

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

        {/* =================================================
            QUANTITY
        ================================================= */}

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

        {/* =================================================
            COST SECTION
            CHỈ HIỆN KHI CREATE
        ================================================= */}

        {!dailyLog && (
          <>
            <Divider sx={{ my: 2 }} />

            <Box
              sx={{
                mb: 1.5,
                textAlign: "center",
              }}
            >
              <Typography
                sx={{
                  fontWeight: 800,
                }}
              >
                Chi Phí
              </Typography>

              <Typography variant="caption" color="text.secondary">
                Có thể bỏ trống và tính chi phí sau
              </Typography>
            </Box>

            {/* QUICK PRICE */}

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
                Chọn nhanh đơn giá
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: 1,
                }}
              >
                {quickPrices.map((price) => {
                  const selected = pricePerUnit === price;

                  return (
                    <Chip
                      key={price}
                      label={`${price / 1000}k`}
                      clickable
                      color={selected ? "primary" : "default"}
                      variant={selected ? "filled" : "outlined"}
                      onClick={() => setPricePerUnit(price)}
                      sx={{
                        minWidth: 70,
                        fontWeight: selected ? 800 : 600,
                      }}
                    />
                  );
                })}
              </Box>
            </Box>

            {/* PRICE INPUT */}

            <TextField
              fullWidth
              type="text"
              label="Đơn giá (đ/con)"
              value={formatMoneyInput(pricePerUnit)}
              onChange={(e) => {
                const rawValue = e.target.value.replace(/\D/g, "");

                setPricePerUnit(rawValue === "" ? 0 : Number(rawValue));
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
                pricePerUnit > 0
                  ? numberToVietnameseWords(pricePerUnit)
                  : "Nhập đơn giá nếu đã có"
              }
              sx={{
                mb: 1.5,

                "& .MuiInputBase-input": {
                  textAlign: "center",
                  fontWeight: 700,
                },

                "& .MuiFormHelperText-root": {
                  textAlign: "center",
                  fontStyle: "italic",
                  fontWeight: 500,
                  mx: 0,
                },
              }}
            />

            {/* TOTAL PREVIEW */}

            {pricePerUnit > 0 && formData.quantity > 0 && (
              <Box
                sx={(theme) => ({
                  mb: 2,

                  p: 2,

                  borderRadius: 2.5,

                  border: "1px solid",

                  borderColor: "success.main",

                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? "rgba(76,175,80,0.10)"
                      : "rgba(76,175,80,0.06)",

                  textAlign: "center",
                })}
              >
                <Typography variant="body2" color="text.secondary">
                  Tổng tiền dự kiến
                </Typography>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: "block",
                    mt: 0.25,
                  }}
                >
                  {formData.quantity} con × {formatMoney(pricePerUnit)}
                </Typography>

                <Typography
                  sx={{
                    mt: 0.75,

                    fontSize: {
                      xs: 22,
                      sm: 26,
                    },

                    fontWeight: 900,

                    color: "success.main",
                  }}
                >
                  {formatMoney(totalCost)}
                </Typography>
              </Box>
            )}
          </>
        )}

        {/* =================================================
            NOTES
        ================================================= */}

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

        {/* =================================================
            ACTIONS
        ================================================= */}

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
            startIcon={!dailyLog && pricePerUnit > 0 ? <Calculate /> : <Save />}
          >
            {saving
              ? "Đang lưu..."
              : dailyLog
              ? "Cập Nhật"
              : pricePerUnit > 0
              ? "Lưu & Tính Chi Phí"
              : "Lưu Nhật Ký"}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

export default DailyLogFormDialog;
