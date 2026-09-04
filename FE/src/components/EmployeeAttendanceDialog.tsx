import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  Divider,
  IconButton,
  Paper,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import { toBlob, toPng } from "html-to-image";

import PayrollShareCard from "@/components/PayrollShareCard";

import {
  CalendarMonth,
  Close,
  Delete,
  ContentCopy,
  Download,
  Share,
  CheckCircle,
  Lock,
  AccountBalanceWallet,
  History,
} from "@mui/icons-material";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import { useCallback, useEffect, useMemo, useState } from "react";

import dayjs, { type Dayjs } from "dayjs";

import { toast } from "react-toastify";

import { toastConfirm } from "@/utils/toastConfirm";

import { api } from "@/utils/api";
import SalaryAdvanceDialog from "./SalaryAdvanceDialog";
import SalaryAdvanceHistoryDialog from "./SalaryAdvanceHistoryDialog";
import PayrollFinalizeDialog from "./PayrollFinalizeDialog";

interface Employee {
  _id: string;
  name: string;
  phone?: string;
  address?: string;
  baseSalary: number;
  isActive?: boolean;
  notes?: string;
}

interface Absence {
  _id: string;
  employee: string | Employee;
  date: string;
  reason: string;
  deductionAmount: number;
  notes?: string;
}

interface MonthSummary {
  month: string;

  employee: Employee;

  totalDays: number;

  presentDays: number;

  absenceDays: number;

  baseSalary: number;

  totalDeduction: number;

  finalSalary: number;

  absences: Absence[];
}

interface AdvanceSummary {
  baseSalary: number;

  totalDeduction: number;

  salaryAfterDeduction: number;

  totalAdvance: number;

  remainingSalary: number;

  advances: any[];

  isFinalized: boolean;

  finalizedPayroll?: any | null;
}

interface Props {
  open: boolean;

  onClose: () => void;

  employee: Employee | null;
}

const weekDays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

const EmployeeAttendanceDialog = ({ open, onClose, employee }: Props) => {
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [month, setMonth] = useState<Dayjs>(dayjs().startOf("month"));

  const [summary, setSummary] = useState<MonthSummary | null>(null);

  const [loading, setLoading] = useState(false);

  const [payroll, setPayroll] = useState<any | null>(null);

  const [finalizing, setFinalizing] = useState(false);

  const isFinalized = Boolean(payroll?._id);

  const [absenceDialogOpen, setAbsenceDialogOpen] = useState(false);

  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);

  const [selectedAbsence, setSelectedAbsence] = useState<Absence | null>(null);

  const [saving, setSaving] = useState(false);

  const [deleting, setDeleting] = useState(false);

  const [sharing, setSharing] = useState(false);

  const [advanceSummary, setAdvanceSummary] = useState<AdvanceSummary | null>(
    null
  );

  const [finalizeDialogOpen, setFinalizeDialogOpen] = useState(false);

  const [advanceOpen, setAdvanceOpen] = useState(false);

  const [advanceHistoryOpen, setAdvanceHistoryOpen] = useState(false);

  const [formData, setFormData] = useState({
    reason: "",
    deductionAmount: 0,
    notes: "",
  });

  // =====================================================
  // MONEY
  // =====================================================

  const formatMoney = (value: number) =>
    `${Number(value || 0).toLocaleString("vi-VN")}đ`;

  // =====================================================
  // FETCH SUMMARY
  // =====================================================

  const fetchSummary = useCallback(async () => {
    if (!employee?._id) {
      return;
    }

    try {
      setLoading(true);

      const result = await api.employeeAbsences.monthSummary(
        employee._id,
        month.format("YYYY-MM")
      );

      setSummary(result);
    } catch (error) {
      console.error("Không thể tải chấm công:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Không thể tải dữ liệu chấm công"
      );
    } finally {
      setLoading(false);
    }
  }, [employee?._id, month]);

  //pay roll
  const fetchPayroll = useCallback(async () => {
    if (!employee?._id) {
      return;
    }

    try {
      const result = await api.monthlyPayrolls.get(
        employee._id,
        month.format("YYYY-MM")
      );

      setPayroll(result || null);
    } catch (error) {
      console.error("Không thể tải bảng lương:", error);

      setPayroll(null);
    }
  }, [employee?._id, month]);

  ////
  const fetchAdvanceSummary = useCallback(async () => {
    if (!employee) {
      setAdvanceSummary(null);
      return;
    }

    try {
      const result = await api.salaryAdvances.getSummary(
        employee._id,
        month.format("YYYY-MM")
      );

      setAdvanceSummary(result);
    } catch (error) {
      console.error("Không thể tải ứng lương:", error);

      setAdvanceSummary(null);
    }
  }, [employee, month]);
  ///

  useEffect(() => {
    if (!open) {
      return;
    }

    fetchSummary();

    fetchPayroll();

    fetchAdvanceSummary();
  }, [open, fetchSummary, fetchPayroll, fetchAdvanceSummary]);

  // =====================================================
  // RESET MONTH WHEN OPEN EMPLOYEE
  // =====================================================

  useEffect(() => {
    if (!open) {
      return;
    }

    setMonth(dayjs().startOf("month"));
  }, [open, employee?._id]);

  // =====================================================
  // ABSENCE MAP
  // =====================================================

  const absenceMap = useMemo(() => {
    const map = new Map<string, Absence>();

    summary?.absences?.forEach((item) => {
      map.set(dayjs(item.date).format("YYYY-MM-DD"), item);
    });

    return map;
  }, [summary]);

  // =====================================================
  // CALENDAR
  // Monday = 0
  // =====================================================

  const calendarDays = useMemo(() => {
    const firstDay = month.startOf("month");

    const daysInMonth = month.daysInMonth();

    // dayjs:
    // CN = 0
    // T2 = 1
    //
    // đổi về:
    // T2 = 0
    // CN = 6
    const startOffset = (firstDay.day() + 6) % 7;

    const result: Array<Dayjs | null> = [];

    for (let i = 0; i < startOffset; i++) {
      result.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      result.push(month.date(day));
    }

    return result;
  }, [month]);

  // =====================================================
  // OPEN DAY
  // =====================================================

  const handleDayClick = (date: Dayjs) => {
    if (isFinalized) {
      toast.info("Bảng lương tháng này đã được chốt");

      return;
    }

    const key = date.format("YYYY-MM-DD");

    const absence = absenceMap.get(key);

    setSelectedDate(date);

    setSelectedAbsence(absence || null);

    if (absence) {
      setFormData({
        reason: absence.reason || "",

        deductionAmount: Number(absence.deductionAmount || 0),

        notes: absence.notes || "",
      });
    } else {
      setFormData({
        reason: "",
        deductionAmount: 0,
        notes: "",
      });
    }

    setAbsenceDialogOpen(true);
  };

  ///
  const refreshPayrollData = async () => {
    await Promise.all([fetchSummary(), fetchPayroll(), fetchAdvanceSummary()]);
  };
  ///
  // =====================================================
  // CLOSE DAY DIALOG
  // =====================================================

  const handleCloseAbsence = () => {
    if (saving || deleting) {
      return;
    }

    setAbsenceDialogOpen(false);

    setSelectedDate(null);

    setSelectedAbsence(null);
  };

  // =====================================================
  // SAVE ABSENCE
  // =====================================================

  const handleSaveAbsence = async () => {
    if (!employee?._id || !selectedDate) {
      return;
    }

    if (!formData.reason.trim()) {
      toast.warning("Vui lòng nhập lý do nghỉ");

      return;
    }

    if (Number(formData.deductionAmount) < 0) {
      toast.warning("Tiền trừ không hợp lệ");

      return;
    }

    const data = {
      employeeId: employee._id,

      date: selectedDate.format("YYYY-MM-DD"),

      reason: formData.reason.trim(),

      deductionAmount: Number(formData.deductionAmount),

      notes: formData.notes.trim() || undefined,
    };

    try {
      setSaving(true);

      if (selectedAbsence?._id) {
        await api.employeeAbsences.update(selectedAbsence._id, data);

        toast.success("Cập nhật ngày nghỉ thành công");
      } else {
        await api.employeeAbsences.create(data);

        toast.success("Đã đánh dấu ngày nghỉ");
      }

      await fetchSummary();

      handleCloseAbsence();
    } catch (error) {
      console.error("Không thể lưu ngày nghỉ:", error);

      toast.error(
        error instanceof Error ? error.message : "Không thể lưu ngày nghỉ"
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // DELETE ABSENCE
  // => ngày đó trở lại trạng thái đi làm
  // =====================================================

  const handleDeleteAbsence = async () => {
    if (!selectedAbsence?._id) {
      return;
    }

    // Giữ reference để TypeScript biết chắc không null
    const currentAbsence = selectedAbsence;

    const confirmed = await toastConfirm({
      title: "Bỏ ngày nghỉ",

      message: (
        <Box>
          <Typography
            variant="body2"
            sx={{
              mb: 1,
            }}
          >
            Xác nhận bỏ đánh dấu nghỉ ngày{" "}
            <strong>
              {selectedDate
                ? selectedDate.format("DD/MM/YYYY")
                : dayjs(currentAbsence.date).format("DD/MM/YYYY")}
            </strong>
            ?
          </Typography>

          <Box
            sx={{
              display: "grid",
              gap: 0.5,
            }}
          >
            <Typography variant="body2">
              Lý do: <strong>{currentAbsence.reason || "—"}</strong>
            </Typography>

            <Typography variant="body2">
              Tiền đang trừ:{" "}
              <strong>{formatMoney(currentAbsence.deductionAmount)}</strong>
            </Typography>
          </Box>

          <Typography
            variant="caption"
            sx={{
              display: "block",
              mt: 1.5,
              color: "warning.main",
              fontWeight: 600,
            }}
          >
            Sau khi xác nhận, ngày này sẽ trở lại trạng thái đi làm và số tiền
            trừ sẽ được cộng lại vào lương.
          </Typography>
        </Box>
      ),

      confirmText: "Bỏ Ngày Nghỉ",

      cancelText: "Hủy",

      confirmColor: "warning",
    });

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);

      await api.employeeAbsences.delete(currentAbsence._id);

      toast.success("Đã chuyển lại thành ngày đi làm");

      await fetchSummary();

      await fetchPayroll();

      handleCloseAbsence();
    } catch (error) {
      console.error("Không thể xóa ngày nghỉ:", error);

      toast.error(
        error instanceof Error ? error.message : "Không thể cập nhật chấm công"
      );
    } finally {
      setDeleting(false);
    }
  };

  ///
  const getPayrollFilename = () => {
    const employeeName =
      employee?.name?.trim().replace(/\s+/g, "_") || "NhanVien";

    return `BangLuong_${employeeName}_${month.format("YYYY-MM")}.png`;
  };
  /// img
  const handleDownloadPayroll = async () => {
    const element = document.getElementById("payroll-share-card");

    if (!element) {
      toast.error("Không tìm thấy bảng lương");

      return;
    }

    try {
      setSharing(true);

      const dataUrl = await toPng(element, {
        cacheBust: true,

        pixelRatio: 2,

        backgroundColor: "#ffffff",
      });

      const link = document.createElement("a");

      link.download = getPayrollFilename();

      link.href = dataUrl;

      link.click();

      toast.success("Đã tải ảnh bảng lương");
    } catch (error) {
      console.error(error);

      toast.error("Không thể tạo ảnh bảng lương");
    } finally {
      setSharing(false);
    }
  };
  /// copy img
  const handleCopyPayroll = async () => {
    const element = document.getElementById("payroll-share-card");

    if (!element) {
      return;
    }

    try {
      setSharing(true);

      const blob = await toBlob(element, {
        cacheBust: true,

        pixelRatio: 2,

        backgroundColor: "#ffffff",
      });

      if (!blob) {
        throw new Error("Không thể tạo ảnh");
      }

      if (!navigator.clipboard || typeof ClipboardItem === "undefined") {
        toast.warning("Trình duyệt không hỗ trợ sao chép ảnh");

        return;
      }

      await navigator.clipboard.write([
        new ClipboardItem({
          "image/png": blob,
        }),
      ]);

      toast.success("Đã sao chép ảnh bảng lương");
    } catch (error) {
      console.error(error);

      toast.error("Không thể sao chép ảnh");
    } finally {
      setSharing(false);
    }
  };
  /// shared mxh
  const handleSharePayroll = async () => {
    const element = document.getElementById("payroll-share-card");

    if (!element) {
      return;
    }

    try {
      setSharing(true);

      const blob = await toBlob(element, {
        cacheBust: true,

        pixelRatio: 2,

        backgroundColor: "#ffffff",
      });

      if (!blob) {
        throw new Error("Không thể tạo ảnh");
      }

      const filename = getPayrollFilename();

      const file = new File([blob], filename, {
        type: "image/png",
      });

      if (
        navigator.share &&
        navigator.canShare?.({
          files: [file],
        })
      ) {
        await navigator.share({
          title: "Bảng lương nhân viên",

          text: `Bảng lương ${employee?.name} - Tháng ${month.format(
            "MM/YYYY"
          )}`,

          files: [file],
        });

        return;
      }

      toast.info(
        "Thiết bị không hỗ trợ chia sẻ trực tiếp. Ảnh sẽ được tải xuống."
      );

      await handleDownloadPayroll();
    } catch (error: any) {
      if (error?.name === "AbortError") {
        return;
      }

      console.error(error);

      toast.error("Không thể chia sẻ bảng lương");
    } finally {
      setSharing(false);
    }
  };

  ///
  const handleFinalizePayroll = async () => {
    if (!employee || !summary) {
      toast.warning("Chưa có đủ dữ liệu để chốt lương");
      return;
    }

    try {
      setFinalizing(true);

      const result = await api.monthlyPayrolls.finalize({
        employeeId: employee._id,
        month: month.format("YYYY-MM"),
      });

      setPayroll(result);

      setFinalizeDialogOpen(false);

      await refreshPayrollData();

      toast.success("Đã chốt lương tháng thành công");
    } catch (error) {
      console.error("Không thể chốt lương:", error);

      toast.error(
        error instanceof Error ? error.message : "Không thể chốt lương tháng"
      );
    } finally {
      setFinalizing(false);
    }
  };
  ///

  return (
    <>
      {/* =====================================================
            MAIN ATTENDANCE DIALOG
        ===================================================== */}

      <Dialog
        open={open}
        onClose={onClose}
        fullScreen={isMobile}
        fullWidth
        maxWidth="lg"
        slotProps={{
          paper: {
            sx: {
              borderRadius: isMobile ? 0 : 3,

              m: isMobile ? 0 : 2,

              maxHeight: isMobile ? "100dvh" : "94vh",

              backgroundImage: "none",
            },
          },
        }}
      >
        <Box
          sx={{
            p: {
              xs: 2,
              md: 3,
            },
          }}
        >
          {/* ================= HEADER ================= */}

          <Box
            sx={{
              display: "flex",

              alignItems: "flex-start",

              justifyContent: "space-between",

              gap: 2,

              mb: 3,
            }}
          >
            <Box>
              <Typography
                variant={isMobile ? "h6" : "h5"}
                sx={{
                  fontWeight: 800,
                }}
              >
                Chấm Công Nhân Viên
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.5,
                }}
              >
                {employee?.name || "—"} • Mặc định tất cả ngày là đi làm
              </Typography>
            </Box>

            <IconButton onClick={onClose}>
              <Close />
            </IconButton>
          </Box>

          {/* ================= MONTH FILTER ================= */}

          <Box
            sx={{
              display: "flex",

              flexDirection: {
                xs: "column",
                sm: "row",
              },

              alignItems: {
                xs: "stretch",
                sm: "center",
              },

              justifyContent: "space-between",

              gap: 2,

              mb: 3,
            }}
          >
            <DatePicker
              label="Tháng"
              views={["year", "month"]}
              value={month}
              onChange={(value) => {
                if (value) {
                  setMonth(value.startOf("month"));
                }
              }}
              format="MM/YYYY"
              slotProps={{
                textField: {
                  size: "small",

                  sx: {
                    minWidth: {
                      sm: 180,
                    },
                  },
                },
              }}
            />

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <CalendarMonth color="primary" />

              <Typography
                sx={{
                  fontWeight: 700,
                }}
              >
                Tháng {month.format("MM/YYYY")}
              </Typography>
            </Box>
          </Box>

          {/* ================= LOADING ================= */}

          {loading ? (
            <Box
              sx={{
                py: 8,

                display: "flex",

                justifyContent: "center",
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* ================= SUMMARY ================= */}

              <Box
                sx={{
                  display: "grid",

                  gridTemplateColumns: {
                    xs: "repeat(2, minmax(0, 1fr))",

                    md: "repeat(4, minmax(0, 1fr))",
                    xl: "repeat(7, minmax(0, 1fr))",
                  },

                  gap: 1.5,

                  mb: 3,
                }}
              >
                {[
                  {
                    label: "Lương gốc",

                    value: formatMoney(
                      advanceSummary?.baseSalary ??
                        summary?.baseSalary ??
                        employee?.baseSalary ??
                        0
                    ),

                    color: "primary.main",
                  },

                  {
                    label: "Đi làm",

                    value: `${summary?.presentDays ?? 0} ngày`,

                    color: "success.main",
                  },

                  {
                    label: "Nghỉ",

                    value: `${summary?.absenceDays ?? 0} ngày`,

                    color: "warning.main",
                  },

                  {
                    label: "Tiền trừ",

                    value: formatMoney(
                      advanceSummary?.totalDeduction ??
                        summary?.totalDeduction ??
                        0
                    ),

                    color: "error.main",
                  },

                  {
                    label: "Sau khấu trừ",

                    value: formatMoney(
                      advanceSummary?.salaryAfterDeduction ??
                        summary?.finalSalary ??
                        0
                    ),

                    color: "success.main",
                  },

                  {
                    label: "Đã ứng",

                    value: formatMoney(
                      advanceSummary?.totalAdvance ?? payroll?.totalAdvance ?? 0
                    ),

                    color: "warning.main",
                  },

                  {
                    label: "Còn phải trả",

                    value: formatMoney(
                      payroll?.remainingSalary ??
                        advanceSummary?.remainingSalary ??
                        summary?.finalSalary ??
                        0
                    ),

                    color: "success.main",
                  },
                ].map((item) => (
                  <Paper
                    key={item.label}
                    variant="outlined"
                    sx={{
                      p: 1.5,

                      borderRadius: 2.5,

                      textAlign: "center",

                      backgroundColor: "background.paper",
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {item.label}
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.5,

                        fontWeight: 800,

                        color: item.color,

                        fontSize: {
                          xs: 15,
                          sm: 17,
                        },
                      }}
                    >
                      {item.value}
                    </Typography>
                  </Paper>
                ))}
              </Box>

              <Box
                sx={{
                  position: "fixed",

                  left: "-10000px",

                  top: 0,

                  pointerEvents: "none",
                }}
              >
                {employee && summary && (
                  <PayrollShareCard
                    employee={employee}
                    month={month.format("YYYY-MM")}
                    baseSalary={payroll?.baseSalary ?? summary.baseSalary}
                    presentDays={payroll?.presentDays ?? summary.presentDays}
                    absenceDays={payroll?.absenceDays ?? summary.absenceDays}
                    totalDeduction={
                      payroll?.totalDeduction ?? summary.totalDeduction
                    }
                    finalSalary={payroll?.finalSalary ?? summary.finalSalary}
                  />
                )}
              </Box>

              <Box
                sx={(theme) => ({
                  mb: 3,

                  p: 2,

                  borderRadius: 2.5,

                  display: "flex",

                  flexDirection: {
                    xs: "column",
                    sm: "row",
                  },

                  alignItems: {
                    xs: "stretch",
                    sm: "center",
                  },

                  justifyContent: "space-between",

                  gap: 1.5,

                  border: "1px solid",

                  borderColor: isFinalized ? "success.main" : "warning.main",

                  backgroundColor: isFinalized
                    ? theme.palette.mode === "dark"
                      ? "rgba(76,175,80,0.10)"
                      : "rgba(76,175,80,0.06)"
                    : theme.palette.mode === "dark"
                    ? "rgba(255,193,7,0.08)"
                    : "rgba(255,193,7,0.06)",
                })}
              >
                <Box>
                  <Typography
                    sx={{
                      fontWeight: 800,

                      color: isFinalized ? "success.main" : "warning.main",
                    }}
                  >
                    {isFinalized ? "✓ Đã chốt lương" : "Chưa chốt lương"}
                  </Typography>

                  {isFinalized && payroll?.finalizedAt && (
                    <Typography variant="caption" color="text.secondary">
                      Chốt lúc{" "}
                      {dayjs(payroll.finalizedAt).format("DD/MM/YYYY HH:mm")}
                    </Typography>
                  )}
                </Box>

                {isFinalized ? (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,

                      color: "success.main",

                      fontWeight: 700,
                    }}
                  >
                    <Lock fontSize="small" />
                    Đã khóa tháng
                  </Box>
                ) : (
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={
                      finalizing ? (
                        <CircularProgress size={17} color="inherit" />
                      ) : (
                        <CheckCircle />
                      )
                    }
                    disabled={finalizing || loading}
                    onClick={() => setFinalizeDialogOpen(true)}
                  >
                    {finalizing ? "Đang chốt..." : "Chốt Lương Tháng"}
                  </Button>
                )}
              </Box>

              <Box
                sx={{
                  display: "flex",

                  flexDirection: {
                    xs: "column",
                    sm: "row",
                  },

                  gap: 1,

                  mb: 2,
                }}
              >
                <Button
                  variant="contained"
                  color="warning"
                  startIcon={<AccountBalanceWallet />}
                  disabled={
                    isFinalized ||
                    !advanceSummary ||
                    advanceSummary.remainingSalary <= 0
                  }
                  onClick={() => setAdvanceOpen(true)}
                >
                  Ứng Lương
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<History />}
                  disabled={!advanceSummary}
                  onClick={() => setAdvanceHistoryOpen(true)}
                >
                  Lịch Sử Ứng
                </Button>

                {advanceSummary && (
                  <Box
                    sx={{
                      ml: {
                        sm: "auto",
                      },

                      display: "flex",

                      alignItems: "center",

                      gap: 0.5,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Còn phải trả:
                    </Typography>

                    <Typography
                      sx={{
                        fontWeight: 900,

                        color:
                          advanceSummary.remainingSalary > 0
                            ? "success.main"
                            : "text.secondary",
                      }}
                    >
                      {formatMoney(advanceSummary.remainingSalary)}
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* ================= LEGEND ================= */}

              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  flexWrap: "wrap",
                  mb: 2,
                }}
              >
                <Box
                  sx={{
                    display: "flex",

                    alignItems: "center",

                    gap: 0.75,
                  }}
                >
                  <Box
                    sx={{
                      width: 14,
                      height: 14,

                      borderRadius: "50%",

                      backgroundColor: "success.main",
                    }}
                  />

                  <Typography variant="caption">Đi làm</Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",

                    alignItems: "center",

                    gap: 0.75,
                  }}
                >
                  <Box
                    sx={{
                      width: 14,
                      height: 14,

                      borderRadius: "50%",

                      backgroundColor: "warning.main",
                    }}
                  />

                  <Typography variant="caption">Nghỉ làm</Typography>
                </Box>
              </Box>

              {/* ================= CALENDAR ================= */}

              <Paper
                variant="outlined"
                sx={{
                  p: {
                    xs: 1,
                    sm: 2,
                  },

                  borderRadius: 3,

                  overflow: "hidden",
                }}
              >
                {/* WEEK HEADER */}

                <Box
                  sx={{
                    display: "grid",

                    gridTemplateColumns: "repeat(7, minmax(0, 1fr))",

                    mb: 1,
                  }}
                >
                  {weekDays.map((day) => (
                    <Typography
                      key={day}
                      variant="caption"
                      sx={{
                        textAlign: "center",

                        fontWeight: 800,

                        color: "text.secondary",

                        py: 0.75,
                      }}
                    >
                      {day}
                    </Typography>
                  ))}
                </Box>

                {/* DAYS */}

                <Box
                  sx={{
                    display: "grid",

                    gridTemplateColumns: "repeat(7, minmax(0, 1fr))",

                    gap: {
                      xs: 0.5,
                      sm: 1,
                    },
                  }}
                >
                  {calendarDays.map((date, index) => {
                    if (!date) {
                      return <Box key={`empty-${index}`} />;
                    }

                    const key = date.format("YYYY-MM-DD");

                    const absence = absenceMap.get(key);

                    const isToday = date.isSame(dayjs(), "day");

                    return (
                      <Tooltip
                        key={key}
                        arrow
                        title={
                          absence
                            ? `${absence.reason} • Trừ ${formatMoney(
                                absence.deductionAmount
                              )}`
                            : "Đi làm"
                        }
                      >
                        <Box
                          onClick={() => handleDayClick(date)}
                          sx={(theme) => ({
                            minHeight: {
                              xs: 58,
                              sm: 78,
                            },

                            p: {
                              xs: 0.5,
                              sm: 1,
                            },

                            cursor: "pointer",

                            display: "flex",

                            flexDirection: "column",

                            alignItems: "center",

                            justifyContent: "center",

                            borderRadius: 2,

                            border: "1px solid",

                            borderColor: isToday
                              ? "primary.main"
                              : absence
                              ? "warning.main"
                              : "divider",

                            backgroundColor: absence
                              ? theme.palette.mode === "dark"
                                ? "rgba(255, 193, 7, 0.16)"
                                : "rgba(255, 193, 7, 0.20)"
                              : theme.palette.mode === "dark"
                              ? "rgba(76, 175, 80, 0.06)"
                              : "rgba(76, 175, 80, 0.04)",

                            transition: "all 0.15s ease",

                            "&:hover": {
                              transform: "translateY(-2px)",

                              borderColor: absence
                                ? "warning.main"
                                : "success.main",

                              boxShadow: theme.shadows[2],
                            },
                          })}
                        >
                          <Typography
                            sx={{
                              fontWeight: 800,

                              fontSize: {
                                xs: 14,
                                sm: 16,
                              },
                            }}
                          >
                            {date.date()}
                          </Typography>

                          <Typography
                            variant="caption"
                            sx={{
                              mt: 0.25,

                              fontWeight: 700,

                              color: absence ? "warning.main" : "success.main",

                              fontSize: {
                                xs: 9,
                                sm: 11,
                              },
                            }}
                          >
                            {absence ? "NGHỈ" : "ĐI LÀM"}
                          </Typography>

                          {absence && (
                            <Typography
                              variant="caption"
                              sx={{
                                display: {
                                  xs: "none",
                                  sm: "block",
                                },

                                mt: 0.25,

                                color: "text.secondary",

                                maxWidth: "100%",

                                overflow: "hidden",

                                textOverflow: "ellipsis",

                                whiteSpace: "nowrap",
                              }}
                            >
                              -{formatMoney(absence.deductionAmount)}
                            </Typography>
                          )}
                        </Box>
                      </Tooltip>
                    );
                  })}
                </Box>
              </Paper>

              <Box
                sx={{
                  display: "flex",

                  gap: 1,

                  flexWrap: "wrap",

                  justifyContent: {
                    xs: "center",
                    md: "flex-end",
                  },

                  mb: 2,
                  mt: 2,
                }}
              >
                {!isMobile && (
                  <Button
                    variant="outlined"
                    startIcon={<ContentCopy />}
                    disabled={sharing || !summary}
                    onClick={handleCopyPayroll}
                  >
                    Sao Chép Ảnh
                  </Button>
                )}

                <Button
                  variant="outlined"
                  startIcon={<Download />}
                  disabled={sharing || !summary}
                  onClick={handleDownloadPayroll}
                >
                  Tải PNG
                </Button>

                {isMobile && (
                  <Button
                    variant="contained"
                    startIcon={<Share />}
                    disabled={sharing || !summary}
                    onClick={handleSharePayroll}
                  >
                    Chia Sẻ
                  </Button>
                )}
              </Box>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: "block",
                  mt: 1.5,
                  textAlign: "center",
                }}
              >
                Click vào một ngày để đánh dấu nghỉ hoặc chỉnh sửa thông tin
                ngày nghỉ.
              </Typography>
            </>
          )}
        </Box>
      </Dialog>

      {/* =====================================================
            ABSENCE DIALOG
        ===================================================== */}

      <Dialog
        open={absenceDialogOpen}
        onClose={handleCloseAbsence}
        fullWidth
        maxWidth="sm"
        fullScreen={isMobile}
      >
        <Box
          sx={{
            p: {
              xs: 2,
              sm: 3,
            },
          }}
        >
          <Box
            sx={{
              display: "flex",

              alignItems: "center",

              justifyContent: "space-between",

              mb: 3,
            }}
          >
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                }}
              >
                {selectedAbsence ? "Cập Nhật Ngày Nghỉ" : "Đánh Dấu Nghỉ"}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {employee?.name} • {selectedDate?.format("DD/MM/YYYY")}
              </Typography>
            </Box>

            <IconButton onClick={handleCloseAbsence}>
              <Close />
            </IconButton>
          </Box>

          <TextField
            fullWidth
            label="Lý do nghỉ"
            value={formData.reason}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,

                reason: e.target.value,
              }))
            }
            placeholder="Ví dụ: Nghỉ việc cá nhân"
            sx={{
              mb: 2,
            }}
          />

          <TextField
            fullWidth
            type="number"
            label="Số tiền trừ"
            value={formData.deductionAmount}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,

                deductionAmount: Number(e.target.value),
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

          <Divider
            sx={{
              mb: 2,
            }}
          />

          <Box
            sx={{
              display: "flex",

              flexDirection: {
                xs: "column",
                sm: "row",
              },

              justifyContent: selectedAbsence ? "space-between" : "flex-end",

              gap: 1,
            }}
          >
            {selectedAbsence && (
              <Button
                color="error"
                variant="outlined"
                startIcon={
                  deleting ? <CircularProgress size={16} /> : <Delete />
                }
                disabled={saving || deleting}
                onClick={handleDeleteAbsence}
              >
                Bỏ ngày nghỉ
              </Button>
            )}

            <Box
              sx={{
                display: "flex",
                gap: 1,
              }}
            >
              <Button
                onClick={handleCloseAbsence}
                disabled={saving || deleting}
              >
                Hủy
              </Button>

              <Button
                variant="contained"
                color="warning"
                onClick={handleSaveAbsence}
                disabled={saving || deleting}
              >
                {saving
                  ? "Đang lưu..."
                  : selectedAbsence
                  ? "Cập Nhật"
                  : "Xác Nhận Nghỉ"}
              </Button>
            </Box>
          </Box>
        </Box>
      </Dialog>

      <PayrollFinalizeDialog
        open={finalizeDialogOpen}
        onClose={() => setFinalizeDialogOpen(false)}
        employeeName={employee?.name ?? "—"}
        monthLabel={month.format("MM/YYYY")}
        baseSalary={
          advanceSummary?.baseSalary ??
          summary?.baseSalary ??
          employee?.baseSalary ??
          0
        }
        presentDays={summary?.presentDays ?? 0}
        absenceDays={summary?.absenceDays ?? 0}
        totalDeduction={
          advanceSummary?.totalDeduction ?? summary?.totalDeduction ?? 0
        }
        finalSalary={
          advanceSummary?.salaryAfterDeduction ?? summary?.finalSalary ?? 0
        }
        totalAdvance={advanceSummary?.totalAdvance ?? 0}
        remainingSalary={
          advanceSummary?.remainingSalary ?? summary?.finalSalary ?? 0
        }
        loading={finalizing}
        onConfirm={handleFinalizePayroll}
      />

      <SalaryAdvanceDialog
        open={advanceOpen}
        onClose={() => setAdvanceOpen(false)}
        employee={employee}
        month={month.format("YYYY-MM")}
        remainingSalary={advanceSummary?.remainingSalary ?? 0}
        onSaved={refreshPayrollData}
      />

      <SalaryAdvanceHistoryDialog
        open={advanceHistoryOpen}
        onClose={() => setAdvanceHistoryOpen(false)}
        employee={employee}
        month={month.format("YYYY-MM")}
        isFinalized={isFinalized}
        onChanged={refreshPayrollData}
      />
    </>
  );
};

export default EmployeeAttendanceDialog;
