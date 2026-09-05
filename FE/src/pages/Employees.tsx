import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import {
  Add,
  Badge,
  CalendarMonth,
  Delete,
  Edit,
  Search,
} from "@mui/icons-material";

import { useCallback, useEffect, useMemo, useState } from "react";

import { toast } from "react-toastify";

import { toastConfirm } from "@/utils/toastConfirm";

import { api } from "@/utils/api";

import EmployeeFormDialog from "@/components/EmployeeFormDialog";

import EmployeeAttendanceDialog from "@/components/EmployeeAttendanceDialog";

interface Employee {
  _id: string;

  name: string;

  phone?: string;

  address?: string;

  baseSalary: number;

  isActive?: boolean;

  notes?: string;
}

const Employees = () => {
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [employees, setEmployees] = useState<Employee[]>([]);

  const [loading, setLoading] = useState(false);

  const [searchText, setSearchText] = useState("");

  const [formOpen, setFormOpen] = useState(false);

  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const [attendanceOpen, setAttendanceOpen] = useState(false);

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );

  // =====================================================
  // MONEY
  // =====================================================

  const formatMoney = (value: number) =>
    `${Number(value || 0).toLocaleString("en-US")}đ`;

  ///
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

  // =====================================================
  // FETCH
  // =====================================================

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);

      const data = await api.employees.getAll();

      setEmployees(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Không thể tải nhân viên:", error);

      toast.error("Không thể tải danh sách nhân viên");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // =====================================================
  // FILTER
  // =====================================================

  const filteredEmployees = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    if (!keyword) {
      return employees;
    }

    return employees.filter(
      (employee) =>
        employee.name.toLowerCase().includes(keyword) ||
        employee.phone?.toLowerCase().includes(keyword) ||
        employee.address?.toLowerCase().includes(keyword)
    );
  }, [employees, searchText]);

  // =====================================================
  // CREATE
  // =====================================================

  const handleCreate = () => {
    setEditingEmployee(null);

    setFormOpen(true);
  };

  // =====================================================
  // EDIT
  // =====================================================

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);

    setFormOpen(true);
  };

  // =====================================================
  // ATTENDANCE
  // =====================================================

  const handleAttendance = (employee: Employee) => {
    setSelectedEmployee(employee);

    setAttendanceOpen(true);
  };

  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete = async (employee: Employee) => {
    const confirmed = await toastConfirm({
      title: "Xóa Nhân Viên",

      message: (
        <Box>
          <Typography variant="body2">
            Bạn có chắc chắn muốn xóa nhân viên:
          </Typography>

          <Typography
            sx={{
              mt: 1,
              fontWeight: 800,
              color: "error.main",
            }}
          >
            {employee.name}
          </Typography>

          <Typography
            variant="caption"
            sx={{
              display: "block",
              mt: 1.5,
              color: "warning.main",
              fontWeight: 600,
            }}
          >
            Các ngày nghỉ liên quan có thể vẫn còn trong lịch sử.
          </Typography>
        </Box>
      ),

      confirmText: "Xóa Nhân Viên",
      cancelText: "Hủy",
      confirmColor: "error",
    });

    if (!confirmed) {
      return;
    }

    try {
      await api.employees.delete(employee._id);

      toast.success("Xóa nhân viên thành công");

      await fetchEmployees();
    } catch (error) {
      console.error("Không thể xóa nhân viên:", error);

      toast.error(
        error instanceof Error ? error.message : "Không thể xóa nhân viên"
      );
    }
  };

  return (
    <Box>
      {/* =====================================================
            HEADER
        ===================================================== */}

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
        <Box>
          <Typography
            variant={isMobile ? "h5" : "h4"}
            sx={{
              fontWeight: 800,
            }}
          >
            Quản Lý Nhân Viên
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.5,
            }}
          >
            Quản lý nhân viên, ngày nghỉ và tiền lương
          </Typography>
        </Box>

        <Button variant="contained" startIcon={<Add />} onClick={handleCreate}>
          Thêm Nhân Viên
        </Button>
      </Box>

      {/* =====================================================
            FILTER
        ===================================================== */}

      <Paper
        variant="outlined"
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 2.5,
        }}
      >
        <TextField
          fullWidth
          size="small"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Tìm tên, số điện thoại, địa chỉ..."
          slotProps={{
            input: {
              startAdornment: (
                <Search
                  sx={{
                    mr: 1,
                    color: "text.secondary",
                  }}
                />
              ),
            },
          }}
        />

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: "block",
            mt: 1.5,
          }}
        >
          Đang hiển thị <strong>{filteredEmployees.length}</strong> /{" "}
          {employees.length} nhân viên
        </Typography>
      </Paper>

      {/* =====================================================
            LOADING
        ===================================================== */}

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
      ) : filteredEmployees.length === 0 ? (
        <Paper
          variant="outlined"
          sx={{
            py: 8,

            textAlign: "center",

            borderRadius: 3,
          }}
        >
          <Badge
            sx={{
              fontSize: 50,

              color: "text.disabled",

              mb: 1,
            }}
          />

          <Typography color="text.secondary">Chưa có nhân viên</Typography>
        </Paper>
      ) : isMobile ? (
        /* =================================================
             MOBILE
          ================================================= */

        <Box
          sx={{
            display: "flex",

            flexDirection: "column",

            gap: 2,
          }}
        >
          {filteredEmployees.map((employee) => (
            <Card
              key={employee._id}
              variant="outlined"
              sx={{
                borderRadius: 2.5,
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,

                    textAlign: "center",

                    mb: 2,
                  }}
                >
                  {employee.name}
                </Typography>

                <Box
                  sx={{
                    display: "grid",

                    gridTemplateColumns: "1fr 1fr",

                    gap: 1.5,
                  }}
                >
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Số điện thoại
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                      }}
                    >
                      {employee.phone || "-"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Lương gốc
                    </Typography>

                    <Typography
                      variant="body2"
                      color="success.main"
                      sx={{
                        fontWeight: 800,
                      }}
                    >
                      {formatMoney(employee.baseSalary)}
                    </Typography>

                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        mt: 0.3,

                        color: "text.secondary",

                        fontStyle: "italic",

                        lineHeight: 1.35,
                      }}
                    >
                      {numberToVietnameseWords(employee.baseSalary)}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      gridColumn: "1 / -1",
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Địa chỉ
                    </Typography>

                    <Typography variant="body2">
                      {employee.address || "-"}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>

              <CardActions
                sx={{
                  display: "grid",

                  gridTemplateColumns: "1fr auto auto",

                  gap: 0.5,

                  px: 2,
                  pb: 2,
                }}
              >
                <Button
                  variant="outlined"
                  startIcon={<CalendarMonth />}
                  onClick={() => handleAttendance(employee)}
                >
                  Chấm Công
                </Button>

                <IconButton
                  color="primary"
                  onClick={() => handleEdit(employee)}
                >
                  <Edit />
                </IconButton>

                <IconButton
                  color="error"
                  onClick={() => handleDelete(employee)}
                >
                  <Delete />
                </IconButton>
              </CardActions>
            </Card>
          ))}
        </Box>
      ) : (
        /* =================================================
             DESKTOP
          ================================================= */

        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 2.5,

            overflow: "hidden",

            border: "1px solid",

            borderColor: "divider",
          }}
        >
          <Table>
            <TableHead>
              <TableRow
                sx={(theme) => ({
                  backgroundColor:
                    theme.palette.mode === "dark" ? "#1e293b" : "#f5f7fa",

                  "& .MuiTableCell-head": {
                    color:
                      theme.palette.mode === "dark"
                        ? "#f8fafc"
                        : "text.primary",

                    fontWeight: 700,
                  },
                })}
              >
                <TableCell>Nhân Viên</TableCell>

                <TableCell>Số Điện Thoại</TableCell>

                <TableCell>Địa Chỉ</TableCell>

                <TableCell>Lương Gốc</TableCell>

                <TableCell align="center">Hành Động</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee._id} hover>
                  <TableCell>
                    <Typography
                      sx={{
                        fontWeight: 700,
                      }}
                    >
                      {employee.name}
                    </Typography>
                  </TableCell>

                  <TableCell>{employee.phone || "-"}</TableCell>

                  <TableCell>{employee.address || "-"}</TableCell>

                  <TableCell>
                    <Typography
                      color="success.main"
                      sx={{
                        fontWeight: 700,
                      }}
                    >
                      {formatMoney(employee.baseSalary)}
                    </Typography>

                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        mt: 0.3,
                        color: "text.secondary",
                        fontStyle: "italic",
                        lineHeight: 1.35,
                      }}
                    >
                      {numberToVietnameseWords(employee.baseSalary)}
                    </Typography>
                  </TableCell>

                  <TableCell align="center">
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<CalendarMonth />}
                      onClick={() => handleAttendance(employee)}
                      sx={{
                        mr: 1,
                      }}
                    >
                      Chấm Công
                    </Button>

                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleEdit(employee)}
                    >
                      <Edit fontSize="small" />
                    </IconButton>

                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(employee)}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* =====================================================
            FORM
        ===================================================== */}

      <EmployeeFormDialog
        open={formOpen}
        employee={editingEmployee}
        onClose={() => {
          setFormOpen(false);

          setEditingEmployee(null);
        }}
        onSaved={fetchEmployees}
      />

      {/* =====================================================
            ATTENDANCE
        ===================================================== */}

      <EmployeeAttendanceDialog
        open={attendanceOpen}
        employee={selectedEmployee}
        onClose={() => {
          setAttendanceOpen(false);

          setSelectedEmployee(null);
        }}
      />
    </Box>
  );
};

export default Employees;
