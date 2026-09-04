import { Box, Divider, Paper, Typography } from "@mui/material";

import dayjs from "dayjs";

interface OwnerMonthlyReportCardProps {
  ownerName: string;
  animalTypeName: string;
  month: string;

  totalDays: number;
  totalQuantity: number;

  calculatedDays: number;

  totalCost: number;
  totalPaid: number;
  totalUnpaid: number;

  paidDays: number;
  unpaidDays: number;
}

const formatMoney = (value: number) =>
  `${Number(value || 0).toLocaleString("vi-VN")}đ`;

const OwnerMonthlyReportCard = ({
  ownerName,
  animalTypeName,
  month,

  totalDays,
  totalQuantity,

  calculatedDays,

  totalCost,
  totalPaid,
  totalUnpaid,

  paidDays,
  unpaidDays,
}: OwnerMonthlyReportCardProps) => {
  return (
    <Paper
      id="owner-monthly-report-card"
      elevation={0}
      sx={{
        width: 760,

        p: 4,

        backgroundColor: "#ffffff",

        color: "#111827",

        borderRadius: 3,

        border: "1px solid #e5e7eb",
      }}
    >
      {/* HEADER */}

      <Box
        sx={{
          textAlign: "center",
          mb: 2.5,
        }}
      >
        <Typography
          sx={{
            fontSize: 22,
            fontWeight: 800,
          }}
        >
          <i> Cơ sở giết mổ gia súc, gia cầm</i>
        </Typography>

        <Typography
          sx={{
            fontSize: 28,
            fontWeight: 900,
          }}
        >
          Hoàng Thị Liêm
        </Typography>

        <Typography
          sx={{
            mt: 1.5,

            fontSize: 20,

            fontWeight: 900,
          }}
        >
          BÁO CÁO CHI PHÍ THÁNG
        </Typography>

        <Typography
          sx={{
            mt: 0.5,

            color: "#6b7280",
          }}
        >
          Tháng {dayjs(`${month}-01`).format("MM/YYYY")}
        </Typography>
      </Box>

      <Divider />

      {/* OWNER */}

      <Box
        sx={{
          py: 2.5,

          display: "grid",

          gridTemplateColumns: "1fr 1fr",

          gap: 2,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: 13,
              color: "#6b7280",
            }}
          >
            Chủ gia súc
          </Typography>

          <Typography
            sx={{
              mt: 0.25,

              fontSize: 19,

              fontWeight: 900,
            }}
          >
            {ownerName}
          </Typography>
        </Box>

        <Box
          sx={{
            textAlign: "right",
          }}
        >
          <Typography
            sx={{
              fontSize: 13,
              color: "#6b7280",
            }}
          >
            Loại động vật
          </Typography>

          <Typography
            sx={{
              mt: 0.25,

              fontSize: 18,

              fontWeight: 800,
            }}
          >
            {animalTypeName}
          </Typography>
        </Box>
      </Box>

      {/* BASIC SUMMARY */}

      <Box
        sx={{
          display: "grid",

          gridTemplateColumns: "repeat(3, 1fr)",

          gap: 1.5,

          mb: 2,
        }}
      >
        {[
          {
            label: "Số ngày làm ",

            value: `${totalDays} ngày`,
          },

          {
            label: "Tổng số con",

            value: `${totalQuantity.toLocaleString("vi-VN")} con`,
          },

          {
            label: "Ngày đã tính",

            value: `${calculatedDays}/${totalDays} ngày`,
          },
        ].map((item) => (
          <Box
            key={item.label}
            sx={{
              p: 2,

              textAlign: "center",

              borderRadius: 2,

              backgroundColor: "#f8fafc",

              border: "1px solid #e5e7eb",
            }}
          >
            <Typography
              sx={{
                fontSize: 12,
                color: "#6b7280",
              }}
            >
              {item.label}
            </Typography>

            <Typography
              sx={{
                mt: 0.5,

                fontSize: 17,

                fontWeight: 800,
              }}
            >
              {item.value}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* MONEY */}

      <Box
        sx={{
          display: "grid",

          gridTemplateColumns: "repeat(3, 1fr)",

          gap: 1.5,
        }}
      >
        <Box
          sx={{
            p: 2,

            borderRadius: 2,

            backgroundColor: "#eff6ff",

            border: "1px solid #bfdbfe",
          }}
        >
          <Typography
            sx={{
              fontSize: 12,
              color: "#64748b",
            }}
          >
            Tổng chi phí
          </Typography>

          <Typography
            sx={{
              mt: 0.5,

              fontSize: 19,

              fontWeight: 900,

              color: "#2563eb",
            }}
          >
            {formatMoney(totalCost)}
          </Typography>
        </Box>

        <Box
          sx={{
            p: 2,

            borderRadius: 2,

            backgroundColor: "#ecfdf5",

            border: "1px solid #86efac",
          }}
        >
          <Typography
            sx={{
              fontSize: 12,
              color: "#64748b",
            }}
          >
            Đã nhận
          </Typography>

          <Typography
            sx={{
              mt: 0.5,

              fontSize: 19,

              fontWeight: 900,

              color: "#15803d",
            }}
          >
            {formatMoney(totalPaid)}
          </Typography>
        </Box>

        <Box
          sx={{
            p: 2,

            borderRadius: 2,

            backgroundColor: "#fff7ed",

            border: "1px solid #fdba74",
          }}
        >
          <Typography
            sx={{
              fontSize: 12,
              color: "#64748b",
            }}
          >
            Chưa nhận
          </Typography>

          <Typography
            sx={{
              mt: 0.5,

              fontSize: 19,

              fontWeight: 900,

              color: "#ea580c",
            }}
          >
            {formatMoney(totalUnpaid)}
          </Typography>
        </Box>
      </Box>

      {/* PAYMENT STATUS */}

      <Box
        sx={{
          mt: 2.5,

          p: 2,

          borderRadius: 2,

          backgroundColor: totalUnpaid <= 0 ? "#ecfdf5" : "#fffbeb",

          border: "1px solid",

          borderColor: totalUnpaid <= 0 ? "#86efac" : "#fcd34d",
        }}
      >
        <Typography
          sx={{
            fontWeight: 800,

            color: totalUnpaid <= 0 ? "#15803d" : "#b45309",
          }}
        >
          {totalUnpaid <= 0
            ? "✓ Đã thanh toán đầy đủ"
            : `Còn ${unpaidDays} ngày chưa thanh toán`}
        </Typography>

        <Typography
          sx={{
            mt: 0.5,

            fontSize: 13,

            color: "#64748b",
          }}
        >
          Đã nhận tiền: {paidDays}/{calculatedDays} ngày đã tính
        </Typography>
      </Box>

      {/* FOOTER */}

      <Divider
        sx={{
          my: 2.5,
        }}
      />

      <Box
        sx={{
          display: "flex",

          justifyContent: "space-between",

          alignItems: "center",
        }}
      >
        <Typography
          sx={{
            fontSize: 12,

            color: "#9ca3af",
          }}
        >
          Báo cáo được tạo từ hệ thống quản lý chi phí
        </Typography>

        <Typography
          sx={{
            fontSize: 12,

            color: "#9ca3af",
          }}
        >
          {dayjs().format("DD/MM/YYYY HH:mm")}
        </Typography>
      </Box>
    </Paper>
  );
};

export default OwnerMonthlyReportCard;
