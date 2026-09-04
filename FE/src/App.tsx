import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Container, Box, useMediaQuery, useTheme } from "@mui/material";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Batches from "./pages/Batches";
import Owners from "./pages/Owners";
import AnimalTypes from "./pages/AnimalTypes";
import Employees from "./pages/Employees";

function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Router>
      <Navbar />
      <Container maxWidth="lg">
        <Box sx={{ py: isMobile ? 2 : 4, px: isMobile ? 1 : 2 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/batches" element={<Batches />} />
            <Route path="/owners" element={<Owners />} />
            <Route path="/animal-types" element={<AnimalTypes />} />
            <Route path="/employees" element={<Employees />} />
          </Routes>
        </Box>
      </Container>
    </Router>
  );
}

export default App;
