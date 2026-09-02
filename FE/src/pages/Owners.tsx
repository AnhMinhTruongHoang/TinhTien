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
        // Mobile: Card View
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {filteredOwners.map((owner) => (
            <Card key={owner._id} sx={{ boxShadow: 3, borderRadius: 2 }}>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{ mb: 1, fontWeight: "bold", textAlign: "center" }}
                >
                  {owner.name}
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ mb: 1 }}
                >
                  Liên Hệ:{" "}
                  <span
                    style={{
                      color: "#1976d2",
                      cursor: owner.contact ? "pointer" : "default",
                      textDecoration: owner.contact ? "underline" : "none",
                    }}
                    onClick={() => handleCall(owner.contact)}
                  >
                    {owner.contact || "-"}
                  </span>
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ mb: 2 }}
                >
                  Địa Chỉ:{" "}
                  <span style={{ color: "#388e3c" }}>
                    {owner.address || "-"}
                  </span>
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: "center", gap: 2 }}>
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
        // Desktop: Table View
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell>
                  <strong>Tên Chủ</strong>
                </TableCell>
                <TableCell>
                  <strong>Liên Hệ</strong>
                </TableCell>
                <TableCell>
                  <strong>Địa Chỉ</strong>
                </TableCell>
                <TableCell align="center">
                  <strong>Hành Động</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOwners.map((owner) => (
                <TableRow key={owner._id}>
                  <TableCell>{owner.name}</TableCell>
                  <TableCell>
                    {owner.contact ? (
                      <span
                        style={{
                          color: "#1976d2",
                          cursor: "pointer",
                          textDecoration: "underline",
                        }}
                        onClick={() => handleCall(owner.contact)}
                      >
                        {owner.contact}
                      </span>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>{owner.address || "-"}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => handleOpen(owner)}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
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
