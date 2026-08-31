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
  Select,
  MenuItem,
  Typography,
  IconButton,
  Card,
  CardContent,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Edit, Delete, Add, Calculate } from "@mui/icons-material";
import { api } from "@/utils/api";

const Batches = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [batches, setBatches] = useState<Batches.Batch[]>([]);
  const [owners, setOwners] = useState<Owners.Owner[]>([]);
  const [animalTypes, setAnimalTypes] = useState<AnimalTypes.AnimalType[]>([]);
  const [open, setOpen] = useState(false);
  const [costOpen, setCostOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [costResult, setCostResult] = useState<Batches.CostResult | null>(null);
  const [formData, setFormData] = useState<Batches.CreateBatchDto>({
    ownerId: "",
    animalTypeId: "",
    quantity: 0,
  });
  const [costData, setCostData] = useState<Batches.CalculateCostDto>({
    batchId: "",
    pricePerUnit: 0,
  });

  useEffect(() => {
    fetchBatches();
    fetchOwners();
    fetchAnimalTypes();
  }, []);

  const fetchBatches = async () => {
    try {
      const data = await api.batches.getAll();
      setBatches(data);
    } catch (error) {
      console.error("Error fetching batches:", error);
    }
  };

  const fetchOwners = async () => {
    try {
      const data = await api.owners.getAll();
      setOwners(data);
    } catch (error) {
      console.error("Error fetching owners:", error);
    }
  };

  const fetchAnimalTypes = async () => {
    try {
      const data = await api.animalTypes.getAll();
      setAnimalTypes(data);
    } catch (error) {
      console.error("Error fetching animal types:", error);
    }
  };

  const handleOpen = (batch?: Batches.Batch) => {
    if (batch) {
      setFormData({
        ownerId:
          typeof batch.owner === "string" ? batch.owner : batch.owner._id,
        animalTypeId:
          typeof batch.animalType === "string"
            ? batch.animalType
            : batch.animalType._id,
        quantity: batch.quantity,
        quantityNotSlaughtered: batch.quantityNotSlaughtered,
        notes: batch.notes,
      });
      setEditingId(batch._id);
    } else {
      setFormData({ ownerId: "", animalTypeId: "", quantity: 0 });
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
        await api.batches.update(editingId, formData);
      } else {
        await api.batches.create(formData);
      }
      fetchBatches();
      handleClose();
    } catch (error) {
      console.error("Error saving batch:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa?")) {
      try {
        await api.batches.delete(id);
        fetchBatches();
      } catch (error) {
        console.error("Error deleting batch:", error);
      }
    }
  };

  const handleCalculateCost = async () => {
    if (!selectedBatchId) return;
    try {
      const result = await api.batches.calculateCost({
        batchId: selectedBatchId,
        pricePerUnit: costData.pricePerUnit,
        slaughterPricePerUnit: costData.slaughterPricePerUnit,
        transportCost: costData.transportCost,
      });
      setCostResult(result);
    } catch (error) {
      console.error("Error calculating cost:", error);
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
          Quản Lý Lô Động Vật
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpen()}
          fullWidth={isMobile}
        >
          Thêm Lô Mới
        </Button>
      </Box>

      {isMobile ? (
        // Mobile: Card View
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {batches.map((batch) => (
            <Card key={batch._id}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: "bold" }}>
                  {typeof batch.owner === "string"
                    ? batch.owner
                    : batch.owner.name}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Loại:</strong>{" "}
                  {typeof batch.animalType === "string"
                    ? batch.animalType
                    : batch.animalType.name}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Số Lượng:</strong> {batch.quantity}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  <strong>Ngày Ghi:</strong>{" "}
                  {new Date(batch.recordDate).toLocaleDateString("vi-VN")}
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <IconButton
                    size="small"
                    onClick={() => {
                      setSelectedBatchId(batch._id);
                      setCostOpen(true);
                    }}
                    sx={{ flex: 1 }}
                  >
                    <Calculate fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleOpen(batch)}
                    sx={{ flex: 1 }}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(batch._id)}
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
        <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell>
                  <strong>Chủ Động Vật</strong>
                </TableCell>
                <TableCell>
                  <strong>Loại Động Vật</strong>
                </TableCell>
                <TableCell>
                  <strong>Số Lượng</strong>
                </TableCell>
                <TableCell>
                  <strong>Không Giết Mổ</strong>
                </TableCell>
                <TableCell>
                  <strong>Ngày Ghi</strong>
                </TableCell>
                <TableCell align="center">
                  <strong>Hành Động</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {batches.map((batch) => (
                <TableRow key={batch._id}>
                  <TableCell>
                    {typeof batch.owner === "string"
                      ? batch.owner
                      : batch.owner.name}
                  </TableCell>
                  <TableCell>
                    {typeof batch.animalType === "string"
                      ? batch.animalType
                      : batch.animalType.name}
                  </TableCell>
                  <TableCell>{batch.quantity}</TableCell>
                  <TableCell>{batch.quantityNotSlaughtered}</TableCell>
                  <TableCell>
                    {new Date(batch.recordDate).toLocaleDateString("vi-VN")}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedBatchId(batch._id);
                        setCostOpen(true);
                      }}
                    >
                      <Calculate fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleOpen(batch)}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(batch._id)}
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

      {/* Dialog thêm/sửa lô */}
      <Dialog open={open} onClose={handleClose} fullScreen={isMobile}>
        <Box sx={{ p: 3, minWidth: isMobile ? "auto" : 450 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {editingId ? "Sửa Lô" : "Thêm Lô Mới"}
          </Typography>
          <Select
            fullWidth
            value={formData.ownerId}
            onChange={(e) =>
              setFormData({ ...formData, ownerId: e.target.value })
            }
            sx={{ mb: 2 }}
          >
            <MenuItem value="">-- Chọn Chủ --</MenuItem>
            {owners.map((owner) => (
              <MenuItem key={owner._id} value={owner._id}>
                {owner.name}
              </MenuItem>
            ))}
          </Select>
          <Select
            fullWidth
            value={formData.animalTypeId}
            onChange={(e) =>
              setFormData({ ...formData, animalTypeId: e.target.value })
            }
            sx={{ mb: 2 }}
          >
            <MenuItem value="">-- Chọn Loại --</MenuItem>
            {animalTypes.map((type) => (
              <MenuItem key={type._id} value={type._id}>
                {type.name}
              </MenuItem>
            ))}
          </Select>
          <TextField
            fullWidth
            label="Số Lượng"
            type="number"
            value={formData.quantity}
            onChange={(e) =>
              setFormData({ ...formData, quantity: parseInt(e.target.value) })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Số Lượng Không Giết Mổ"
            type="number"
            value={formData.quantityNotSlaughtered || 0}
            onChange={(e) =>
              setFormData({
                ...formData,
                quantityNotSlaughtered: parseInt(e.target.value),
              })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Địa Chỉ Nguồn"
            value={formData.originAddress || ""}
            onChange={(e) =>
              setFormData({ ...formData, originAddress: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Địa Chỉ Đích"
            value={formData.destinationAddress || ""}
            onChange={(e) =>
              setFormData({ ...formData, destinationAddress: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Ghi Chú"
            value={formData.notes || ""}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            sx={{ mb: 2 }}
            multiline
            rows={3}
          />
          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "flex-end",
              flexDirection: isMobile ? "column-reverse" : "row",
            }}
          >
            <Button onClick={handleClose} fullWidth={isMobile}>
              Hủy
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              fullWidth={isMobile}
            >
              Lưu
            </Button>
          </Box>
        </Box>
      </Dialog>

      {/* Dialog tính chi phí */}
      <Dialog
        open={costOpen}
        onClose={() => setCostOpen(false)}
        fullScreen={isMobile}
      >
        <Box sx={{ p: 3, minWidth: isMobile ? "auto" : 450 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Tính Chi Phí
          </Typography>
          <TextField
            fullWidth
            label="Giá Mỗi Đầu (đ)"
            type="number"
            value={costData.pricePerUnit}
            onChange={(e) =>
              setCostData({
                ...costData,
                pricePerUnit: parseInt(e.target.value),
              })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Giá Giết Mổ Mỗi Đầu (đ)"
            type="number"
            value={costData.slaughterPricePerUnit || 0}
            onChange={(e) =>
              setCostData({
                ...costData,
                slaughterPricePerUnit: parseInt(e.target.value),
              })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Chi Phí Vận Chuyển (đ)"
            type="number"
            value={costData.transportCost || 0}
            onChange={(e) =>
              setCostData({
                ...costData,
                transportCost: parseInt(e.target.value),
              })
            }
            sx={{ mb: 3 }}
          />
          <Button
            variant="contained"
            fullWidth
            onClick={handleCalculateCost}
            sx={{ mb: 2 }}
          >
            Tính Chi Phí
          </Button>

          {costResult && (
            <Card sx={{ backgroundColor: "#f5f5f5", mb: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Kết Quả
                </Typography>
                <Box sx={{ fontSize: "0.9rem" }}>
                  <Typography variant="body2">
                    Số Lượng: {costResult.quantity}
                  </Typography>
                  <Typography variant="body2">
                    Giết Mổ: {costResult.slaughterQuantity}
                  </Typography>
                  <Typography variant="body2">
                    Chi Phí Mua: {costResult.animalCost.toLocaleString("vi-VN")}
                    đ
                  </Typography>
                  <Typography variant="body2">
                    Chi Phí Giết Mổ:{" "}
                    {costResult.slaughterCost.toLocaleString("vi-VN")}đ
                  </Typography>
                  <Typography variant="body2">
                    Chi Phí Vận Chuyển:{" "}
                    {costResult.transportCost.toLocaleString("vi-VN")}đ
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 2, color: "#1976d2" }}>
                    Tổng Chi Phí: {costResult.totalCost.toLocaleString("vi-VN")}
                    đ
                  </Typography>
                  <Typography variant="body2">
                    Chi Phí Trung Bình/Đầu:{" "}
                    {costResult.costPerUnit.toLocaleString("vi-VN")}đ
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}

          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "flex-end",
              flexDirection: isMobile ? "column-reverse" : "row",
            }}
          >
            <Button
              onClick={() => {
                setCostOpen(false);
                setCostResult(null);
              }}
              fullWidth={isMobile}
            >
              Đóng
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
};

export default Batches;
