import { Box, Divider, Paper, Typography } from "@mui/material";

import dayjs from "dayjs";

interface Employee {
  name: string;
}

interface PayrollShareCardProps {
  employee: Employee;

  month: string;

  baseSalary: number;

  presentDays: number;

  absenceDays: number;

  totalDeduction: number;

  finalSalary: number;
}

const formatMoney = (value: number) =>
  `${Number(value || 0).toLocaleString("vi-VN")}đ`;

const PayrollShareCard = ({
  employee,
  month,
  baseSalary,
  presentDays,
  absenceDays,
  totalDeduction,
  finalSalary,
}: PayrollShareCardProps) => {
  return (
    <Paper
      id="payroll-share-card"
      elevation={0}
      sx={{
        width: 720,

        p: 4,

        borderRadius: 3,

        backgroundColor: "#ffffff",

        color: "#111827",

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
            fontWeight: 800,
            fontSize: 24,
          }}
        >
          Cơ sở giết mổ gia súc, gia cầm
        </Typography>

        <Typography
          sx={{
            fontWeight: 900,
            fontSize: 28,
          }}
        >
          Hoàng Thị Liêm
        </Typography>

        <Typography
          sx={{
            mt: 1,
            fontWeight: 700,
            fontSize: 20,
          }}
        >
          BẢNG LƯƠNG NHÂN VIÊN
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

      {/* EMPLOYEE */}

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
              color: "#6b7280",
              fontSize: 13,
            }}
          >
            Nhân viên
          </Typography>

          <Typography
            sx={{
              fontWeight: 800,
              fontSize: 18,
            }}
          >
            {employee.name}
          </Typography>
        </Box>

        <Box
          sx={{
            textAlign: "right",
          }}
        >
          <Typography
            sx={{
              color: "#6b7280",
              fontSize: 13,
            }}
          >
            Tháng lương
          </Typography>

          <Typography
            sx={{
              fontWeight: 700,
            }}
          >
            {dayjs(`${month}-01`).format("MM/YYYY")}
          </Typography>
        </Box>
      </Box>

      {/* SUMMARY */}

      <Box
        sx={{
          display: "grid",

          gridTemplateColumns: "repeat(2, 1fr)",

          gap: 1.5,
        }}
      >
        {[
          {
            label: "Lương gốc",

            value: formatMoney(baseSalary),
          },

          {
            label: "Ngày đi làm",

            value: `${presentDays} ngày`,
          },

          {
            label: "Ngày nghỉ",

            value: `${absenceDays} ngày`,
          },

          {
            label: "Tổng tiền trừ",

            value: formatMoney(totalDeduction),
          },
        ].map((item) => (
          <Box
            key={item.label}
            sx={{
              p: 2,

              borderRadius: 2,

              backgroundColor: "#f8fafc",

              border: "1px solid #e5e7eb",
            }}
          >
            <Typography
              sx={{
                fontSize: 13,
                color: "#6b7280",
              }}
            >
              {item.label}
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontWeight: 800,
                fontSize: 18,
              }}
            >
              {item.value}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* FINAL */}

      <Box
        sx={{
          mt: 2.5,

          p: 2.5,

          borderRadius: 2,

          backgroundColor: "#ecfdf5",

          border: "1px solid #86efac",

          textAlign: "center",
        }}
      >
        <Typography
          sx={{
            color: "#166534",
            fontWeight: 700,
          }}
        >
          THỰC NHẬN
        </Typography>

        <Typography
          sx={{
            mt: 0.5,

            color: "#15803d",

            fontSize: 30,

            fontWeight: 900,
          }}
        >
          {formatMoney(finalSalary)}
        </Typography>
      </Box>

      <Typography
        sx={{
          mt: 3,

          textAlign: "center",

          fontSize: 12,

          color: "#9ca3af",
        }}
      >
        Ngày tạo: {dayjs().format("DD/MM/YYYY HH:mm")}
      </Typography>
    </Paper>
  );
};

export default PayrollShareCard;
