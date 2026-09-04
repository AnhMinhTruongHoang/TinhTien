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
          {animalTypes.map((type) => (
            <Card
              key={type._id}
              sx={(theme) => ({
                borderRadius: 2.5,
                border: "1px solid",
                borderColor: "divider",
                backgroundColor: "background.paper",

                boxShadow: theme.palette.mode === "dark" ? "none" : 2,

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
                  {type.name}
                </Typography>

                {/* UNIT */}

                <Typography
                  variant="body2"
                  sx={{
                    mb: 1.25,
                    color: "text.secondary",
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      fontWeight: 700,
                      color: "text.primary",
                    }}
                  >
                    Đơn Vị:
                  </Box>{" "}
                  <Box
                    component="span"
                    sx={{
                      color: "primary.main",
                      fontWeight: 600,
                    }}
                  >
                    {type.unit || "-"}
                  </Box>
                </Typography>

                {/* DESCRIPTION */}

                <Typography
                  variant="body2"
                  sx={{
                    mb: 2,
                    color: "text.secondary",
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      fontWeight: 700,
                      color: "text.primary",
                    }}
                  >
                    Mô Tả:
                  </Box>{" "}
                  {type.description || "-"}
                </Typography>

                {/* ACTIONS */}

                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    pt: 1.5,

                    borderTop: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleOpen(type)}
                    sx={{
                      flex: 1,
                      borderRadius: 2,
                    }}
                  >
                    <Edit fontSize="small" />
                  </IconButton>

                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(type._id)}
                    sx={{
                      flex: 1,
                      borderRadius: 2,
                    }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              </CardContent>
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
                <TableCell>Tên Loại</TableCell>

                <TableCell>Đơn Vị</TableCell>

                <TableCell>Mô Tả</TableCell>

                <TableCell align="center">Hành Động</TableCell>
              </TableRow>
            </TableHead>

            {/* ================= BODY ================= */}

            <TableBody>
              {animalTypes.map((type) => (
                <TableRow
                  key={type._id}
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
                      {type.name}
                    </Typography>
                  </TableCell>

                  {/* UNIT */}

                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        color: type.unit ? "primary.main" : "text.secondary",

                        fontWeight: type.unit ? 600 : 400,
                      }}
                    >
                      {type.unit || "-"}
                    </Typography>
                  </TableCell>

                  {/* DESCRIPTION */}

                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        color: type.description
                          ? "text.primary"
                          : "text.secondary",
                      }}
                    >
                      {type.description || "-"}
                    </Typography>
                  </TableCell>

                  {/* ACTIONS */}

                  <TableCell align="center">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpen(type)}
                      sx={{
                        mr: 0.5,
                      }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>

                    <IconButton
                      size="small"
                      color="error"
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
