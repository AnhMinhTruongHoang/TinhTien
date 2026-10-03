import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import { Close, Delete, Edit, Payment } from "@mui/icons-material";

import { useEffect, useState } from "react";

import { toast } from "react-toastify";

import { api } from "@/utils/api";

import { toastConfirm } from "@/utils/toastConfirm";

interface Props {
  open: boolean;

  owner: Owners.Owner | null;

  onClose: () => void;

  onEdit?: (transaction: Debts.DebtTransaction) => void;

  onChanged?: () => void | Promise<void>;
}

const DebtHistoryDialog = ({
  open,
  owner,
  onClose,
  onEdit,
  onChanged,
}: Props) => {
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [loading, setLoading] = useState(false);

  const [history, setHistory] = useState<Debts.OwnerHistory | null>(null);

  const formatMoney = (value: number) =>
    `${Number(value || 0).toLocaleString("en-US")}đ`;

  const formatDate = (value: string) => {
    if (!value) {
      return "—";
    }

    return new Date(value).toLocaleDateString("vi-VN");
  };

  const fetchHistory = async () => {
    if (!owner?._id) {
      return;
    }

    try {
      setLoading(true);

      const data = await api.debts.getByOwner(owner._id);

      setHistory(data);
    } catch (error) {
      console.error("Không thể tải lịch sử công nợ:", error);

      toast.error(
        error instanceof Error ? error.message : "Không thể tải lịch sử công nợ"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open || !owner?._id) {
      return;
    }

    fetchHistory();
  }, [open, owner?._id]);

  const handleDelete = async (transaction: Debts.DebtTransaction) => {
    const confirmed = await toastConfirm({
      title:
        transaction.type === "DEBT" ? "Xóa khoản ghi nợ?" : "Xóa khoản thu nợ?",

      message: (
        <Box
          sx={{
            textAlign: "center",
          }}
        >
          <Typography>{formatMoney(transaction.amount)}</Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {transaction.note || "Không có ghi chú"}
          </Typography>
        </Box>
      ),

      confirmText: "Xóa",

      cancelText: "Hủy",

      confirmColor: "error",
    });

    if (!confirmed) {
      return;
    }

    try {
      await api.debts.delete(transaction._id);

      toast.success("Đã xóa giao dịch công nợ");

      await fetchHistory();

      await onChanged?.();
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error ? error.message : "Không thể xóa giao dịch"
      );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      slotProps={{
        paper: {
          sx: {
            width: isMobile ? "calc(100% - 20px)" : "100%",

            borderRadius: 3,

            backgroundImage: "none",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          textAlign: "center",
          fontWeight: 900,
          pb: 1,
        }}
      >
        Lịch Sử Công Nợ
      </DialogTitle>

      <DialogContent>
        {/* =================================================
              OWNER
          ================================================= */}

        <Box
          sx={{
            textAlign: "center",
            mb: 2,
          }}
        >
          <Typography
            sx={{
              fontSize: 20,
              fontWeight: 900,
            }}
          >
            {owner?.name || "—"}
          </Typography>

          {owner?.contact && (
            <Typography variant="body2" color="text.secondary">
              {owner.contact}
            </Typography>
          )}
        </Box>

        {/* =================================================
              SUMMARY
          ================================================= */}

        {history && (
          <Box
            sx={{
              display: "grid",

              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(3, 1fr)",
              },

              gap: 1,

              mb: 2,
            }}
          >
            <Paper
              variant="outlined"
              sx={{
                p: 1.5,
                textAlign: "center",
                borderRadius: 2,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Đã ghi nợ
              </Typography>

              <Typography
                sx={{
                  mt: 0.25,
                  fontWeight: 900,
                  color: "error.main",
                }}
              >
                {formatMoney(history.totalDebt)}
              </Typography>
            </Paper>

            <Paper
              variant="outlined"
              sx={{
                p: 1.5,
                textAlign: "center",
                borderRadius: 2,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Đã thu
              </Typography>

              <Typography
                sx={{
                  mt: 0.25,
                  fontWeight: 900,
                  color: "success.main",
                }}
              >
                {formatMoney(history.totalPayment)}
              </Typography>
            </Paper>

            <Paper
              variant="outlined"
              sx={{
                p: 1.5,
                textAlign: "center",
                borderRadius: 2,
                borderColor:
                  history.balance > 0 ? "warning.main" : "success.main",
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Còn nợ
              </Typography>

              <Typography
                sx={{
                  mt: 0.25,
                  fontWeight: 900,
                  color: history.balance > 0 ? "warning.main" : "success.main",
                }}
              >
                {formatMoney(history.balance)}
              </Typography>
            </Paper>
          </Box>
        )}

        <Divider sx={{ mb: 2 }} />

        {/* =================================================
              LOADING
          ================================================= */}

        {loading && (
          <Box
            sx={{
              py: 6,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <CircularProgress />
          </Box>
        )}

        {/* =================================================
              EMPTY
          ================================================= */}

        {!loading && history && history.transactions.length === 0 && (
          <Box
            sx={{
              py: 5,
              textAlign: "center",
            }}
          >
            <Payment
              sx={{
                fontSize: 42,
                color: "text.disabled",
              }}
            />

            <Typography
              sx={{
                mt: 1,
                fontWeight: 700,
              }}
            >
              Chưa có giao dịch
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Chủ này chưa có ghi nhận công nợ.
            </Typography>
          </Box>
        )}

        {/* =================================================
              MOBILE
          ================================================= */}

        {!loading && history && history.transactions.length > 0 && isMobile && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1.25,
            }}
          >
            {history.transactions.map((transaction) => {
              const isDebt = transaction.type === "DEBT";

              return (
                <Paper
                  key={transaction._id}
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    borderRadius: 2.5,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 1,
                    }}
                  >
                    <Box
                      sx={{
                        minWidth: 0,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(transaction.date)}
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.25,
                          fontWeight: 800,
                          color: isDebt ? "error.main" : "success.main",
                        }}
                      >
                        {isDebt ? "+ " : "- "}
                        {formatMoney(transaction.amount)}
                      </Typography>

                      {transaction.note && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mt: 0.5,
                            wordBreak: "break-word",
                          }}
                        >
                          {transaction.note}
                        </Typography>
                      )}
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        gap: 0.25,
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={() => {
                          onEdit?.(transaction);
                          onClose();
                        }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>

                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(transaction)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: "block",
                      mt: 1,
                      textAlign: "right",
                    }}
                  >
                    Còn nợ sau giao dịch:{" "}
                    <strong>
                      {formatMoney(transaction.balanceAfter || 0)}
                    </strong>
                  </Typography>
                </Paper>
              );
            })}
          </Box>
        )}

        {/* =================================================
              DESKTOP
          ================================================= */}

        {!loading &&
          history &&
          history.transactions.length > 0 &&
          !isMobile && (
            <TableContainer
              component={Paper}
              variant="outlined"
              sx={{
                borderRadius: 2.5,
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Ngày</TableCell>

                    <TableCell>Loại</TableCell>

                    <TableCell align="right">Số tiền</TableCell>

                    <TableCell>Ghi chú</TableCell>

                    <TableCell align="right">Còn nợ</TableCell>

                    <TableCell align="center">Thao tác</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {history.transactions.map((transaction) => {
                    const isDebt = transaction.type === "DEBT";

                    return (
                      <TableRow key={transaction._id}>
                        <TableCell>{formatDate(transaction.date)}</TableCell>

                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 700,
                              color: isDebt ? "error.main" : "success.main",
                            }}
                          >
                            {isDebt ? "Ghi nợ" : "Thu nợ"}
                          </Typography>
                        </TableCell>

                        <TableCell align="right">
                          <Typography
                            sx={{
                              fontWeight: 800,
                              color: isDebt ? "error.main" : "success.main",
                            }}
                          >
                            {isDebt ? "+" : "-"}
                            {formatMoney(transaction.amount)}
                          </Typography>
                        </TableCell>

                        <TableCell>{transaction.note || "—"}</TableCell>

                        <TableCell align="right">
                          <Typography
                            sx={{
                              fontWeight: 800,
                            }}
                          >
                            {formatMoney(transaction.balanceAfter || 0)}
                          </Typography>
                        </TableCell>

                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() => {
                              onEdit?.(transaction);
                              onClose();
                            }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>

                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(transaction)}
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

        <Box
          sx={{
            mt: 2,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<Close />}
            onClick={onClose}
            sx={{
              minWidth: 140,
              minHeight: 44,
              fontWeight: 700,
            }}
          >
            Đóng
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default DebtHistoryDialog;
