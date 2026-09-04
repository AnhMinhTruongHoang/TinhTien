import { useState, useEffect } from "react";
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
  Dialog,
  TextField,
  Typography,
  IconButton,
  Card,
  CardContent,
  useMediaQuery,
  useTheme,
  CardActions,
} from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";
import { api } from "@/utils/api";

const Owners = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [owners, setOwners] = useState<Owners.Owner[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState<Owners.CreateOwnerDto>({
    name: "",
    contact: "",
    address: "",
  });

  // Hàm chuẩn hóa: bỏ dấu tiếng Việt + lowercase
  const normalizeString = (str: string) =>
    str
      .normalize("NFD") // tách ký tự và dấu
      .replace(/[\u0300-\u036f]/g, "") // xóa dấu
      .toLowerCase();

  const filteredOwners = owners.filter((o) => {
    const name = normalizeString(o.name || "");
    const contact = normalizeString(o.contact || "");
    const address = normalizeString(o.address || "");
    const search = normalizeString(searchTerm);

    return (
      name.includes(search) ||
      contact.includes(search) ||
      address.includes(search)
    );
  });

  useEffect(() => {
    fetchOwners();
  }, []);

  const fetchOwners = async () => {
    try {
      const data = await api.owners.getAll();
      setOwners(data);
    } catch (error) {
      console.error("Error fetching owners:", error);
    }
  };

  const handleOpen = (owner?: Owners.Owner) => {
    if (owner) {
      setFormData(owner);
      setEditingId(owner._id);
    } else {
      setFormData({ name: "", contact: "", address: "" });
      setEditingId(null);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
  };

  const handleCall = (phone?: string) => {
    if (!phone) return;

    if (confirm(`Bạn có muốn gọi đến số ${phone} không?`)) {
      window.location.href = `tel:${phone}`;
    }
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await api.owners.update(editingId, formData);
      } else {
        await api.owners.create(formData);
      }
      fetchOwners();
      handleClose();
    } catch (error) {
      console.error("Error saving owner:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa?")) {
      try {
        await api.owners.delete(id);
        fetchOwners();
      } catch (error) {
        console.error("Error deleting owner:", error);
      }
    }
  };

  return (
    <Box>
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
          Quản Lý Chủ Động Vật
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpen()}
          fullWidth={isMobile}
        >
          Thêm Chủ
        </Button>
      </Box>

      {/* Ô tìm kiếm */}
      <TextField
        fullWidth={isMobile}
        placeholder="Tìm kiếm theo tên, liên hệ hoặc địa chỉ..."
        variant="outlined"
        size="small"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{
          mb: 3,
          "& .MuiOutlinedInput-root": {
            bgcolor: theme.palette.mode === "dark" ? "#1e1e1e" : "white",
            "& fieldset": {
              borderColor: theme.palette.mode === "dark" ? "#555" : "#ccc",
            },
            "&:hover fieldset": {
              borderColor: theme.palette.mode === "dark" ? "#888" : "#1976d2",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#1976d2",
            },
          },
          "& .MuiInputBase-input::placeholder": {
            color: theme.palette.mode === "dark" ? "#aaa" : "#666",
            opacity: 1,
          },
        }}
      />

      {isMobile ? (
        // =====================================================
        // MOBILE: CARD VIEW
        // =====================================================

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {filteredOwners.map((owner) => (
            <Card
              key={owner._id}
              sx={(theme) => ({
                borderRadius: 2.5,

                boxShadow: theme.palette.mode === "dark" ? "none" : 2,

                border: "1px solid",

                borderColor: "divider",

                backgroundColor: "background.paper",

                transition: "all 0.2s ease",

                "&:hover": {
                  transform: "translateY(-2px)",

                  boxShadow:
                    theme.palette.mode === "dark"
                      ? "0 6px 20px rgba(0,0,0,0.25)"
                      : 3,

                  borderColor: "primary.main",
                },
              })}
            >
              <CardContent>
                {/* NAME */}

                <Typography
                  variant="h6"
                  sx={{
                    mb: 1.5,
                    fontWeight: 700,
                    textAlign: "center",
                    color: "text.primary",
                  }}
                >
                  {owner.name}
                </Typography>

                {/* CONTACT */}

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mb: 1.25,
                  }}
                >
                  Liên Hệ:{" "}
                  <Box
                    component="span"
                    onClick={() => handleCall(owner.contact)}
                    sx={{
                      color: owner.contact ? "primary.main" : "text.secondary",

                      cursor: owner.contact ? "pointer" : "default",

                      textDecoration: owner.contact ? "underline" : "none",

                      textUnderlineOffset: "3px",

                      fontWeight: owner.contact ? 600 : 400,

                      "&:hover": {
                        color: owner.contact ? "primary.light" : undefined,
                      },
                    }}
                  >
                    {owner.contact || "-"}
                  </Box>
                </Typography>

                {/* ADDRESS */}

                <Typography variant="body2" color="text.secondary">
                  Địa Chỉ:{" "}
                  <Box
                    component="span"
                    sx={{
                      color: "success.main",
                      fontWeight: 500,
                    }}
                  >
                    {owner.address || "-"}
                  </Box>
                </Typography>
              </CardContent>

              {/* ACTIONS */}

              <CardActions
                sx={{
                  justifyContent: "center",

                  gap: 1,

                  pt: 0,
                  pb: 1.5,

                  borderTop: "1px solid",

                  borderColor: "divider",
                }}
              >
                <IconButton color="primary" onClick={() => handleOpen(owner)}>
                  <Edit />
                </IconButton>

                <IconButton
                  color="error"
                  onClick={() => handleDelete(owner._id)}
                >
                  <Delete />
                </IconButton>
              </CardActions>
            </Card>
          ))}
        </Box>
      ) : (
        // =====================================================
        // DESKTOP: TABLE VIEW
        // =====================================================

        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 2.5,
            overflow: "hidden",

            border: "1px solid",
            borderColor: "divider",

            backgroundColor: "background.paper",

            boxShadow: 1,
          }}
        >
          <Table>
            {/* ================= HEADER ================= */}

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

                    borderBottom: "1px solid",

                    borderColor: "divider",
                  },
                })}
              >
                <TableCell>Tên Chủ</TableCell>

                <TableCell>Liên Hệ</TableCell>

                <TableCell>Địa Chỉ</TableCell>

                <TableCell align="center">Hành Động</TableCell>
              </TableRow>
            </TableHead>

            {/* ================= BODY ================= */}

            <TableBody>
              {filteredOwners.map((owner) => (
                <TableRow
                  key={owner._id}
                  hover
                  sx={{
                    transition: "background-color 0.15s ease",

                    "&:last-child td": {
                      borderBottom: 0,
                    },
                  }}
                >
                  {/* NAME */}

                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: "text.primary",
                      }}
                    >
                      {owner.name}
                    </Typography>
                  </TableCell>

                  {/* CONTACT */}

                  <TableCell>
                    {owner.contact ? (
                      <Box
                        component="span"
                        onClick={() => handleCall(owner.contact)}
                        sx={{
                          color: "primary.main",

                          cursor: "pointer",

                          textDecoration: "underline",

                          textUnderlineOffset: "3px",

                          fontWeight: 500,

                          "&:hover": {
                            color: "primary.light",
                          },
                        }}
                      >
                        {owner.contact}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        -
                      </Typography>
                    )}
                  </TableCell>

                  {/* ADDRESS */}

                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        color: owner.address
                          ? "text.primary"
                          : "text.secondary",
                      }}
                    >
                      {owner.address || "-"}
                    </Typography>
                  </TableCell>

                  {/* ACTIONS */}

                  <TableCell align="center">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpen(owner)}
                      sx={{
                        mr: 0.5,
                      }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>

                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(owner._id)}
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

      <Dialog open={open} onClose={handleClose} fullScreen={isMobile}>
        <Box sx={{ p: 3, minWidth: isMobile ? "auto" : 400 }}>
          <Typography
            variant="h6"
            sx={{ mb: 2, textAlign: "center", fontWeight: "bold" }}
          >
            {editingId ? "Sửa Chủ" : "Thêm Chủ Mới"}
          </Typography>

          <TextField
            fullWidth
            label="Tên Chủ"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Liên Hệ"
            value={formData.contact || ""}
            onChange={(e) =>
              setFormData({ ...formData, contact: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Địa Chỉ"
            value={formData.address || ""}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
            <Button onClick={handleClose}>Hủy</Button>
            <Button variant="contained" onClick={handleSave}>
              Lưu
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
};

export default Owners;
