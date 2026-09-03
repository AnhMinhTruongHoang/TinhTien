import { useState, useEffect, useMemo } from "react";
import dayjs, { Dayjs } from "dayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

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
  RestartAlt,
  History,
} from "@mui/icons-material";

import { api } from "@/utils/api";

import CalculationHistoryDialog from "@/components/CalculationHistoryDialog";
import CalculateCostDialog from "@/components/CalculateCostDialog";
import DailyLogFormDialog from "@/components/DailyLogFormDialog";

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

      console.table(
        data.map((log: any) => ({
          id: log._id,
          date: log.date,
          quantity: log.quantity,
          animalType:
            typeof log.animalType === "string"
              ? log.animalType
              : log.animalType?.name,

          calculationId: log.latestCalculation?._id || null,

          pricePerUnit: log.latestCalculation?.pricePerUnit ?? null,

          totalCost: log.latestCalculation?.totalCost ?? null,

          isPaid: log.latestCalculation?.isPaid ?? null,
        }))
      );

      setDailyLogs(data);
    } catch (error) {
      console.error("Không thể tải daily logs:", error);
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
    } catch (error) {
      console.error("Không thể tổng hợp tháng:", error);

      alert("Không thể tổng hợp tháng");
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

  // =====================================================
  // DELETE DAILY LOG
  // =====================================================

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa ngày này?")) {
      return;
    }

    try {
      await api.dailyLogs.delete(id);

      await fetchDailyLogs();

      if (selectedDailyLogId === id) {
        setSelectedDailyLogId(null);
      }
    } catch (error) {
      console.error("Xóa daily log thất bại:", error);

      alert("Xóa thất bại");
    }
  };

  ///
  const handleMarkAsPaid = async (dailyLog: any) => {
    const calculation = dailyLog.latestCalculation;

    if (!calculation?._id) {
      alert("Daily Log này chưa được tính chi phí");
      return;
    }

    if (calculation.isPaid) {
      return;
    }

    const confirmed = confirm(
      `Xác nhận đã nhận ${Number(calculation.totalCost || 0).toLocaleString(
        "vi-VN"
      )}đ?`
    );

    if (!confirmed) {
      return;
    }

    try {
      const result = await api.calculationHistory.markAsPaid(calculation._id);

      // Update UI ngay
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

      // Nếu đang hiển thị tổng tháng
      // thì tính lại totalPaid
      if (monthSummary && filterOwner && filterAnimalType) {
        await handleMonthSummary();
      }
    } catch (error) {
      console.error("Xác nhận thanh toán thất bại:", error);

      alert("Không thể xác nhận thanh toán");
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

  return (
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

        {/* ================= FILTER ACTIONS ================= */}

        <Box
          sx={{
            display: "flex",

            flexDirection: isMobile ? "column" : "row",

            gap: 1.5,

            mt: 2,

            justifyContent: "flex-end",
          }}
        >
          <Button
            variant="outlined"
            startIcon={<RestartAlt />}
            onClick={handleResetFilter}
            fullWidth={isMobile}
          >
            Xóa lọc
          </Button>

          <Button
            variant="contained"
            onClick={handleMonthSummary}
            disabled={!filterOwner || !filterAnimalType || loadingMonthSummary}
            fullWidth={isMobile}
          >
            {loadingMonthSummary ? "Đang tính..." : "Tổng tháng"}
          </Button>
        </Box>

        {/* ================= COUNT ================= */}

        <Typography
          variant="body2"
          sx={{
            mt: 2,
            color: "text.secondary",
          }}
        >
          Đang hiển thị {filteredDailyLogs.length} / {dailyLogs.length} ngày
        </Typography>

        {/* =====================================================
            MONTH SUMMARY
        ===================================================== */}

        {monthSummary && (
          <Box
            sx={{
              mt: 2,
              p: 2,

              borderRadius: 2,

              border: "1px solid",

              borderColor: "primary.light",

              backgroundColor: "#eef6ff",
            }}
          >
            <Box
              sx={{
                display: "grid",

                gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3, 1fr)",

                gap: 2,
              }}
            >
              {/* THÁNG */}

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Tháng
                </Typography>

                <Typography
                  sx={{
                    fontWeight: 700,
                  }}
                >
                  {dayjs(`${monthSummary.month}-01`).format("MM/YYYY")}
                </Typography>
              </Box>

              {/* TỔNG NGÀY */}

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Tổng số ngày có log
                </Typography>

                <Typography
                  sx={{
                    fontWeight: 700,
                  }}
                >
                  {monthSummary.totalDays || 0} ngày
                </Typography>
              </Box>

              {/* TỔNG SỐ CON */}

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Tổng số con
                </Typography>

                <Typography
                  sx={{
                    fontWeight: 700,

                    color: "primary.main",

                    fontSize: 18,
                  }}
                >
                  {Number(monthSummary.totalQuantity || 0).toLocaleString(
                    "vi-VN"
                  )}{" "}
                  con
                </Typography>
              </Box>

              {/* TỔNG TIỀN */}

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Tổng tiền
                </Typography>

                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: 18,
                  }}
                >
                  {formatMoney(monthSummary.totalCost || 0)}
                </Typography>
              </Box>

              {/* ĐÃ NHẬN */}

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Đã nhận
                </Typography>

                <Typography
                  sx={{
                    fontWeight: 700,

                    color: "success.main",

                    fontSize: 18,
                  }}
                >
                  {formatMoney(monthSummary.totalPaid || 0)}
                </Typography>
              </Box>

              {/* CHƯA NHẬN */}

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Chưa nhận
                </Typography>

                <Typography
                  sx={{
                    fontWeight: 700,

                    color: "warning.main",

                    fontSize: 18,
                  }}
                >
                  {formatMoney(monthSummary.totalUnpaid || 0)}
                </Typography>
              </Box>
            </Box>

            {/* ================= PAYMENT STATUS ================= */}

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 2,
                pt: 1.5,

                borderTop: "1px solid",

                borderColor: "divider",
              }}
            >
              Đã nhận tiền {monthSummary.paidDays || 0} /{" "}
              {monthSummary.calculatedDays || 0} ngày đã tính
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.5,
              }}
            >
              Đã tính chi phí {monthSummary.calculatedDays || 0} /{" "}
              {monthSummary.totalDays || 0} ngày
            </Typography>
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
                    {calculation ? formatMoney(calculation.pricePerUnit) : "—"}
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

        <TableContainer component={Paper}>
          <Table>
            {/* ================= TABLE HEAD ================= */}

            <TableHead>
              <TableRow
                sx={{
                  backgroundColor: "#f5f5f5",
                }}
              >
                <TableCell>
                  <strong>Ngày</strong>
                </TableCell>

                <TableCell>
                  <strong>Chủ Động Vật</strong>
                </TableCell>

                <TableCell>
                  <strong>Loại Động Vật</strong>
                </TableCell>

                <TableCell>
                  <strong>Số Con</strong>
                </TableCell>

                <TableCell>
                  <strong>Giá / Con</strong>
                </TableCell>

                <TableCell>
                  <strong>Tổng Tiền</strong>
                </TableCell>

                <TableCell>
                  <strong>Ghi Chú</strong>
                </TableCell>

                <TableCell>
                  <strong>Thanh Toán</strong>
                </TableCell>

                <TableCell align="center">
                  <strong>Hành Động</strong>
                </TableCell>
              </TableRow>
            </TableHead>

            {/* ================= TABLE BODY ================= */}

            <TableBody>
              {filteredDailyLogs.map((dailyLog) => {
                const calculation = dailyLog.latestCalculation;

                return (
                  <TableRow key={dailyLog._id}>
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
  );
};

export default Batches;
