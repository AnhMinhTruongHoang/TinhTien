import { useState } from "react";
import { TextField, Button, Typography, Container } from "@mui/material";

function App() {
  const [a, setA] = useState<number>(0);
  const [b, setB] = useState<number>(0);
  const [sum, setSum] = useState<number>(0);

  const handleCalc = () => {
    setSum(a + b);
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: "50px" }}>
      <Typography variant="h4" gutterBottom>
        App Tính Toán
      </Typography>
      <TextField
        label="Số A"
        type="number"
        value={a}
        onChange={(e) => setA(Number(e.target.value))}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Số B"
        type="number"
        value={b}
        onChange={(e) => setB(Number(e.target.value))}
        fullWidth
        margin="normal"
      />
      <Button variant="contained" color="primary" onClick={handleCalc}>
        Tính Tổng
      </Button>
      <Typography variant="h6" style={{ marginTop: "20px" }}>
        Kết quả: {sum}
      </Typography>
    </Container>
  );
}

export default App;
