import { useState, useEffect, useMemo } from "react";
import dayjs, { Dayjs } from "dayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import * as XLSX from "xlsx";

import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Select,
  MenuItem,
  Typography,
  IconButton,
  Card,
  CardContent,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import {
  Edit,
  Delete,
  Add,
  Calculate,
  FilterAlt,
  History,
  Share,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { api } from "@/utils/api";

import CalculationHistoryDialog from "@/components/CalculationHistoryDialog";
import CalculateCostDialog from "@/components/CalculateCostDialog";
import DailyLogFormDialog from "@/components/DailyLogFormDialog";
import OwnerMonthlyReportDialog from "@/components/OwnerMonthlyReportDialog";

const Batches = () => {
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // ================= DATA =================

  const [owners, setOwners] = useState<Owners.Owner[]>([]);

  const [animalTypes, setAnimalTypes] = useState<AnimalTypes.AnimalType[]>([]);

  const [dailyLogs, setDailyLogs] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);

  // ================= DAILY LOG FORM =================

  const [open, setOpen] = useState(false);

  const [editingDailyLog, setEditingDailyLog] = useState<any | null>(null);

  // ================= CALCULATE =================

  const [costOpen, setCostOpen] = useState(false);

  const [selectedDailyLogId, setSelectedDailyLogId] = useState<string | null>(
    null
  );

  // ================= HISTORY =================

  const [costHistoryOpen, setCostHistoryOpen] = useState(false);

  const [payingMonth, setPayingMonth] = useState(false);

  const [ownerReportOpen, setOwnerReportOpen] = useState(false);

  // ================= FILTER =================

  const [searchText, setSearchText] = useState("");

  const [filterOwner, setFilterOwner] = useState("");

  const [filterAnimalType, setFilterAnimalType] = useState("");

  const [filterMonth, setFilterMonth] = useState<Dayjs | null>(dayjs());

  const [filterDate, setFilterDate] = useState<Dayjs | null>(null);

  // ================= MONTH SUMMARY =================

  const [monthSummary, setMonthSummary] = useState<any | null>(null);

  const [loadingMonthSummary, setLoadingMonthSummary] = useState(false);

  // =====================================================
  // FETCH
  // =====================================================

  useEffect(() => {
    fetchDailyLogs();
    fetchOwners();
    fetchAnimalTypes();
  }, []);

  ////
  const fetchDailyLogs = async () => {
    try {
      setLoading(true);

      const data = await api.dailyLogs.getAll();

      setDailyLogs(data);
    } catch (error) {
      console.error("Không thể tải daily logs:", error);

      toast.error("Không thể tải danh sách nhật ký");
    } finally {
      setLoading(false);
    }
  };
  ///
  const fetchOwners = async () => {
    try {
      const data = await api.owners.getAll();

      setOwners(data);
    } catch (error) {
      console.error("Không thể tải owners:", error);
    }
  };

  const fetchAnimalTypes = async () => {
    try {
      const data = await api.animalTypes.getAll();

      setAnimalTypes(data);
    } catch (error) {
      console.error("Không thể tải animal types:", error);
    }
  };
  /// fetchAnimalTypes
  useEffect(() => {
    if (filterAnimalType || animalTypes.length === 0) {
      return;
    }

    const defaultType = animalTypes.find(
      (type) => type.name.trim().toLowerCase() === "heo"
    );

    if (defaultType) {
      setFilterAnimalType(defaultType._id);
      setMonthSummary(null);
    }
  }, [animalTypes, filterAnimalType]);
  ///

  // =====================================================
  // FILTER
  // =====================================================

  const filteredDailyLogs = useMemo(() => {
    return dailyLogs.filter((dailyLog) => {
      const ownerName =
        typeof dailyLog.owner === "string"
          ? dailyLog.owner
          : dailyLog.owner?.name || "";

      const animalTypeName =
        typeof dailyLog.animalType === "string"
          ? dailyLog.animalType
          : dailyLog.animalType?.name || "";

      const dateText = dailyLog.date
        ? dayjs(dailyLog.date).format("DD/MM/YYYY")
        : "";

      const keyword = searchText.toLowerCase().trim();

      const matchSearch =
        !keyword ||
        ownerName.toLowerCase().includes(keyword) ||
        animalTypeName.toLowerCase().includes(keyword) ||
        dateText.includes(keyword);

      const ownerId =
        typeof dailyLog.owner === "string"
          ? dailyLog.owner
          : dailyLog.owner?._id;

      const animalTypeId =
        typeof dailyLog.animalType === "string"
          ? dailyLog.animalType
          : dailyLog.animalType?._id;

      const matchOwner = !filterOwner || ownerId === filterOwner;

      const matchAnimalType =
        !filterAnimalType || animalTypeId === filterAnimalType;

      const logDate = dayjs(dailyLog.date);

      const matchMonth =
        !filterMonth ||
        logDate.format("YYYY-MM") === filterMonth.format("YYYY-MM");

      const matchDate =
        !filterDate ||
        logDate.format("YYYY-MM-DD") === filterDate.format("YYYY-MM-DD");

      return (
        matchSearch && matchOwner && matchAnimalType && matchMonth && matchDate
      );
    });
  }, [
    dailyLogs,
    searchText,
    filterOwner,
    filterAnimalType,
    filterMonth,
    filterDate,
  ]);

  // =====================================================
  // RESET FILTER
  // =====================================================

  const handleResetFilter = () => {
    setSearchText("");

    setFilterOwner("");

    setFilterAnimalType("");

    // Quay về tháng hiện tại
    setFilterMonth(dayjs());

    // Không chọn ngày cụ thể
    setFilterDate(null);

    // Xóa kết quả tổng tháng
    setMonthSummary(null);
  };

  // =====================================================
  // MONTH SUMMARY
  // =====================================================

  const handleMonthSummary = async () => {
    if (!filterOwner || !filterAnimalType) {
      toast.warning("Vui lòng chọn chủ và loại động vật");
      return;
    }

    try {
      setLoadingMonthSummary(true);

      const month = (filterMonth || dayjs()).format("YYYY-MM");

      const result = await api.dailyLogs.monthSummary(
        filterOwner,
        filterAnimalType,
        month
      );

      setMonthSummary(result);

      toast.success("Tổng hợp tháng thành công");
    } catch (error) {
      console.error("Không thể tổng hợp tháng:", error);

      toast.error(
        error instanceof Error ? error.message : "Không thể tổng hợp tháng"
      );
    } finally {
      setLoadingMonthSummary(false);
    }
  };

  // =====================================================
  // OPEN / CLOSE DAILY LOG FORM
  // =====================================================

  const handleOpen = (dailyLog?: any) => {
    setEditingDailyLog(dailyLog || null);

    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);

    setEditingDailyLog(null);
  };

  /// xlxs
  const handleExportExcel = () => {
    if (filteredDailyLogs.length === 0) {
      toast.warning("Không có dữ liệu để xuất");
      return;
    }

    const exportData = filteredDailyLogs.map((log: any, index: number) => {
      const calculation = log.latestCalculation;

      const ownerName =
        typeof log.owner === "string" ? log.owner : log.owner?.name || "";

      const animalTypeName =
        typeof log.animalType === "string"
          ? log.animalType
          : log.animalType?.name || "";

      return {
        STT: index + 1,

        Ngày: dayjs(log.date).format("DD/MM/YYYY"),

        "Chủ động vật": ownerName,

        "Loại động vật": animalTypeName,

        "Số con": Number(log.quantity || 0),

        "Giá / Con": calculation ? Number(calculation.pricePerUnit || 0) : "",

        "Tổng Tiền": calculation ? Number(calculation.totalCost || 0) : "",

        "Thanh Toán": !calculation
          ? "Chưa tính"
          : calculation.isPaid
          ? "Đã nhận tiền"
          : "Chưa nhận tiền",

        "Ngày Nhận Tiền": calculation?.paidAt
          ? dayjs(calculation.paidAt).format("DD/MM/YYYY HH:mm")
          : "",

        "Ghi Chú": log.notes || "",
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Độ rộng các cột
    worksheet["!cols"] = [
      { wch: 6 }, // STT
      { wch: 14 }, // Ngày
      { wch: 22 }, // Chủ
      { wch: 18 }, // Loại
      { wch: 10 }, // Số con
      { wch: 15 }, // Giá
      { wch: 18 }, // Tổng
      { wch: 20 }, // Thanh toán
      { wch: 22 }, // Ngày nhận
      { wch: 30 }, // Ghi chú
    ];

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Daily Logs");

    const monthText = filterMonth
      ? filterMonth.format("YYYY-MM")
      : dayjs().format("YYYY-MM");

    XLSX.writeFile(workbook, `NhatKyGietMo_${monthText}.xlsx`);

    toast.success("Tải file Excel thành công");
  };

  ///

  // =====================================================
  // DELETE DAILY LOG
  // =====================================================

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Bạn có chắc chắn muốn xóa ngày này?");

    if (!confirmed) {
      return;
    }

    try {
      await api.dailyLogs.delete(id);

      toast.success("Xóa nhật ký thành công");

      await fetchDailyLogs();

      if (selectedDailyLogId === id) {
        setSelectedDailyLogId(null);
      }

      // Nếu đang mở tổng tháng
      // thì cập nhật lại luôn
      if (monthSummary && filterOwner && filterAnimalType) {
        await handleMonthSummary();
      }
    } catch (error) {
      console.error("Xóa daily log thất bại:", error);

      toast.error(
        error instanceof Error ? error.message : "Xóa nhật ký thất bại"
      );
    }
  };
  ///
  const handleMarkAsPaid = async (dailyLog: any) => {
    const calculation = dailyLog.latestCalculation;

    if (!calculation?._id) {
      toast.warning("Daily Log này chưa được tính chi phí");
      return;
    }

    if (calculation.isPaid) {
      toast.info("Daily Log này đã nhận tiền");
      return;
    }

    const confirmed = window.confirm(
      `Xác nhận đã nhận ${Number(calculation.totalCost || 0).toLocaleString(
        "vi-VN"
      )}đ?`
    );

    if (!confirmed) {
      return;
    }

    try {
      const result = await api.calculationHistory.markAsPaid(calculation._id);

      setDailyLogs((prev) =>
        prev.map((log) =>
          log._id === dailyLog._id
            ? {
                ...log,

                latestCalculation: {
                  ...log.latestCalculation,

                  isPaid: true,

                  paidAt: result.paidAt || new Date().toISOString(),
                },
              }
            : log
        )
      );

      toast.success("Đã xác nhận nhận tiền");

      if (monthSummary && filterOwner && filterAnimalType) {
        await handleMonthSummary();
      }
    } catch (error) {
      console.error("Xác nhận thanh toán thất bại:", error);

      toast.error(
        error instanceof Error ? error.message : "Không thể xác nhận thanh toán"
      );
    }
  };
  /// take month

  const handleMarkMonthAsPaid = async () => {
    if (!filterOwner || !filterAnimalType || !filterMonth) {
      toast.warning("Vui lòng chọn chủ, loại động vật và tháng");
      return;
    }

    if (!monthSummary || Number(monthSummary.unpaidDays || 0) <= 0) {
      toast.info("Không có ngày nào cần xác nhận thanh toán");

      return;
    }

    const unpaidDays = Number(monthSummary.unpaidDays || 0);

    const totalUnpaid = Number(monthSummary.totalUnpaid || 0);

    const confirmed = window.confirm(
      `Xác nhận đã nhận tiền cho ${unpaidDays} ngày chưa thanh toán?\n\n` +
        `Tổng số tiền: ${totalUnpaid.toLocaleString("vi-VN")}đ`
    );

    if (!confirmed) {
      return;
    }

    try {
      setPayingMonth(true);

      const result = await api.calculationHistory.markMonthAsPaid({
        ownerId: filterOwner,

        animalTypeId: filterAnimalType,

        month: filterMonth.format("YYYY-MM"),
      });

      toast.success(
        result.message || `Đã xác nhận ${result.updatedCount} ngày`
      );

      // Refresh table
      await fetchDailyLogs();

      // Refresh tổng tháng
      await handleMonthSummary();
    } catch (error) {
      console.error("Không thể xác nhận thanh toán tháng:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Không thể xác nhận thanh toán tháng"
      );
    } finally {
      setPayingMonth(false);
    }
  };
  ///

  // =====================================================
  // FORMAT MONEY
  // =====================================================

  const formatMoney = (value: number) => {
    return `${Number(value || 0).toLocaleString("vi-VN")}đ`;
  };

  ///
  const handleCalculationUpdated = async (result: any) => {
    const dailyLogId =
      typeof result.dailyLog === "string"
        ? result.dailyLog
        : result.dailyLog?._id || selectedDailyLogId;

    if (!dailyLogId) {
      return;
    }

    // Update UI ngay lập tức
    setDailyLogs((prev) =>
      prev.map((log) =>
        log._id === dailyLogId
          ? {
              ...log,
              latestCalculation: result,
            }
          : log
      )
    );

    // Đồng bộ lại với backend
    try {
      const freshLogs = await api.dailyLogs.getAll();

      const updatedLog = freshLogs.find((log) => log._id === dailyLogId);

      // Chỉ replace nếu backend đã trả latestCalculation
      if (updatedLog?.latestCalculation) {
        setDailyLogs(freshLogs);
      }
    } catch (error) {
      console.error("Không thể refresh DailyLog:", error);
    }
  };
  ///
  const selectedOwner = owners.find((owner) => owner._id === filterOwner);

  const selectedAnimalType = animalTypes.find(
    (type) => type._id === filterAnimalType
  );
  ///

  return (
    <>
      <Box>
        {/* =====================================================
            HEADER
        ===================================================== */}

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",

            mb: 3,

            flexDirection: isMobile ? "column" : "row",

            gap: isMobile ? 2 : 0,
          }}
        >
          <Typography variant={isMobile ? "h5" : "h4"}>
            Nhật Ký Giết Mổ
          </Typography>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpen()}
            fullWidth={isMobile}
          >
            Thêm Nhật Ký
          </Button>
        </Box>

        {/* =====================================================
            FILTER
        ===================================================== */}

        <Paper
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 2,
            }}
          >
            <FilterAlt color="primary" />

            <Typography variant="h6">Bộ Lọc</Typography>
          </Box>

          {/* ================= INPUT FILTER ================= */}

          <Box
            sx={{
              display: "grid",

              gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr 1fr 1fr 1fr",

              gap: 2,
            }}
          >
            {/* SEARCH */}

            <TextField
              fullWidth
              size="small"
              label="Tìm kiếm"
              placeholder="Tên chủ, loại, ngày..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />

            {/* OWNER */}

            <Select
              fullWidth
              size="small"
              displayEmpty
              value={filterOwner}
              onChange={(e) => {
                setFilterOwner(e.target.value);

                setMonthSummary(null);
              }}
            >
              <MenuItem value="">Tất cả chủ</MenuItem>

              {owners.map((owner) => (
                <MenuItem key={owner._id} value={owner._id}>
                  {owner.name}
                </MenuItem>
              ))}
            </Select>

            {/* ANIMAL TYPE */}

            <Select
              fullWidth
              size="small"
              displayEmpty
              value={filterAnimalType}
              onChange={(e) => {
                setFilterAnimalType(e.target.value);

                setMonthSummary(null);
              }}
            >
              <MenuItem value="">Tất cả loại</MenuItem>

              {animalTypes.map((type) => (
                <MenuItem key={type._id} value={type._id}>
                  {type.name}
                </MenuItem>
              ))}
            </Select>

            {/* MONTH */}

            <DatePicker
              label="Tháng"
              views={["year", "month"]}
              value={filterMonth}
              onChange={(newValue) => {
                setFilterMonth(newValue);

                // Đổi tháng
                // thì bỏ ngày đang chọn
                setFilterDate(null);

                setMonthSummary(null);
              }}
              format="MM/YYYY"
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: "small",
                },
              }}
            />

            {/* DATE */}

            <DatePicker
              label="Ngày"
              value={filterDate}
              onChange={(newValue) => {
                setFilterDate(newValue);

                // Chọn ngày
                // tự đồng bộ tháng
                if (newValue) {
                  setFilterMonth(newValue.startOf("month"));
                }
              }}
              format="DD/MM/YYYY"
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: "small",
                },
              }}
            />
          </Box>

          {/* ================= FILTER ACTIONS + COUNT ================= */}

          <Box
            sx={{
              mt: 2,
              display: "flex",
              flexDirection: {
                xs: "column",
                md: "row",
              },
              alignItems: {
                xs: "stretch",
                md: "center",
              },
              justifyContent: "space-between",
              gap: 1.5,
            }}
          >
            {/* COUNT */}

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                textAlign: {
                  xs: "center",
                  md: "left",
                },
                order: {
                  xs: 2,
                  md: 1,
                },
              }}
            >
              Đang hiển thị{" "}
              <Box
                component="span"
                sx={{
                  fontWeight: 700,
                  color: "text.primary",
                }}
              >
                {filteredDailyLogs.length}
              </Box>{" "}
              / {dailyLogs.length} ngày
            </Typography>

            {/* ACTIONS */}

            <Box
              sx={{
                display: "flex",
                gap: 1,
                flexDirection: {
                  xs: "column",
                  sm: "row",
                },
                justifyContent: {
                  xs: "stretch",
                  md: "flex-end",
                },
                order: {
                  xs: 1,
                  md: 2,
                },
              }}
            >
              <Button
                variant="contained"
                onClick={handleMonthSummary}
                disabled={!filterOwner || !filterAnimalType}
                sx={{
                  minWidth: {
                    sm: 145,
                  },
                }}
              >
                TỔNG THÁNG
              </Button>

              <Button
                variant="outlined"
                onClick={handleExportExcel}
                disabled={filteredDailyLogs.length === 0}
                sx={{
                  minWidth: {
                    sm: 135,
                    color: "green",
                    borderColor: "green",
                  },
                }}
              >
                TẢI EXCEL
              </Button>

              <Button
                variant="outlined"
                startIcon={<Share />}
                disabled={
                  !filterOwner ||
                  !filterAnimalType ||
                  !filterMonth ||
                  !monthSummary
                }
                onClick={() => setOwnerReportOpen(true)}
              >
                Báo Cáo Tháng
              </Button>
            </Box>
          </Box>

          {/* =====================================================
              MONTH SUMMARY
          ===================================================== */}

          {monthSummary && (
            <Box
              sx={(theme) => ({
                mt: 2.5,

                p: {
                  xs: 2,
                  md: 2.5,
                },

                borderRadius: 2.5,

                border: "1px solid",

                borderColor:
                  theme.palette.mode === "dark"
                    ? "rgba(144, 202, 249, 0.25)"
                    : "primary.light",

                backgroundColor:
                  theme.palette.mode === "dark"
                    ? "rgba(30, 41, 59, 0.55)"
                    : "#eef6ff",
              })}
            >
              {/* ================= SUMMARY GRID ================= */}

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "repeat(2, minmax(0, 1fr))",
                    md: "repeat(3, minmax(0, 1fr))",
                  },
                  gap: {
                    xs: 1.5,
                    md: 2,
                  },
                }}
              >
                {/* THÁNG */}

                <Box
                  sx={(theme) => ({
                    p: 1.5,

                    textAlign: "center",

                    borderRadius: 2,

                    border: "1px solid",

                    borderColor:
                      theme.palette.mode === "dark"
                        ? "rgba(255,255,255,0.07)"
                        : "transparent",

                    backgroundColor:
                      theme.palette.mode === "dark"
                        ? "rgba(15, 23, 42, 0.7)"
                        : "background.paper",
                  })}
                >
                  <Typography variant="caption" color="text.secondary">
                    Tháng
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.25,
                      fontWeight: 700,
                      fontSize: 17,
                    }}
                  >
                    {dayjs(`${monthSummary.month}-01`).format("MM/YYYY")}
                  </Typography>
                </Box>

                {/* TỔNG NGÀY */}

                <Box
                  sx={(theme) => ({
                    p: 1.5,

                    textAlign: "center",

                    borderRadius: 2,

                    border: "1px solid",

                    borderColor:
                      theme.palette.mode === "dark"
                        ? "rgba(255,255,255,0.07)"
                        : "transparent",

                    backgroundColor:
                      theme.palette.mode === "dark"
                        ? "rgba(15, 23, 42, 0.7)"
                        : "background.paper",
                  })}
                >
                  <Typography variant="caption" color="text.secondary">
                    Tổng số ngày có log
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.25,
                      fontWeight: 700,
                      fontSize: 17,
                    }}
                  >
                    {monthSummary.totalDays || 0} ngày
                  </Typography>
                </Box>

                {/* TỔNG SỐ CON */}

                <Box
                  sx={(theme) => ({
                    p: 1.5,

                    textAlign: "center",

                    borderRadius: 2,

                    border: "1px solid",

                    borderColor:
                      theme.palette.mode === "dark"
                        ? "rgba(255,255,255,0.07)"
                        : "transparent",

                    backgroundColor:
                      theme.palette.mode === "dark"
                        ? "rgba(15, 23, 42, 0.7)"
                        : "background.paper",
                  })}
                >
                  <Typography variant="caption" color="text.secondary">
                    Tổng số con
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.25,
                      fontWeight: 700,
                      color: "primary.main",
                      fontSize: 17,
                    }}
                  >
                    {Number(monthSummary.totalQuantity || 0).toLocaleString(
                      "vi-VN"
                    )}{" "}
                    con
                  </Typography>
                </Box>

                {/* TỔNG TIỀN */}

                <Box
                  sx={(theme) => ({
                    p: 1.5,

                    textAlign: "center",

                    borderRadius: 2,

                    border: "1px solid",

                    borderColor:
                      theme.palette.mode === "dark"
                        ? "rgba(255,255,255,0.07)"
                        : "transparent",

                    backgroundColor:
                      theme.palette.mode === "dark"
                        ? "rgba(15, 23, 42, 0.7)"
                        : "background.paper",
                  })}
                >
                  <Typography variant="caption" color="text.secondary">
                    Tổng tiền
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.25,
                      fontWeight: 700,
                      fontSize: 18,
                    }}
                  >
                    {formatMoney(monthSummary.totalCost || 0)}
                  </Typography>
                </Box>

                {/* ĐÃ NHẬN */}

                <Box
                  sx={(theme) => ({
                    p: 1.5,

                    textAlign: "center",

                    borderRadius: 2,

                    border: "1px solid",

                    borderColor:
                      theme.palette.mode === "dark"
                        ? "rgba(255,255,255,0.07)"
                        : "transparent",

                    backgroundColor:
                      theme.palette.mode === "dark"
                        ? "rgba(15, 23, 42, 0.7)"
                        : "background.paper",
                  })}
                >
                  <Typography variant="caption" color="text.secondary">
                    Đã nhận
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.25,
                      fontWeight: 700,
                      color: "success.main",
                      fontSize: 18,
                    }}
                  >
                    {formatMoney(monthSummary.totalPaid || 0)}
                  </Typography>
                </Box>

                {/* CHƯA NHẬN */}

                <Box
                  sx={(theme) => ({
                    p: 1.5,

                    textAlign: "center",

                    borderRadius: 2,

                    border: "1px solid",

                    borderColor:
                      theme.palette.mode === "dark"
                        ? "rgba(255,255,255,0.07)"
                        : "transparent",

                    backgroundColor:
                      theme.palette.mode === "dark"
                        ? "rgba(15, 23, 42, 0.7)"
                        : "background.paper",
                  })}
                >
                  <Typography variant="caption" color="text.secondary">
                    Chưa nhận
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.25,
                      fontWeight: 700,
                      color: "warning.main",
                      fontSize: 18,
                    }}
                  >
                    {formatMoney(monthSummary.totalUnpaid || 0)}
                  </Typography>
                </Box>
              </Box>

              {/* ================= FOOTER ================= */}

              <Box
                sx={{
                  mt: 2,
                  pt: 2,
                  borderTop: "1px solid",
                  borderColor: "divider",

                  display: "flex",

                  flexDirection: {
                    xs: "column",
                    md: "row",
                  },

                  alignItems: {
                    xs: "stretch",
                    md: "center",
                  },

                  justifyContent: "space-between",

                  gap: 2,
                }}
              >
                {/* STATUS */}

                <Box
                  sx={{
                    textAlign: {
                      xs: "center",
                      md: "left",
                    },
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 700,
                      color: "text.primary",
                    }}
                  >
                    Đã nhận tiền {monthSummary.paidDays || 0} /{" "}
                    {monthSummary.calculatedDays || 0} ngày đã tính
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      mt: 0.5,
                      color: "text.secondary",
                    }}
                  >
                    Đã tính chi phí {monthSummary.calculatedDays || 0} /{" "}
                    {monthSummary.totalDays || 0} ngày
                  </Typography>
                </Box>
                {/* PAYMENT ACTION */}

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: {
                      xs: "center",
                      md: "flex-end",
                    },
                  }}
                >
                  {Number(monthSummary.unpaidDays || 0) > 0 ? (
                    <Button
                      variant="contained"
                      color="success"
                      disabled={payingMonth}
                      onClick={handleMarkMonthAsPaid}
                      sx={{
                        minWidth: {
                          xs: "100%",
                          sm: 280,
                        },
                        minHeight: 42,
                      }}
                    >
                      {payingMonth
                        ? "ĐANG XÁC NHẬN..."
                        : `XÁC NHẬN ĐÃ NHẬN TẤT CẢ (${monthSummary.unpaidDays} NGÀY)`}
                    </Button>
                  ) : Number(monthSummary.calculatedDays || 0) > 0 ? (
                    <Box
                      sx={{
                        px: 2,
                        py: 1,
                        borderRadius: 2,
                        backgroundColor: "success.main",
                        color: "success.contrastText",
                        fontWeight: 700,
                        fontSize: 14,
                        textAlign: "center",
                        whiteSpace: "nowrap",
                      }}
                    >
                      ✓ ĐÃ NHẬN TIỀN TẤT CẢ
                    </Box>
                  ) : null}
                </Box>
              </Box>
            </Box>
          )}
        </Paper>

        {/* =====================================================
            HISTORY BUTTON
        ===================================================== */}

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mb: 3,
          }}
        >
          <Button
            variant="outlined"
            startIcon={<History />}
            onClick={() => setCostHistoryOpen(true)}
          >
            Xem lịch sử tính chi phí
          </Button>
        </Box>

        {/* =====================================================
            DAILY LOG LIST
        ===================================================== */}

        {loading ? (
          <Paper
            sx={{
              p: 4,
              textAlign: "center",
            }}
          >
            <Typography>Đang tải...</Typography>
          </Paper>
        ) : filteredDailyLogs.length === 0 ? (
          <Paper
            sx={{
              p: 4,
              textAlign: "center",
            }}
          >
            <Typography color="text.secondary">Chưa có dữ liệu.</Typography>
          </Paper>
        ) : isMobile ? (
          /* =====================================================
              MOBILE
          ===================================================== */

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {filteredDailyLogs.map((dailyLog) => {
              const calculation = dailyLog.latestCalculation;

              return (
                <Card
                  key={dailyLog._id}
                  sx={{
                    borderRadius: 2,
                  }}
                >
                  <CardContent>
                    {/* DATE */}

                    <Typography
                      variant="h6"
                      sx={{
                        mb: 1,
                        fontWeight: "bold",
                        textAlign: "center",
                      }}
                    >
                      {dayjs(dailyLog.date).format("DD/MM/YYYY")}
                    </Typography>

                    {/* OWNER */}

                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Chủ:</strong>{" "}
                      {typeof dailyLog.owner === "string"
                        ? dailyLog.owner
                        : dailyLog.owner?.name || "—"}
                    </Typography>

                    {/* ANIMAL */}

                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Loại:</strong>{" "}
                      {typeof dailyLog.animalType === "string"
                        ? dailyLog.animalType
                        : dailyLog.animalType?.name || "—"}
                    </Typography>

                    {/* QUANTITY */}

                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Số con:</strong> {dailyLog.quantity}
                    </Typography>

                    {/* PRICE */}

                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Giá / con:</strong>{" "}
                      {calculation
                        ? formatMoney(calculation.pricePerUnit)
                        : "—"}
                    </Typography>

                    {/* TOTAL */}

                    <Typography
                      variant="body2"
                      sx={{
                        mb: 0.5,

                        fontWeight: calculation ? 600 : 400,

                        color: calculation ? "primary.main" : "text.secondary",
                      }}
                    >
                      <strong>Tổng tiền:</strong>{" "}
                      {calculation ? formatMoney(calculation.totalCost) : "—"}
                    </Typography>

                    {/* NOTES */}

                    {dailyLog.notes && (
                      <Typography
                        variant="body2"
                        sx={{
                          mb: 1,
                        }}
                      >
                        <strong>Ghi chú:</strong> {dailyLog.notes}
                      </Typography>
                    )}

                    {/* PAYMENT STATUS */}

                    <Box sx={{ mt: 1.5 }}>
                      {!calculation ? (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            fontWeight: 600,
                            textAlign: "center",
                          }}
                        >
                          Chưa tính chi phí
                        </Typography>
                      ) : calculation.isPaid ? (
                        <Typography
                          variant="body2"
                          color="success.main"
                          sx={{
                            fontWeight: 700,
                            textAlign: "center",
                          }}
                        >
                          ✓ Đã nhận tiền
                        </Typography>
                      ) : (
                        <Button
                          size="small"
                          variant="outlined"
                          color="success"
                          fullWidth
                          onClick={() => handleMarkAsPaid(dailyLog)}
                        >
                          Xác nhận đã nhận tiền
                        </Button>
                      )}
                    </Box>

                    {/* ACTIONS */}

                    <Box
                      sx={{
                        display: "flex",

                        gap: 1.5,

                        mt: 2,

                        justifyContent: "center",

                        alignItems: "center",
                      }}
                    >
                      {/* CALCULATE */}

                      {!calculation?.isPaid && (
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => {
                            setSelectedDailyLogId(dailyLog._id);

                            setCostOpen(true);
                          }}
                          title={
                            calculation ? "Tính lại chi phí" : "Tính chi phí"
                          }
                        >
                          <Calculate fontSize="small" />
                        </IconButton>
                      )}

                      {/* EDIT */}

                      <IconButton
                        size="small"
                        onClick={() => handleOpen(dailyLog)}
                      >
                        <Edit fontSize="small" />
                      </IconButton>

                      {/* DELETE */}

                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(dailyLog._id)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        ) : (
          /* =====================================================
              DESKTOP
          ===================================================== */

          <TableContainer
            component={Paper}
            sx={(theme) => ({
              p: 1.5,

              textAlign: "center",

              borderRadius: 2,

              border: "1px solid",

              borderColor:
                theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.07)"
                  : "transparent",

              backgroundColor:
                theme.palette.mode === "dark"
                  ? "rgba(15, 23, 42, 0.7)"
                  : "background.paper",
            })}
          >
            <Table>
              {/* ================= TABLE HEAD ================= */}

              <TableHead>
                <TableRow
                  sx={(theme) => ({
                    backgroundColor:
                      theme.palette.mode === "dark" ? "#1e293b" : "#f5f7fa",

                    "& .MuiTableCell-head": {
                      color:
                        theme.palette.mode === "dark"
                          ? "#f8fafc"
                          : theme.palette.text.primary,

                      fontWeight: 700,

                      borderBottom: "1px solid",
                      borderColor: "divider",
                    },
                  })}
                >
                  <TableCell>Ngày</TableCell>

                  <TableCell>Chủ Động Vật</TableCell>

                  <TableCell>Loại Động Vật</TableCell>

                  <TableCell>Số Con</TableCell>

                  <TableCell>Giá / Con</TableCell>

                  <TableCell>Tổng Tiền</TableCell>

                  <TableCell>Ghi Chú</TableCell>

                  <TableCell>Thanh Toán</TableCell>

                  <TableCell align="center">Hành Động</TableCell>
                </TableRow>
              </TableHead>

              {/* ================= TABLE BODY ================= */}

              <TableBody>
                {filteredDailyLogs.map((dailyLog) => {
                  const calculation = dailyLog.latestCalculation;

                  return (
                    <TableRow
                      sx={{
                        "&:hover": {
                          backgroundColor: "action.hover",
                        },
                      }}
                      key={dailyLog._id}
                    >
                      {/* DATE */}

                      <TableCell>
                        {dayjs(dailyLog.date).format("DD/MM/YYYY")}
                      </TableCell>

                      {/* OWNER */}

                      <TableCell>
                        {typeof dailyLog.owner === "string"
                          ? dailyLog.owner
                          : dailyLog.owner?.name || "—"}
                      </TableCell>

                      {/* ANIMAL */}

                      <TableCell>
                        {typeof dailyLog.animalType === "string"
                          ? dailyLog.animalType
                          : dailyLog.animalType?.name || "—"}
                      </TableCell>

                      {/* QUANTITY */}

                      <TableCell>{dailyLog.quantity}</TableCell>

                      {/* PRICE / UNIT */}

                      <TableCell>
                        {calculation
                          ? formatMoney(calculation.pricePerUnit)
                          : "—"}
                      </TableCell>

                      {/* TOTAL COST */}

                      <TableCell>
                        {calculation ? formatMoney(calculation.totalCost) : "—"}
                      </TableCell>

                      {/* NOTES */}

                      <TableCell>{dailyLog.notes || "—"}</TableCell>

                      {/* PAYMENT */}

                      <TableCell>
                        {!calculation ? (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              whiteSpace: "nowrap",
                            }}
                          >
                            Chưa tính
                          </Typography>
                        ) : calculation.isPaid ? (
                          <Typography
                            variant="body2"
                            color="success.main"
                            sx={{
                              fontWeight: 700,
                              whiteSpace: "nowrap",
                            }}
                          >
                            ✓ Đã nhận tiền
                          </Typography>
                        ) : (
                          <Button
                            size="small"
                            variant="outlined"
                            color="success"
                            onClick={() => handleMarkAsPaid(dailyLog)}
                            sx={{
                              whiteSpace: "nowrap",
                            }}
                          >
                            Xác nhận
                          </Button>
                        )}
                      </TableCell>

                      {/* ACTIONS */}

                      <TableCell align="center">
                        {/* CALCULATE */}

                        {!calculation?.isPaid && (
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => {
                              setSelectedDailyLogId(dailyLog._id);

                              setCostOpen(true);
                            }}
                            title={
                              calculation ? "Tính lại chi phí" : "Tính chi phí"
                            }
                          >
                            <Calculate fontSize="small" />
                          </IconButton>
                        )}

                        {/* EDIT */}

                        <IconButton
                          size="small"
                          onClick={() => handleOpen(dailyLog)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>

                        {/* DELETE */}

                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(dailyLog._id)}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* =====================================================
            DAILY LOG FORM
        ===================================================== */}

        <DailyLogFormDialog
          open={open}
          onClose={handleClose}
          dailyLog={editingDailyLog}
          owners={owners}
          animalTypes={animalTypes}
          onSaved={fetchDailyLogs}
        />

        {/* =====================================================
            CALCULATE COST
        ===================================================== */}

        <CalculateCostDialog
          open={costOpen}
          dailyLogId={selectedDailyLogId}
          onCalculated={handleCalculationUpdated}
          onClose={() => {
            setCostOpen(false);
            setSelectedDailyLogId(null);
          }}
        />

        {/* =====================================================
            CALCULATION HISTORY
        ===================================================== */}

        <CalculationHistoryDialog
          open={costHistoryOpen}
          onClose={() => setCostHistoryOpen(false)}
        />
      </Box>

      <OwnerMonthlyReportDialog
        open={ownerReportOpen}
        onClose={() => setOwnerReportOpen(false)}
        ownerName={selectedOwner?.name ?? "—"}
        animalTypeName={selectedAnimalType?.name ?? "—"}
        month={
          filterMonth
            ? filterMonth.format("YYYY-MM")
            : dayjs().format("YYYY-MM")
        }
        summary={monthSummary}
      />
    </>
  );
};

export default Batches;
