const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// routes
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

// root route (IMPORTANT FIX)
app.get("/", (req, res) => {
    res.send("Backend is running");
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
    console.log("🚀 FasalBima OTP Backend Started");
    console.log(`📡 Server: http://localhost:${PORT}`);
});