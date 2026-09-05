import { useEffect, useState } from "react";
import dayjs from "dayjs";

import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import { api } from "@/utils/api";

import { toast } from "react-toastify";

interface CalculateCostDialogProps {
  open: boolean;
  onClose: () => void;
  dailyLogId: string | null;

  onCalculated?: (result: any) => void | Promise<void>;
}

const CalculateCostDialog = ({
  open,
  onClose,
  dailyLogId,
  onCalculated,
}: CalculateCostDialogProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [pricePerUnit, setPricePerUnit] = useState(0);
  const [costResult, setCostResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  // Reset dữ liệu mỗi lần mở log khác hoặc đóng dialog
  useEffect(() => {
    setPricePerUnit(0);
    setCostResult(null);
  }, [dailyLogId, open]);

  const handleCalculateCost = async () => {
    if (!dailyLogId) {
      toast.error("Không tìm thấy Daily Log");

      return;
    }

    if (pricePerUnit <= 0) {
      toast.warning("Đơn giá phải lớn hơn 0");

      return;
    }

    try {
      setLoading(true);

      const result = await api.calculationHistory.create({
        dailyLogId,
        pricePerUnit: Number(pricePerUnit),
      });

      setCostResult(result);

      await onCalculated?.(result);

      toast.success("Tính chi phí thành công");
    } catch (error) {
      console.error("Không thể tính chi phí:", error);

      toast.error(
        error instanceof Error ? error.message : "Không thể tính chi phí"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPricePerUnit(0);
    setCostResult(null);
    onClose();
  };

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
          minWidth: isMobile ? "auto" : 400,
        }}
      >
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              mb: 0.5,
              textAlign: "center",
            }}
          >
            Tính Chi Phí
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: "center" }}
          >
            Nhập đơn giá cho nhật ký trong ngày này
          </Typography>
        </Box>

        {/* Input */}
        <TextField
          fullWidth
          label="Đơn giá (đ/con)"
          type="text"
          value={formatMoneyInput(pricePerUnit)}
          onChange={(e) => {
            const rawValue = e.target.value.replace(/\D/g, "");

            setPricePerUnit(rawValue === "" ? 0 : Number(rawValue));
          }}
          slotProps={{
            htmlInput: {
              inputMode: "numeric",
            },
          }}
          helperText={
            pricePerUnit > 0
              ? numberToVietnameseWords(pricePerUnit)
              : "Nhập đơn giá cho mỗi con"
          }
          sx={{
            mb: 2,

            "& .MuiFormHelperText-root": {
              fontStyle: "italic",
              fontWeight: 500,
            },
          }}
        />

        <Button
          variant="contained"
          fullWidth
          disabled={loading || pricePerUnit <= 0}
          onClick={handleCalculateCost}
          sx={{
            py: 1.2,
            mb: 2,
          }}
        >
          {loading ? "Đang tính..." : "Tính Chi Phí"}
        </Button>

        {/* Kết quả */}
        {costResult && (
          <Card
            sx={(theme) => ({
              mb: 2,
              borderRadius: 2.5,
              boxShadow: 0,

              border: "1px solid",

              borderColor:
                theme.palette.mode === "dark"
                  ? "rgba(144, 202, 249, 0.22)"
                  : "divider",

              backgroundColor:
                theme.palette.mode === "dark"
                  ? "rgba(30, 41, 59, 0.75)"
                  : "#f8fafc",
            })}
          >
            <CardContent
              sx={{
                p: 2,
                "&:last-child": {
                  pb: 2,
                },
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                  mb: 1.5,
                  color: "text.primary",
                }}
              >
                Kết Quả
              </Typography>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                  gap: 1,
                }}
              >
                <Typography color="text.primary" variant="body2">
                  <strong>Ngày:</strong>{" "}
                  {costResult.date
                    ? dayjs(costResult.date).format("DD/MM/YYYY")
                    : "—"}
                </Typography>

                <Typography color="text.primary" variant="body2">
                  <strong>Số con:</strong> {costResult.quantity ?? "—"}
                </Typography>

                <Typography color="text.primary" variant="body2">
                  <strong>Đơn giá:</strong>{" "}
                  {Number(costResult.pricePerUnit || 0).toLocaleString("vi-VN")}
                  đ
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 700,
                    color: "primary.main",
                  }}
                >
                  Tổng tiền:{" "}
                  {Number(costResult.totalCost || 0).toLocaleString("vi-VN")}đ
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <Button onClick={handleClose}>Đóng</Button>
        </Box>
      </Box>
    </Dialog>
  );
};

export default CalculateCostDialog;
