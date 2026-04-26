const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// ===== AUTH ROUTES =====
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

// ===== EMAIL ROUTE =====
app.post("/send-insurance-email", async (req, res) => {
  try {
    console.log("📩 Insurance request received:", req.body);

    const {
      claim_id,
      crop_name,
      season,
      damage_percent,
      result_summary,
      verification_code,
      user_email
    } = req.body;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.GMAIL_FROM,
      to: "2022a1r030@mietjammu.in",
      subject: "🚜 New Insurance Request - FasalBima",
      html: `
  <h2>🚜 New Insurance Request - FasalBima</h2>

  <p><b>📍 Location:</b> Jammu, EWS Colony, Sector 1, Paloura</p>
  <p><b>🌐 Coordinates:</b> 32.766326° N, 74.831718° E</p>

  <hr/>

  <p><b>📄 Claim ID:</b> ${claim_id}</p>
  <p><b>🌾 Crop:</b> ${crop_name}</p>
  <p><b>📅 Season:</b> ${season}</p>
  <p><b>⚠️ Damage:</b> ${damage_percent}%</p>
  <p><b>📝 Summary:</b> ${result_summary}</p>
  <p><b>👤 User Email:</b> ${user_email}</p>

  <hr/>

  <h3>🔐 Verification Code: ${verification_code}</h3>

  <p style="margin-top:20px; font-weight:bold; color:#2e7d32;">
    📢 Action Required:
  </p>
  <p>
    Please visit the farmer’s location within <b>7 working days</b> 
    to verify the crop damage and complete the insurance process.
  </p>

  <hr/>

  <p style="font-size:12px; color:gray;">
    This is an automated message from FasalBima AI System.
  </p>
`
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true });
  } catch (error) {
    console.error("❌ Email error:", error);
    res.status(500).json({ success: false, message: "Email failed" });
  }
});

// ===== ROOT ROUTE =====
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// ===== SERVER START =====
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("🚀 FasalBima Backend Started");
});