import {
  AccountBalanceWallet,
  Add,
  History,
  Payment,
  Search,
  TrendingDown,
  TrendingUp,
} from "@mui/icons-material";

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  InputAdornment,
  Paper,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import { useCallback, useEffect, useMemo, useState } from "react";

import { toast } from "react-toastify";

import { api } from "@/utils/api";

import DebtFormDialog from "@/components/DebtFormDialog";

import DebtHistoryDialog from "@/components/DebtHistoryDialog";

interface OwnerDebtSummary extends Owners.Owner {
  totalDebt: number;
  totalPayment: number;
  balance: number;
  transactionCount: number;
}

const Debts = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [loading, setLoading] = useState(true);
  const [owners, setOwners] = useState<OwnerDebtSummary[]>([]);
  const [summary, setSummary] = useState<Debts.Summary | null>(null);
  const [searchText, setSearchText] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<OwnerDebtSummary | null>(
    null
  );
  const [editingTransaction, setEditingTransaction] =
    useState<Debts.DebtTransaction | null>(null);
  const [defaultType, setDefaultType] = useState<Debts.DebtType>("DEBT");
  const [defaultOwnerId, setDefaultOwnerId] = useState("");

  // =====================================================
  // MONEY
  // =====================================================

  const formatMoney = (value: number) =>
    `${Number(value || 0).toLocaleString("en-US")}đ`;

  // =====================================================
  // LOAD
  // =====================================================

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const [ownersData, summaryData] = await Promise.all([
        api.owners.getAll(),
        api.debts.getSummary(),
      ]);

      const summaryMap = new Map<string, Debts.OwnerSummary>();

      for (const item of summaryData.owners) {
        summaryMap.set(item.owner._id, item);
      }

      const merged: OwnerDebtSummary[] = ownersData.map((owner) => {
        const debt = summaryMap.get(owner._id);

        return {
          ...owner,
          totalDebt: debt?.totalDebt ?? 0,
          totalPayment: debt?.totalPayment ?? 0,
          balance: debt?.balance ?? 0,
          transactionCount: debt?.transactionCount ?? 0,
        };
      });

      merged.sort(
        (a, b) => b.balance - a.balance || a.name.localeCompare(b.name, "vi")
      );

      setOwners(merged);
      setSummary(summaryData);
    } catch (error) {
      console.error("Không thể tải công nợ:", error);
      toast.error(
        error instanceof Error ? error.message : "Không thể tải dữ liệu công nợ"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // =====================================================
  // SEARCH
  // =====================================================

  const normalize = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const filteredOwners = useMemo(() => {
    const search = normalize(searchText);

    if (!search) {
      return owners;
    }

    return owners.filter(
      (owner) =>
        normalize(owner.name || "").includes(search) ||
        normalize(owner.contact || "").includes(search) ||
        normalize(owner.address || "").includes(search)
    );
  }, [owners, searchText]);

  // =====================================================
  // HANDLERS
  // =====================================================

  const handleCreate = (type: Debts.DebtType, owner?: OwnerDebtSummary) => {
    setEditingTransaction(null);
    setDefaultType(type);
    setDefaultOwnerId(owner?._id || "");
    setFormOpen(true);
  };

  const handleEdit = (transaction: Debts.DebtTransaction) => {
    setEditingTransaction(transaction);
    setDefaultOwnerId("");
    setFormOpen(true);
  };

  const handleHistory = (owner: OwnerDebtSummary) => {
    setSelectedOwner(owner);
    setHistoryOpen(true);
  };

  const handleChanged = async () => {
    await fetchData();
  };

  return (
    <>
      <Box>
        {/* =================================================
                HEADER
            ================================================= */}

        <Box
          sx={{
            display: "flex",
            flexDirection: {
              xs: "column",
              sm: "row",
            },
            alignItems: {
              xs: "center",
              sm: "center",
            },
            justifyContent: "space-between",
            gap: 1.5,
            mb: 2.5,
            textAlign: {
              xs: "center",
              sm: "left",
            },
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: {
                  xs: 25,
                  sm: 30,
                },
                fontWeight: 900,
              }}
            >
              💰 Công Nợ
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Theo dõi ghi nợ và thu nợ độc lập với nhật ký
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: 1,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <Button
              variant="contained"
              color="error"
              startIcon={<Add />}
              onClick={() => handleCreate("DEBT")}
              fullWidth={isMobile}
              sx={{
                minHeight: 44,
                fontWeight: 800,
              }}
            >
              Ghi Nợ
            </Button>

            <Button
              variant="contained"
              color="success"
              startIcon={<Payment />}
              onClick={() => handleCreate("PAYMENT")}
              fullWidth={isMobile}
              sx={{
                minHeight: 44,
                fontWeight: 800,
              }}
            >
              Thu Nợ
            </Button>
          </Box>
        </Box>

        {/* =================================================
                SUMMARY
            ================================================= */}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(3, 1fr)",
            },
            gap: 1.5,
            mb: 2,
          }}
        >
          {/* GHI NỢ */}
          <Card
            sx={{
              borderRadius: 3,
              border: "1px solid",
              borderColor: "rgba(244,67,54,0.25)",
            }}
          >
            <CardContent
              sx={{
                textAlign: {
                  xs: "center",
                  sm: "left",
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: {
                    xs: "center",
                    sm: "flex-start",
                  },
                  gap: 1,
                  color: "error.main",
                }}
              >
                <TrendingUp />
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  Tổng Ghi Nợ
                </Typography>
              </Box>

              <Typography
                sx={{
                  mt: 1,
                  fontSize: {
                    xs: 24,
                    sm: 28,
                  },
                  fontWeight: 900,
                  color: "error.main",
                }}
              >
                {formatMoney(summary?.totalDebt ?? 0)}
              </Typography>
            </CardContent>
          </Card>

          {/* THU NỢ */}
          <Card
            sx={{
              borderRadius: 3,
              border: "1px solid",
              borderColor: "rgba(76,175,80,0.25)",
            }}
          >
            <CardContent
              sx={{
                textAlign: {
                  xs: "center",
                  sm: "left",
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: {
                    xs: "center",
                    sm: "flex-start",
                  },
                  gap: 1,
                  color: "success.main",
                }}
              >
                <TrendingDown />
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  Tổng Đã Thu
                </Typography>
              </Box>

              <Typography
                sx={{
                  mt: 1,
                  fontSize: {
                    xs: 24,
                    sm: 28,
                  },
                  fontWeight: 900,
                  color: "success.main",
                }}
              >
                {formatMoney(summary?.totalPayment ?? 0)}
              </Typography>
            </CardContent>
          </Card>

          {/* CÒN NỢ */}
          <Card
            sx={{
              borderRadius: 3,
              border: "1px solid",
              borderColor: "rgba(255,152,0,0.3)",
            }}
          >
            <CardContent
              sx={{
                textAlign: {
                  xs: "center",
                  sm: "left",
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: {
                    xs: "center",
                    sm: "flex-start",
                  },
                  gap: 1,
                  color: "warning.main",
                }}
              >
                <AccountBalanceWallet />
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  Còn Phải Thu
                </Typography>
              </Box>

              <Typography
                sx={{
                  mt: 1,
                  fontSize: {
                    xs: 24,
                    sm: 28,
                  },
                  fontWeight: 900,
                  color: "warning.main",
                }}
              >
                {formatMoney(summary?.totalBalance ?? 0)}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* =================================================
                SEARCH
            ================================================= */}

        <TextField
          fullWidth
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          placeholder="Tìm chủ động vật..."
          sx={{
            mb: 2,
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            },
          }}
        />

        {/* =================================================
                LOADING
            ================================================= */}

        {loading && (
          <Box
            sx={{
              py: 8,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <CircularProgress />
          </Box>
        )}

        {/* =================================================
                OWNER LIST
            ================================================= */}

        {!loading && (
          <>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 1.5,
              }}
            >
              <Typography
                sx={{
                  fontWeight: 900,
                }}
              >
                Danh Sách Công Nợ
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {filteredOwners.length} chủ
              </Typography>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  lg: "repeat(3, 1fr)",
                },
                gap: 1.5,
              }}
            >
              {filteredOwners.map((owner) => {
                const hasDebt = owner.balance > 0;

                return (
                  <Card
                    key={owner._id}
                    sx={{
                      borderRadius: 3,
                      border: "1px solid",
                      borderColor: hasDebt ? "rgba(255,152,0,0.35)" : "divider",
                      transition: "0.2s ease",
                      "&:hover": {
                        borderColor: hasDebt ? "warning.main" : "primary.main",
                      },
                    }}
                  >
                    <CardContent>
                      {/* OWNER */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                          gap: 1,
                          mb: 1.5,
                        }}
                      >
                        <Box
                          sx={{
                            minWidth: 0,
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: 18,
                              fontWeight: 900,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {owner.name}
                          </Typography>

                          {owner.contact && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {owner.contact}
                            </Typography>
                          )}
                        </Box>

                        <Chip
                          size="small"
                          label={hasDebt ? "Còn nợ" : "Đã đủ"}
                          color={hasDebt ? "warning" : "success"}
                          variant="outlined"
                        />
                      </Box>

                      {/* BALANCE */}
                      <Box
                        sx={{
                          p: 1.5,
                          mb: 1.5,
                          borderRadius: 2.5,
                          textAlign: "center",
                          backgroundColor: hasDebt
                            ? "rgba(255,152,0,0.08)"
                            : "rgba(76,175,80,0.08)",
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          Còn phải thu
                        </Typography>

                        <Typography
                          sx={{
                            mt: 0.25,
                            fontSize: 24,
                            fontWeight: 900,
                            color: hasDebt ? "warning.main" : "success.main",
                          }}
                        >
                          {formatMoney(owner.balance)}
                        </Typography>
                      </Box>

                      {/* TOTALS */}
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 1,
                          mb: 1.5,
                        }}
                      >
                        <Box
                          sx={{
                            textAlign: "center",
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            Đã ghi
                          </Typography>

                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 800,
                              color: "error.main",
                            }}
                          >
                            {formatMoney(owner.totalDebt)}
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            textAlign: "center",
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            Đã thu
                          </Typography>

                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 800,
                              color: "success.main",
                            }}
                          >
                            {formatMoney(owner.totalPayment)}
                          </Typography>
                        </Box>
                      </Box>

                      {/* ACTIONS */}
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr 1fr",
                          gap: 0.75,
                        }}
                      >
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<Add />}
                          onClick={() => handleCreate("DEBT", owner)}
                          sx={{
                            minWidth: 0,
                            fontWeight: 700,
                          }}
                        >
                          Nợ
                        </Button>

                        <Button
                          size="small"
                          variant="outlined"
                          color="success"
                          startIcon={<Payment />}
                          disabled={owner.balance <= 0}
                          onClick={() => handleCreate("PAYMENT", owner)}
                          sx={{
                            minWidth: 0,
                            fontWeight: 700,
                          }}
                        >
                          Thu
                        </Button>

                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<History />}
                          onClick={() => handleHistory(owner)}
                          sx={{
                            minWidth: 0,
                            fontWeight: 700,
                          }}
                        >
                          Lịch sử
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>

            {filteredOwners.length === 0 && (
              <Paper
                variant="outlined"
                sx={{
                  py: 6,
                  textAlign: "center",
                  borderRadius: 3,
                }}
              >
                <AccountBalanceWallet
                  sx={{
                    fontSize: 44,
                    color: "text.disabled",
                  }}
                />

                <Typography
                  sx={{
                    mt: 1,
                    fontWeight: 800,
                  }}
                >
                  Không tìm thấy chủ
                </Typography>
              </Paper>
            )}
          </>
        )}
      </Box>

      {/* ===================================================
              FORM
          =================================================== */}

      <DebtFormDialog
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingTransaction(null);
        }}
        owners={owners}
        debt={editingTransaction}
        defaultOwnerId={editingTransaction ? "" : defaultOwnerId}
        defaultType={defaultType}
        onSaved={handleChanged}
      />

      {/* ===================================================
              HISTORY
          =================================================== */}

      <DebtHistoryDialog
        open={historyOpen}
        owner={selectedOwner}
        onClose={() => setHistoryOpen(false)}
        onEdit={handleEdit}
        onChanged={handleChanged}
      />
    </>
  );
};

export default Debts;
