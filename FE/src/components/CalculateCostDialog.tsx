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

      alert(error instanceof Error ? error.message : "Không thể tính chi phí");
    }
  };

  const handleClose = () => {
    setPricePerUnit(0);
    setCostResult(null);
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
          type="number"
          value={pricePerUnit}
          onChange={(e) => setPricePerUnit(parseInt(e.target.value, 10) || 0)}
          slotProps={{
            htmlInput: {
              min: 1,
            },
          }}
          sx={{ mb: 2 }}
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
            sx={{
              mb: 2,
              borderRadius: 2.5,
              boxShadow: 0,
              border: "1px solid",
              borderColor: "divider",
              backgroundColor: "#f8fafc",
            }}
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
                <Typography variant="body2">
                  <strong>Ngày:</strong>{" "}
                  {costResult.date
                    ? dayjs(costResult.date).format("DD/MM/YYYY")
                    : "—"}
                </Typography>

                <Typography variant="body2">
                  <strong>Số con:</strong> {costResult.quantity ?? "—"}
                </Typography>

                <Typography variant="body2">
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
