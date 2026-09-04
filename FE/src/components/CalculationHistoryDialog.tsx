import { useEffect, useState } from "react";
import dayjs from "dayjs";

import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  IconButton,
  Paper,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import { Delete } from "@mui/icons-material";
import { api } from "@/utils/api";
import { toast } from "react-toastify";

interface CalculationHistoryDialogProps {
  open: boolean;
  onClose: () => void;
}

const CalculationHistoryDialog = ({
  open,
  onClose,
}: CalculationHistoryDialogProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [costHistory, setCostHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // ================= FETCH HISTORY =================
  const fetchCostHistory = async () => {
    try {
      setLoadingHistory(true);

      const data = await api.calculationHistory.getAll();

      setCostHistory(data);
    } catch (error) {
      console.error("Không thể tải lịch sử:", error);

      toast.error("Không thể tải lịch sử tính chi phí");
    }
  };

  // Mỗi lần mở dialog sẽ lấy dữ liệu mới nhất
  useEffect(() => {
    if (open) {
      fetchCostHistory();
    }
  }, [open]);

  // ================= HELPERS =================

  const getHistoryOwnerName = (item: any) => {
    if (typeof item.dailyLog === "object" && item.dailyLog?.owner) {
      return typeof item.dailyLog.owner === "string"
        ? item.dailyLog.owner
        : item.dailyLog.owner?.name || "—";
    }

    return "—";
  };

  const getHistoryAnimalTypeName = (item: any) => {
    if (typeof item.dailyLog === "object" && item.dailyLog?.animalType) {
      return typeof item.dailyLog.animalType === "string"
        ? item.dailyLog.animalType
        : item.dailyLog.animalType?.name || "—";
    }

    return "—";
  };

  const getCurrentLogDate = (item: any) => {
    if (typeof item.dailyLog === "object" && item.dailyLog?.date) {
      return item.dailyLog.date;
    }

    return item.date;
  };

  const getCurrentLogQuantity = (item: any) => {
    if (typeof item.dailyLog === "object" && item.dailyLog?.quantity != null) {
      return item.dailyLog.quantity;
    }

    return item.quantity;
  };

  const isLogDeleted = (item: any) => {
    return !item.dailyLog;
  };

  const isHistoryOutdated = (item: any) => {
    if (isLogDeleted(item)) {
      return false;
    }

    const currentDate = getCurrentLogDate(item);
    const currentQuantity = Number(getCurrentLogQuantity(item) || 0);

    const snapshotDate = item.date;
    const snapshotQuantity = Number(item.quantity || 0);

    const isDateChanged =
      dayjs(currentDate).format("YYYY-MM-DD") !==
      dayjs(snapshotDate).format("YYYY-MM-DD");

    const isQuantityChanged = currentQuantity !== snapshotQuantity;

    return isDateChanged || isQuantityChanged;
  };

  // ================= DELETE HISTORY =================

  const handleDeleteHistory = async (id: string) => {
    if (!confirm("Xóa lần tính này?")) {
      return;
    }

    try {
      await api.calculationHistory.delete(id);

      toast.success("Xóa lịch sử tính chi phí thành công");

      await fetchCostHistory();
    } catch (error) {
      console.error("Không thể xóa lịch sử:", error);

      toast.error(
        error instanceof Error ? error.message : "Xóa lịch sử thất bại"
      );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={isMobile}
      fullWidth
      maxWidth="md"
      slotProps={{
        paper: {
          sx: {
            borderRadius: isMobile ? 0 : 3,
            m: isMobile ? 0 : 2,

            height: isMobile ? "100dvh" : "90vh",
            maxHeight: isMobile ? "100dvh" : "90vh",

            overflow: "hidden",
          },
        },
      }}
    >
      <Box
        sx={{
          p: isMobile ? 2 : 3,
          height: "100%",
          minHeight: 0,

          display: "flex",
          flexDirection: "column",

          overflow: "hidden",
        }}
      >
        {/* ================= HEADER ================= */}
        <Box
          sx={{
            flexShrink: 0,

            backgroundColor: "background.paper",

            pb: 2,
            mb: 2,

            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 2,
            }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant={isMobile ? "h6" : "h5"}
                sx={{
                  fontWeight: 700,
                  mb: 0.5,
                }}
              >
                Lịch Sử Tính Chi Phí
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  lineHeight: 1.5,
                }}
              >
                Xem lại kết quả đã tính và trạng thái log hiện tại
              </Typography>
            </Box>

            <Button
              onClick={onClose}
              size="small"
              sx={{
                whiteSpace: "nowrap",
                minWidth: "auto",
              }}
            >
              Đóng
            </Button>
          </Box>
        </Box>

        {/* ================= CONTENT ================= */}

        {loadingHistory ? (
          <Paper
            sx={{
              p: 4,
              textAlign: "center",
              borderRadius: 3,
            }}
          >
            <Typography>Đang tải...</Typography>
          </Paper>
        ) : costHistory.length === 0 ? (
          <Paper
            sx={{
              p: 4,
              textAlign: "center",
              borderRadius: 3,
            }}
          >
            <Typography color="text.secondary">
              Chưa có lịch sử tính chi phí.
            </Typography>
          </Paper>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1.5,

              flex: 1,
              minHeight: 0,

              overflowY: "auto",
              overflowX: "hidden",

              pr: isMobile ? 0 : 1,
              pb: 2,

              scrollbarWidth: "thin",
            }}
          >
            {costHistory.map((item, index) => {
              const outdated = isHistoryOutdated(item);
              const deleted = isLogDeleted(item);

              return (
                <Card
                  key={item._id}
                  sx={{
                    borderRadius: 3,

                    boxShadow: isMobile ? 0 : 1,

                    border: "1px solid",

                    borderColor: deleted
                      ? "error.light"
                      : outdated
                      ? "warning.light"
                      : "divider",

                    flexShrink: 0,
                  }}
                >
                  <CardContent
                    sx={{
                      p: isMobile ? 1.5 : 2.5,

                      "&:last-child": {
                        pb: isMobile ? 1.5 : 2.5,
                      },
                    }}
                  >
                    {/* HEADER CARD */}

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 1.5,
                        mb: 1.5,
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 700,
                            mb: 0.5,
                          }}
                        >
                          Lần tính #{costHistory.length - index}
                        </Typography>

                        <Typography variant="caption" color="text.secondary">
                          {new Date(item.calculatedAt).toLocaleString("vi-VN")}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        {/* TRẠNG THÁI THANH TOÁN */}

                        {item.isPaid && (
                          <Typography
                            variant="caption"
                            color="success.main"
                            sx={{
                              fontWeight: 700,
                              whiteSpace: "nowrap",
                            }}
                          >
                            ✓ Đã nhận tiền
                          </Typography>
                        )}

                        {/* XÓA HISTORY */}

                        <IconButton
                          size="small"
                          color="error"
                          disabled={item.isPaid === true}
                          onClick={() => handleDeleteHistory(item._id)}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>

                    {/* STATUS */}

                    {deleted && (
                      <Box
                        sx={{
                          display: "inline-flex",

                          px: 1.25,
                          py: 0.5,

                          borderRadius: 999,

                          backgroundColor: "#ffebee",
                          color: "error.main",

                          fontSize: 12,
                          fontWeight: 600,

                          mb: 1.5,
                        }}
                      >
                        Log gốc đã bị xóa
                      </Box>
                    )}

                    {!deleted && outdated && (
                      <Box
                        sx={{
                          display: "inline-flex",

                          px: 1.25,
                          py: 0.5,

                          borderRadius: 999,

                          backgroundColor: "#fff3cd",
                          color: "#8a6d3b",

                          fontSize: 12,
                          fontWeight: 600,

                          mb: 1.5,
                        }}
                      >
                        Log hiện tại đã được cập nhật
                      </Box>
                    )}

                    {/* ================= CURRENT LOG ================= */}

                    {!deleted && (
                      <Box
                        sx={{
                          p: 1.5,

                          borderRadius: 2,

                          backgroundColor: "#f8fafc",

                          border: "1px solid",
                          borderColor: "divider",

                          mb: 1.25,
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{
                            mb: 1.25,
                            fontWeight: 700,
                          }}
                        >
                          Thông tin log hiện tại
                        </Typography>

                        <Box
                          sx={{
                            display: "grid",

                            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",

                            gap: 1,
                          }}
                        >
                          <Typography variant="body2">
                            <strong>Chủ:</strong> {getHistoryOwnerName(item)}
                          </Typography>

                          <Typography variant="body2">
                            <strong>Loại:</strong>{" "}
                            {getHistoryAnimalTypeName(item)}
                          </Typography>

                          <Typography variant="body2">
                            <strong>Ngày:</strong>{" "}
                            {getCurrentLogDate(item)
                              ? dayjs(getCurrentLogDate(item)).format(
                                  "DD/MM/YYYY"
                                )
                              : "—"}
                          </Typography>

                          <Typography variant="body2">
                            <strong>Số con:</strong>{" "}
                            {getCurrentLogQuantity(item) ?? "—"}
                          </Typography>
                        </Box>
                      </Box>
                    )}

                    {/* ================= SNAPSHOT ================= */}

                    <Box
                      sx={{
                        p: 1.5,

                        borderRadius: 2,

                        backgroundColor: "#eef6ff",

                        border: "1px solid",
                        borderColor: "#b6d4fe",
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{
                          mb: 1.25,

                          fontWeight: 700,

                          color: "primary.main",
                        }}
                      >
                        Kết quả tại thời điểm tính
                      </Typography>

                      <Box
                        sx={{
                          display: "grid",

                          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",

                          gap: 1,
                        }}
                      >
                        <Typography variant="body2">
                          <strong>Ngày lúc tính:</strong>{" "}
                          {item.date
                            ? dayjs(item.date).format("DD/MM/YYYY")
                            : "—"}
                        </Typography>

                        <Typography variant="body2">
                          <strong>Số con lúc tính:</strong>{" "}
                          {item.quantity ?? "—"}
                        </Typography>

                        <Typography variant="body2">
                          <strong>Đơn giá:</strong>{" "}
                          {Number(item.pricePerUnit || 0).toLocaleString(
                            "vi-VN"
                          )}
                          đ
                        </Typography>

                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 700,
                            color: "primary.main",
                          }}
                        >
                          Tổng tiền:{" "}
                          {Number(item.totalCost || 0).toLocaleString("vi-VN")}đ
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        )}
      </Box>
    </Dialog>
  );
};

export default CalculationHistoryDialog;
