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
} from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";
import { api } from "@/utils/api";

const AnimalTypes = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [animalTypes, setAnimalTypes] = useState<AnimalTypes.AnimalType[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<AnimalTypes.CreateAnimalTypeDto>({
    name: "",
    unit: "",
    description: "",
  });

  useEffect(() => {
    fetchAnimalTypes();
  }, []);

  const fetchAnimalTypes = async () => {
    try {
      const data = await api.animalTypes.getAll();
      setAnimalTypes(data);
    } catch (error) {
      console.error("Error fetching animal types:", error);
    }
  };

  const handleOpen = (animalType?: AnimalTypes.AnimalType) => {
    if (animalType) {
      setFormData(animalType);
      setEditingId(animalType._id);
    } else {
      setFormData({ name: "", unit: "", description: "" });
      setEditingId(null);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await api.animalTypes.update(editingId, formData);
      } else {
        await api.animalTypes.create(formData);
      }
      fetchAnimalTypes();
      handleClose();
    } catch (error) {
      console.error("Error saving animal type:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa?")) {
      try {
        await api.animalTypes.delete(id);
        fetchAnimalTypes();
      } catch (error) {
        console.error("Error deleting animal type:", error);
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
          Quản Lý Loại Động Vật
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpen()}
          fullWidth={isMobile}
        >
          Thêm Loại
        </Button>
      </Box>

      {isMobile ? (
        // Mobile: Card View
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {animalTypes.map((type) => (
            <Card key={type._id}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: "bold" }}>
                  {type.name}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Đơn Vị:</strong> {type.unit || "-"}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  <strong>Mô Tả:</strong> {type.description || "-"}
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <IconButton
                    size="small"
                    onClick={() => handleOpen(type)}
                    sx={{ flex: 1 }}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(type._id)}
                    sx={{ flex: 1 }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              </CardContent>
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
                  <strong>Tên Loại</strong>
                </TableCell>
                <TableCell>
                  <strong>Đơn Vị</strong>
                </TableCell>
                <TableCell>
                  <strong>Mô Tả</strong>
                </TableCell>
                <TableCell align="center">
                  <strong>Hành Động</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {animalTypes.map((type) => (
                <TableRow key={type._id}>
                  <TableCell>{type.name}</TableCell>
                  <TableCell>{type.unit || "-"}</TableCell>
                  <TableCell>{type.description || "-"}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => handleOpen(type)}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(type._id)}
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
            {editingId ? "Sửa Loại Động Vật" : "Thêm Loại Động Vật Mới"}
          </Typography>
          <TextField
            fullWidth
            label="Tên Loại"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Đơn Vị (con, cái, ...)"
            value={formData.unit || ""}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Mô Tả"
            value={formData.description || ""}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            sx={{ mb: 2 }}
            multiline
            rows={3}
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

export default AnimalTypes;
