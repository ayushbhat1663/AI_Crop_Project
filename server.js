const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const claimRoutes = require('./routes/claim');

const multer = require('multer');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

// Setup Multer for image uploads
const upload = multer({ dest: 'outputs/' });

// Middleware
app.use(cors());
app.use(express.json());

// Serving the frontend 'code' folder as static files
app.use(express.static(path.join(__dirname, 'code')));

// API Routes
app.use((req, res, next) => {
    console.log(`📡 Incoming ${req.method} request to ${req.url}`);
    next();
});
app.use('/api/auth', authRoutes);
app.use('/', claimRoutes);

/**
 * Prediction Endpoint
 * Receives an image, runs predict.py, and returns "healthy" or "damaged"
 */
app.post('/api/predict', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No image uploaded' });
    }

    const imgPath = path.resolve(req.file.path);
    // On Windows, use 'python', on others maybe 'python3'
    const pythonCmd = `python predict.py "${imgPath}"`;

    exec(pythonCmd, (error, stdout, stderr) => {
        if (error) {
            console.error(`Prediction Error: ${error.message}`);
            return res.status(500).json({ error: 'Model execution failed' });
        }
        const result = stdout.trim(); // Expecting "healthy" or "damaged"
        console.log(`Prediction for ${req.file.originalname}: ${result}`);
        res.json({ result: result });
    });
});

// Health Check
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// Fallback to index.html for SPA behavior
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'code', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`
🚀 FasalBima OTP Backend Started
📡 Server: http://localhost:${PORT}
📧 SMTP Host: ${process.env.SMTP_HOST || 'smtp.sendgrid.net'}
    `);
});
