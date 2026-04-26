const express = require('express');
const router = express.Router();
const { sendInsuranceRequestEmail } = require('../services/mailer');

/**
 * Endpoint: POST /api/claim/request-insurance
 * Sends insurance request details to the admin email securely.
 */
router.post('/send-insurance-email', async (req, res) => {
    const data = req.body;

    // Basic validation
    if (!data.claim_id || !data.verification_code) {
        return res.status(400).json({ success: false, message: 'Missing required claim data' });
    }

    try {
        console.log('📤 Backend: Processing insurance request for Claim ID:', data.claim_id);
        // Send Email to Admin
        await sendInsuranceRequestEmail(data);

        console.log('✅ Backend: Email sent successfully for Claim ID:', data.claim_id);
        res.json({ 
            success: true, 
            message: 'Insurance request submitted successfully. An agent will visit your location within 7 days.' 
        });
    } catch (error) {
        console.error('❌ Backend Error in /send-insurance-email:', error.message);
        res.status(500).json({ success: false, message: `Failed to send email: ${error.message}` });
    }
});

module.exports = router;
