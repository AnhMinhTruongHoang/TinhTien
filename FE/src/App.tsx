import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";

import { Container, Box, useMediaQuery, useTheme } from "@mui/material";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Dashboard from "./pages/Dashboard";
import Batches from "./pages/Batches";
import Owners from "./pages/Owners";
import AnimalTypes from "./pages/AnimalTypes";
import Employees from "./pages/Employees";
import Login from "./pages/Login";

// =====================================================
// LAYOUT SAU KHI ĐĂNG NHẬP
// =====================================================

function MainLayout() {
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <>
      <Navbar />

      <Container maxWidth="lg">
        <Box
          sx={{
            py: isMobile ? 2 : 4,
            px: isMobile ? 1 : 2,
          }}
        >
          <Outlet />
        </Box>
      </Container>
    </>
  );
}

// =====================================================
// APP
// =====================================================

function App() {
  return (
    <Router>
      <Routes>
        {/* ============================================= */}
        {/* PUBLIC */}
        {/* ============================================= */}

        <Route path="/login" element={<Login />} />

        {/* ============================================= */}
        {/* PRIVATE */}
        {/* ============================================= */}

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Dashboard />} />

            <Route path="/batches" element={<Batches />} />

            <Route path="/employees" element={<Employees />} />

            <Route path="/owners" element={<Owners />} />

            <Route path="/animal-types" element={<AnimalTypes />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
