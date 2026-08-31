import { Box, Typography, Paper, Card, CardContent } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PetsIcon from "@mui/icons-material/Pets";
import GroupIcon from "@mui/icons-material/Group";

const Dashboard = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: "bold" }}>
        Dashboard - Quản Lý Tính Giá Động Vật
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
        {/* Card Stats */}
        <Card>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <PetsIcon sx={{ fontSize: 40, color: "#1976d2" }} />
              <Box>
                <Typography color="textSecondary" gutterBottom>
                  Tổng Lô
                </Typography>
                <Typography variant="h5">0</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <GroupIcon sx={{ fontSize: 40, color: "#388e3c" }} />
              <Box>
                <Typography color="textSecondary" gutterBottom>
                  Chủ Động Vật
                </Typography>
                <Typography variant="h5">0</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <TrendingUpIcon sx={{ fontSize: 40, color: "#f57c00" }} />
              <Box>
                <Typography color="textSecondary" gutterBottom>
                  Chi Phí Trung Bình
                </Typography>
                <Typography variant="h5">0đ</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Hướng Dẫn Sử Dụng
        </Typography>
        <Box component="ul" sx={{ pl: 2 }}>
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
