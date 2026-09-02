import { Box, Typography, Card, CardContent, Paper } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PetsIcon from "@mui/icons-material/Pets";
import GroupIcon from "@mui/icons-material/Group";
import CategoryIcon from "@mui/icons-material/Category";
import { useState, useEffect } from "react";
import { api } from "@/utils/api";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalBatches: 0,
    totalOwners: 0,
    totalAnimalTypes: 0,
    avgCost: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [batches, owners, animalTypes] = await Promise.all([
        api.batches.getAll(),
        api.owners.getAll(),
        api.animalTypes.getAll(),
      ]);

      // Nếu backend có endpoint tổng hợp chi phí
      let avgCost = 0;
      if (batches.length > 0) {
        // gọi API tính chi phí cho từng batch
        const costResults = await Promise.all(
          batches.map((b) =>
            api.batches.calculateCost({
              batchId: b._id,
              pricePerUnit: 100000, // ví dụ: giá mỗi con, bạn có thể lấy từ input
              slaughterPricePerUnit: 50000,
              transportCost: 200000,
            })
          )
        );

        const totalCost = costResults.reduce((sum, r) => sum + r.totalCost, 0);
        avgCost = Math.round(totalCost / costResults.length);
      }

      setStats({
        totalBatches: batches.length,
        totalOwners: owners.length,
        totalAnimalTypes: animalTypes.length,
        avgCost,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const statCards = [
    {
      title: "Tổng Lô",
      value: stats.totalBatches,
      icon: <PetsIcon sx={{ fontSize: 48, color: "#1976d2" }} />,
    },
    {
      title: "Chủ Động Vật",
      value: stats.totalOwners,
      icon: <GroupIcon sx={{ fontSize: 48, color: "#388e3c" }} />,
    },
    {
      title: "Loại Động Vật",
      value: stats.totalAnimalTypes,
      icon: <CategoryIcon sx={{ fontSize: 48, color: "#9c27b0" }} />,
    },
    {
      title: "Chi Phí Trung Bình",
      value: `${stats.avgCost}đ`,
      icon: <TrendingUpIcon sx={{ fontSize: 48, color: "#f57c00" }} />,
    },
  ];

  return (
    <Box>
      <Typography
        variant="h4"
        sx={{ mb: 4, fontWeight: "bold", textAlign: "center" }}
      >
        Quản Lý Tính Giá Động Vật
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr",
            md: "1fr 1fr 1fr 1fr",
          },
          gap: 3,
          mb: 4,
        }}
      >
        {statCards.map((card, index) => (
          <Card
            key={index}
            sx={{
              textAlign: "center",
              boxShadow: 3,
              transition: "0.3s",
              "&:hover": { transform: "scale(1.05)", boxShadow: 6 },
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                {card.icon}
                <Typography color="textSecondary">{card.title}</Typography>
                <Typography variant="h5">{card.value}</Typography>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Paper sx={{ p: 3, boxShadow: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
          Hướng Dẫn Sử Dụng
        </Typography>
        <Box component="ul" sx={{ pl: 3, color: "text.secondary" }}>
          <li>Đi tới "Chủ Động Vật" để thêm/quản lý chủ động vật</li>
          <li>
            Đi tới "Loại Động Vật" để thêm/quản lý loại động vật (lợn, gà, v.v.)
          </li>
          <li>Đi tới "Lô Động Vật" để tạo lô và tính chi phí</li>
        </Box>
      </Paper>
    </Box>
  );
};

export default Dashboard;
