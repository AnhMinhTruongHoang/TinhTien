import { useState, useEffect, useMemo } from "react";
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
import {
  Edit,
  Delete,
  Add,
  Calculate,
  FilterAlt,
  RestartAlt,
  History,
} from "@mui/icons-material";
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

  // ================= FILTER =================
  const [searchText, setSearchText] = useState("");
  const [filterOwner, setFilterOwner] = useState("");
  const [filterAnimalType, setFilterAnimalType] = useState("");

  // ================= CALCULATION HISTORY =================
  const [costHistoryOpen, setCostHistoryOpen] = useState(false);
  const [costHistory, setCostHistory] = useState<Batches.HistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  ////
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

  const fetchCostHistory = async (batchId?: string) => {
    try {
      setLoadingHistory(true);
      const data = batchId
        ? await api.calculationHistory.getByBatch(batchId)
        : await api.calculationHistory.getAll();
      setCostHistory(data);
    } catch (error) {
      console.error("Error fetching cost history:", error);
      alert("Không thể tải lịch sử tính chi phí");
    } finally {
      setLoadingHistory(false);
    }
  };

  // ================= FILTER DATA =================
  const filteredBatches = useMemo(() => {
    return batches.filter((batch) => {
      const ownerName =
        typeof batch.owner === "string" ? batch.owner : batch.owner?.name || "";

      const animalTypeName =
        typeof batch.animalType === "string"
          ? batch.animalType
          : batch.animalType?.name || "";

      const keyword = searchText.toLowerCase().trim();

      const matchSearch =
        !keyword ||
        ownerName.toLowerCase().includes(keyword) ||
        animalTypeName.toLowerCase().includes(keyword) ||
        batch.originAddress?.toLowerCase().includes(keyword) ||
        batch.destinationAddress?.toLowerCase().includes(keyword);

      const ownerId =
        typeof batch.owner === "string" ? batch.owner : batch.owner?._id;

      const animalTypeId =
        typeof batch.animalType === "string"
          ? batch.animalType
          : batch.animalType?._id;

      const matchOwner = !filterOwner || ownerId === filterOwner;

      const matchAnimalType =
        !filterAnimalType || animalTypeId === filterAnimalType;

      return matchSearch && matchOwner && matchAnimalType;
    });
  }, [batches, searchText, filterOwner, filterAnimalType]);

  const handleResetFilter = () => {
    setSearchText("");
    setFilterOwner("");
    setFilterAnimalType("");
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
      if (!formData.ownerId) {
        alert("Vui lòng chọn chủ động vật");
        return;
      }

      if (!formData.animalTypeId) {
        alert("Vui lòng chọn loại động vật");
        return;
      }

      if (!formData.quantity || formData.quantity <= 0) {
        alert("Số lượng phải lớn hơn 0");
        return;
      }

      const quantityNotSlaughtered = formData.quantityNotSlaughtered ?? 0;

      if (quantityNotSlaughtered < 0) {
        alert("Số lượng không giết mổ không được âm");
        return;
      }

      if (quantityNotSlaughtered > formData.quantity) {
        alert("Số lượng không giết mổ không được lớn hơn tổng số lượng");
        return;
      }

      if (editingId) {
        await api.batches.update(editingId, formData);
      } else {
        await api.batches.create(formData);
      }

      await fetchBatches();

      handleClose();
    } catch (error) {
      console.error("Error saving batch:", error);

      alert("Không thể lưu lô động vật");
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

    if (costData.pricePerUnit <= 0) {
      alert("Giá mỗi đầu phải lớn hơn 0");
      return;
    }

    if ((costData.slaughterPricePerUnit ?? 0) < 0) {
      alert("Giá giết mổ không được âm");
      return;
    }

    if ((costData.transportCost ?? 0) < 0) {
      alert("Chi phí vận chuyển không được âm");
      return;
    }

    try {
      // Gọi API mới → vừa tính vừa lưu lịch sử
      const result = await api.calculationHistory.create({
        batchId: selectedBatchId,
        pricePerUnit: costData.pricePerUnit,
        slaughterPricePerUnit: costData.slaughterPricePerUnit,
        transportCost: costData.transportCost,
      });

      // Hiển thị kết quả ngay
      setCostResult({
        batchId: result.batch,
        quantity: result.quantity,
        quantityNotSlaughtered: result.quantityNotSlaughtered,
        slaughterQuantity: result.slaughterQuantity,
        animalCost: result.animalCost,
        slaughterCost: result.slaughterCost,
        transportCost: result.transportCost,
        totalCost: result.totalCost,
        costPerUnit: result.costPerUnit,
      });

      // Cập nhật lại danh sách lịch sử (nếu đang mở)
      if (costHistoryOpen) {
        await fetchCostHistory();
      }
    } catch (error) {
      console.error("Error calculating cost:", error);
      alert("Không thể tính chi phí");
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

      {/* ================= FILTER ================= */}
      <Paper
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 2,
          }}
        >
          <FilterAlt color="primary" />

          <Typography variant="h6">Bộ Lọc</Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr 1fr auto",
            gap: 2,
            alignItems: "center",
          }}
        >
          <TextField
            fullWidth
            size="small"
            label="Tìm kiếm"
            placeholder="Tên chủ, loại động vật, địa chỉ..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />

          <Select
            fullWidth
            size="small"
            displayEmpty
            value={filterOwner}
            onChange={(e) => setFilterOwner(e.target.value)}
          >
            <MenuItem value="">Tất cả chủ</MenuItem>

            {owners.map((owner) => (
              <MenuItem key={owner._id} value={owner._id}>
                {owner.name}
              </MenuItem>
            ))}
          </Select>

          <Select
            fullWidth
            size="small"
            displayEmpty
            value={filterAnimalType}
            onChange={(e) => setFilterAnimalType(e.target.value)}
          >
            <MenuItem value="">Tất cả loại</MenuItem>

            {animalTypes.map((type) => (
              <MenuItem key={type._id} value={type._id}>
                {type.name}
              </MenuItem>
            ))}
          </Select>

          <Button
            variant="outlined"
            startIcon={<RestartAlt />}
            onClick={handleResetFilter}
            fullWidth={isMobile}
          >
            Xóa lọc
          </Button>
        </Box>

        <Typography
          variant="body2"
          sx={{
            mt: 2,
            color: "text.secondary",
          }}
        >
          Đang hiển thị {filteredBatches.length} / {batches.length} lô
        </Typography>
      </Paper>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mb: 3,
        }}
      >
        <Button
          variant="outlined"
          startIcon={<History />}
          onClick={async () => {
            setCostHistoryOpen(true);
            await fetchCostHistory();
          }}
        >
          Xem lịch sử tính chi phí
        </Button>
      </Box>

      {isMobile ? (
        // Mobile: Card View
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {filteredBatches.map((batch) => (
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

                      setCostData({
                        batchId: batch._id,
                        pricePerUnit: 0,
                        slaughterPricePerUnit: 0,
                        transportCost: 0,
                      });

                      setCostResult(null);
                      setCostOpen(true);
                    }}
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
              {filteredBatches.map((batch) => (
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

                        setCostData({
                          batchId: batch._id,
                          pricePerUnit: 0,
                          slaughterPricePerUnit: 0,
                          transportCost: 0,
                        });

                        setCostResult(null);
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
          <Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
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
            slotProps={{
              htmlInput: {
                min: 1,
              },
            }}
            value={formData.quantity}
            onChange={(e) =>
              setFormData({
                ...formData,
                quantity:
                  e.target.value === ""
                    ? 0
                    : Math.max(0, parseInt(e.target.value)),
              })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Số Lượng Không Giết Mổ"
            type="number"
            slotProps={{
              htmlInput: {
                min: 1,
              },
            }}
            value={formData.quantityNotSlaughtered || 0}
            onChange={(e) =>
              setFormData({
                ...formData,
                quantityNotSlaughtered:
                  e.target.value === ""
                    ? 0
                    : Math.max(0, parseInt(e.target.value)),
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
          <Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
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

      {/* ================= LỊCH SỬ TÍNH CHI PHÍ ================= */}
      <Dialog
        open={costHistoryOpen}
        onClose={() => setCostHistoryOpen(false)}
        fullScreen={isMobile}
        fullWidth
        maxWidth="md"
      >
        <Box sx={{ p: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h6">Lịch Sử Tính Chi Phí</Typography>
            <Button onClick={() => setCostHistoryOpen(false)}>Đóng</Button>
          </Box>

          {loadingHistory ? (
            <Typography sx={{ textAlign: "center" }}>Đang tải...</Typography>
          ) : costHistory.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: "center" }}>
              <Typography color="text.secondary">
                Chưa có lịch sử tính chi phí.
              </Typography>
            </Paper>
          ) : (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                maxHeight: "70vh",
                overflowY: "auto",
              }}
            >
              {costHistory.map((item, index) => (
                <Card key={item._id}>
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: "bold" }}
                      >
                        Lần tính #{costHistory.length - index}
                      </Typography>

                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          {new Date(item.calculatedAt).toLocaleString("vi-VN")}
                        </Typography>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={async () => {
                            if (confirm("Bạn có chắc muốn xóa lần tính này?")) {
                              try {
                                await api.calculationHistory.delete(item._id);
                                await fetchCostHistory();
                              } catch (error) {
                                alert("Xóa thất bại");
                              }
                            }
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                        gap: 1,
                      }}
                    >
                      {/* ===== THÊM 2 DÒNG NÀY ===== */}
                      <Typography>
                        <strong>Chủ động vật:</strong>{" "}
                        {typeof item.batch === "object" && item.batch?.owner
                          ? typeof item.batch.owner === "string"
                            ? item.batch.owner
                            : item.batch.owner.name
                          : "—"}
                      </Typography>

                      <Typography>
                        <strong>Loại động vật:</strong>{" "}
                        {typeof item.batch === "object" &&
                        item.batch?.animalType
                          ? typeof item.batch.animalType === "string"
                            ? item.batch.animalType
                            : item.batch.animalType.name
                          : "—"}
                      </Typography>
                      {/* ============================ */}

                      <Typography>
                        <strong>Batch ID:</strong>{" "}
                        {typeof item.batch === "string"
                          ? item.batch
                          : item.batch?._id}
                      </Typography>

                      <Typography>
                        <strong>Số lượng:</strong> {item.quantity}
                      </Typography>

                      <Typography>
                        <strong>Giết mổ:</strong> {item.slaughterQuantity}
                      </Typography>

                      <Typography>
                        <strong>Không giết mổ:</strong>{" "}
                        {item.quantityNotSlaughtered}
                      </Typography>

                      <Typography>
                        <strong>Chi phí mua:</strong>{" "}
                        {item.animalCost?.toLocaleString("vi-VN")}đ
                      </Typography>

                      <Typography>
                        <strong>Chi phí giết mổ:</strong>{" "}
                        {item.slaughterCost?.toLocaleString("vi-VN")}đ
                      </Typography>

                      <Typography>
                        <strong>Chi phí vận chuyển:</strong>{" "}
                        {item.transportCost?.toLocaleString("vi-VN")}đ
                      </Typography>

                      <Typography
                        sx={{ color: "primary.main", fontWeight: "bold" }}
                      >
                        Tổng chi phí: {item.totalCost?.toLocaleString("vi-VN")}đ
                      </Typography>

                      <Typography
                        sx={{ color: "success.main", fontWeight: "bold" }}
                      >
                        Trung bình / đầu:{" "}
                        {item.costPerUnit?.toLocaleString("vi-VN")}đ
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Box>
      </Dialog>
    </Box>
  );
};

export default Batches;
