import { useEffect, useState } from "react";
import dayjs from "dayjs";

import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  LinearProgress,
  Paper,
  Typography,
} from "@mui/material";

import {
  Group,
  ReceiptLong,
  Payments,
  Paid,
  PendingActions,
  CalendarMonth,
  PriceChangeOutlined,
  PetsOutlined,
  SavingsOutlined,
} from "@mui/icons-material";

import { api } from "@/utils/api";
import BackupManager from "@/components/BackupManager";

interface DashboardStats {
  totalDailyLogs: number;

  totalOwners: number;

  totalAnimalTypes: number;

  totalQuantity: number;

  calculatedLogs: number;

  paidLogs: number;

  unpaidLogs: number;

  totalCost: number;

  totalPaid: number;

  totalUnpaid: number;

  logsThisMonth: number;

  quantityThisMonth: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalDailyLogs: 0,

    totalOwners: 0,

    totalAnimalTypes: 0,

    totalQuantity: 0,

    calculatedLogs: 0,

    paidLogs: 0,

    unpaidLogs: 0,

    totalCost: 0,

    totalPaid: 0,

    totalUnpaid: 0,

    logsThisMonth: 0,

    quantityThisMonth: 0,
  });

  const [recentLogs, setRecentLogs] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      const [dailyLogs, owners, animalTypes, histories] = await Promise.all([
        api.dailyLogs.getAll(),

        api.owners.getAll(),

        api.animalTypes.getAll(),

        api.calculationHistory.getAll(),
      ]);

      // =====================================================
      // TỔNG SỐ CON
      // =====================================================

      const totalQuantity = dailyLogs.reduce(
        (sum, log) => sum + Number(log.quantity || 0),
        0
      );

      // =====================================================
      // LOG TRONG THÁNG HIỆN TẠI
      // =====================================================

      const now = dayjs();

      const thisMonthLogs = dailyLogs.filter(
        (log) => log.date && dayjs(log.date).isSame(now, "month")
      );

      const quantityThisMonth = thisMonthLogs.reduce(
        (sum, log) => sum + Number(log.quantity || 0),
        0
      );

      // =====================================================
      // CHỈ LẤY LẦN TÍNH MỚI NHẤT CỦA MỖI DAILY LOG
      // =====================================================

      const latestHistoryMap = new Map<string, any>();

      histories.forEach((history) => {
        const dailyLogId =
          typeof history.dailyLog === "string"
            ? history.dailyLog
            : history.dailyLog?._id;

        if (!dailyLogId) {
          return;
        }

        const current = latestHistoryMap.get(dailyLogId);

        if (!current) {
          latestHistoryMap.set(dailyLogId, history);

          return;
        }

        if (dayjs(history.calculatedAt).isAfter(dayjs(current.calculatedAt))) {
          latestHistoryMap.set(dailyLogId, history);
        }
      });

      const latestHistories = Array.from(latestHistoryMap.values());

      // =====================================================
      // TOTAL COST
      // =====================================================

      const totalCost = latestHistories.reduce(
        (sum, history) => sum + Number(history.totalCost || 0),
        0
      );

      // =====================================================
      // PAID
      // =====================================================

      const paidHistories = latestHistories.filter((history) => history.isPaid);

      const unpaidHistories = latestHistories.filter(
        (history) => !history.isPaid
      );

      const totalPaid = paidHistories.reduce(
        (sum, history) => sum + Number(history.totalCost || 0),
        0
      );

      const totalUnpaid = unpaidHistories.reduce(
        (sum, history) => sum + Number(history.totalCost || 0),
        0
      );

      setStats({
        totalDailyLogs: dailyLogs.length,

        totalOwners: owners.length,

        totalAnimalTypes: animalTypes.length,

        totalQuantity,

        calculatedLogs: latestHistories.length,

        paidLogs: paidHistories.length,

        unpaidLogs: unpaidHistories.length,

        totalCost,

        totalPaid,

        totalUnpaid,

        logsThisMonth: thisMonthLogs.length,

        quantityThisMonth,
      });

      // BE đang sort date DESC
      setRecentLogs(dailyLogs.slice(0, 5));
    } catch (error) {
      console.error("Không thể tải dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (value: number) => {
    return `${Number(value || 0).toLocaleString("vi-VN")}đ`;
  };

  const paymentPercent =
    stats.totalCost > 0
      ? Math.round((stats.totalPaid / stats.totalCost) * 100)
      : 0;

  const statCards = [
    {
      title: "Nhật Ký",
      value: stats.totalDailyLogs,
      description: `${stats.logsThisMonth} log trong tháng này`,
      icon: (
        <ReceiptLong
          sx={{
            fontSize: 38,
            color: "primary.main",
          }}
        />
      ),
    },

    {
      title: "Tổng Số Con",
      value: stats.totalQuantity.toLocaleString("vi-VN"),
      description: `${stats.quantityThisMonth.toLocaleString(
        "vi-VN"
      )} con trong tháng`,
      icon: (
        <SavingsOutlined
          sx={{
            fontSize: 38,
            color: "secondary.main",
          }}
        />
      ),
    },

    {
      title: "Đã Tính Giá",
      value: `${stats.calculatedLogs} / ${stats.totalDailyLogs}`,
      description: "Số nhật ký đã có giá",
      icon: (
        <Payments
          sx={{
            fontSize: 38,
            color: "info.main",
          }}
        />
      ),
    },

    {
      title: "Tổng Tiền",
      value: formatMoney(stats.totalCost),
      description: "Tổng tiền đã tính",
      icon: (
        <PriceChangeOutlined
          sx={{
            fontSize: 38,
            color: "primary.main",
          }}
        />
      ),
    },

    {
      title: "Đã Nhận",
      value: formatMoney(stats.totalPaid),
      description: `${stats.paidLogs} ngày đã thanh toán`,
      icon: (
        <Paid
          sx={{
            fontSize: 38,
            color: "success.main",
          }}
        />
      ),
    },

    {
      title: "Chưa Nhận",
      value: formatMoney(stats.totalUnpaid),
      description: `${stats.unpaidLogs} ngày chưa thanh toán`,
      icon: (
        <PendingActions
          sx={{
            fontSize: 38,
            color: "warning.main",
          }}
        />
      ),
    },

    {
      title: "Chủ Động Vật",
      value: stats.totalOwners,
      description: "Tổng số chủ",
      icon: (
        <Group
          sx={{
            fontSize: 38,
            color: "success.main",
          }}
        />
      ),
    },

    {
      title: "Loại Động Vật",
      value: stats.totalAnimalTypes,
      description: "Tổng số loại",
      icon: (
        <PetsOutlined
          sx={{
            fontSize: 38,
            color: "secondary.main",
          }}
        />
      ),
    },
  ];

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: 400,

          display: "flex",

          justifyContent: "center",

          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* =====================================================
          HEADER
      ===================================================== */}

      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,

            fontSize: {
              xs: 26,
              sm: 32,
            },
          }}
        >
          Tổng Quan
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Theo dõi nhật ký, chi phí và trạng thái thanh toán
        </Typography>
      </Box>

      {/* =====================================================
          STAT CARDS
      ===================================================== */}

      <Box
        sx={{
          display: "grid",

          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            lg: "repeat(4, 1fr)",
          },

          gap: 2,

          mb: 3,
        }}
      >
        {statCards.map((card, index) => (
          <Card
            key={index}
            sx={{
              borderRadius: 3,

              boxShadow: 1,

              border: "1px solid",

              borderColor: "divider",

              transition: "transform 0.2s, box-shadow 0.2s",

              "&:hover": {
                transform: "translateY(-2px)",

                boxShadow: 3,
              },
            }}
          >
            <CardContent
              sx={{
                p: 2.5,

                "&:last-child": {
                  pb: 2.5,
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",

                  alignItems: "flex-start",

                  justifyContent: "space-between",

                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    minWidth: 0,
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 0.75 }}
                  >
                    {card.title}
                  </Typography>

                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,

                      wordBreak: "break-word",
                    }}
                  >
                    {card.value}
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    {card.description}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    flexShrink: 0,
                  }}
                >
                  {card.icon}
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* =====================================================
          PAYMENT PROGRESS
      ===================================================== */}

      <Paper
        sx={{
          p: {
            xs: 2,
            sm: 3,
          },

          mb: 3,

          borderRadius: 3,

          boxShadow: 1,

          border: "1px solid",

          borderColor: "divider",
        }}
      >
        <Box
          sx={{
            display: "flex",

            flexDirection: {
              xs: "column",
              sm: "row",
            },

            justifyContent: "space-between",

            gap: 2,

            mb: 2,
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Tình Trạng Thanh Toán
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Tiến độ số tiền đã nhận
            </Typography>
          </Box>

          <Typography
            variant="h5"
            color="success.main"
            sx={{
              fontWeight: 700,
            }}
          >
            {paymentPercent}%
          </Typography>
        </Box>

        <LinearProgress
          variant="determinate"
          value={paymentPercent}
          sx={{
            height: 10,
            borderRadius: 999,
            mb: 2,
          }}
        />

        <Box
          sx={{
            display: "grid",

            gridTemplateColumns: {
              xs: "1fr 1fr",
              sm: "repeat(3, 1fr)",
            },

            gap: 2,
          }}
        >
          <Box>
            <Typography variant="caption" color="text.secondary">
              Tổng tiền
            </Typography>

            <Typography
              sx={{
                fontWeight: 700,
              }}
            >
              {formatMoney(stats.totalCost)}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary">
              Đã nhận
            </Typography>

            <Typography
              color="success.main"
              sx={{
                fontWeight: 700,
              }}
            >
              {formatMoney(stats.totalPaid)}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary">
              Chưa nhận
            </Typography>

            <Typography
              color="warning.main"
              sx={{
                fontWeight: 700,
              }}
            >
              {formatMoney(stats.totalUnpaid)}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* =====================================================
          CURRENT MONTH
      ===================================================== */}

      <Paper
        sx={{
          p: {
            xs: 2,
            sm: 3,
          },

          mb: 3,

          borderRadius: 3,

          boxShadow: 1,

          border: "1px solid",

          borderColor: "divider",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            mb: 2,
          }}
        >
          <CalendarMonth color="primary" />

          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              textAlign: "center",
            }}
          >
            Tháng {dayjs().format("MM/YYYY")}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",

            gridTemplateColumns: {
              xs: "1fr 1fr",
              sm: "repeat(3, 1fr)",
            },

            gap: 2,
          }}
        >
          <Box>
            <Typography variant="caption" color="text.secondary">
              Số ngày có log
            </Typography>

            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {stats.logsThisMonth}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary">
              Tổng số con
            </Typography>

            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {stats.quantityThisMonth.toLocaleString("vi-VN")}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary">
              Chưa tính giá
            </Typography>

            <Typography
              variant="h6"
              color="warning.main"
              sx={{ fontWeight: 700 }}
            >
              {Math.max(stats.totalDailyLogs - stats.calculatedLogs, 0)}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* =====================================================
          RECENT DAILY LOGS
      ===================================================== */}

      <Paper
        sx={{
          p: {
            xs: 2,
            sm: 3,
          },

          borderRadius: 3,

          boxShadow: 1,

          border: "1px solid",

          borderColor: "divider",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            mb: 2,
            fontWeight: 700,

            textAlign: {
              xs: "center",
              sm: "left",
            },
          }}
        >
          Nhật Ký Gần Đây
        </Typography>

        {recentLogs.length === 0 ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              textAlign: {
                xs: "center",
                sm: "left",
              },
            }}
          >
            Chưa có nhật ký.
          </Typography>
        ) : (
          <Box
            sx={{
              display: "flex",

              flexDirection: "column",

              gap: 1,
            }}
          >
            {recentLogs.map((log) => {
              const ownerName =
                typeof log.owner === "string"
                  ? log.owner
                  : log.owner?.name || "—";

              const animalTypeName =
                typeof log.animalType === "string"
                  ? log.animalType
                  : log.animalType?.name || "—";

              const calculation = log.latestCalculation;

              return (
                <Box
                  key={log._id}
                  sx={{
                    display: "flex",

                    flexDirection: {
                      xs: "column",
                      sm: "row",
                    },

                    alignItems: "center",

                    justifyContent: {
                      xs: "center",
                      sm: "space-between",
                    },

                    gap: 1.5,

                    p: 1.5,

                    borderRadius: 2,

                    border: "1px solid",

                    borderColor: "divider",

                    textAlign: {
                      xs: "center",
                      sm: "left",
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: {
                        xs: "100%",
                        sm: "auto",
                      },

                      textAlign: {
                        xs: "center",
                        sm: "left",
                      },
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 700,
                      }}
                    >
                      {dayjs(log.date).format("DD/MM/YYYY")}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      {ownerName} • {animalTypeName} • {log.quantity} con
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",

                      alignItems: "center",

                      justifyContent: {
                        xs: "center",
                        sm: "flex-end",
                      },

                      flexWrap: "wrap",

                      gap: 1,

                      width: {
                        xs: "100%",
                        sm: "auto",
                      },
                    }}
                  >
                    {calculation && (
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                        }}
                      >
                        {formatMoney(calculation.totalCost)}
                      </Typography>
                    )}

                    {!calculation ? (
                      <Chip size="small" label="Chưa tính" color="default" />
                    ) : calculation.isPaid ? (
                      <Chip size="small" label="Đã nhận" color="success" />
                    ) : (
                      <Chip size="small" label="Chưa nhận" color="warning" />
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Paper>

      {/* BACKUP */}
      <Box sx={{ mt: 3 }}>
        <BackupManager />
      </Box>
    </Box>
  );
};

export default Dashboard;
