const nodemailer = require('nodemailer');
require('dotenv').config();

// 1. Transporter for Login / OTP (SendGrid)
const transporter = nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 587,
    secure: false,
    auth: {
        user: 'apikey',
        pass: process.env.SMTP_PASS
    }
});

// 2. Transporter for Insurance Requests (Gmail)
const gmailTransporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // TLS
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    }
});

/**
 * Send OTP Email
 * @param {string} email - Destination email
 * @param {string} otp - 6-digit code
 * @returns {Promise}
 */
async function sendOTPEmail(email, otp) {
    const mailOptions = {
        from: process.env.SMTP_FROM,
        to: email,
        subject: '🔐 Your FasalBima Verification Code',
        html: `
            <div style="font-family: sans-serif; padding: 20px; color: #1a2e1a;">
                <h2 style="color: #2e7d32;">FasalBima Verification</h2>
                <p>Namaste! Use the following 6-digit code to log in to your FasalBima account.</p>
                <div style="background: #f1f8e9; padding: 15px; border-radius: 8px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #2e7d32; border: 1px solid #c8e6c9;">
                    ${otp}
                </div>
                <p style="font-size: 14px; color: #5d7451; margin-top: 20px;">
                    This code will expire in 5 minutes. If you did not request this, please ignore this email.
                </p>
                <hr style="border: none; border-top: 1px solid #e8f5e9; margin: 20px 0;">
                <p style="font-size: 12px; color: #bdbdbd;">FasalBima AI Crop Insurance · Government of India Initiative</p>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email Sent successfully:', info.messageId);
        return true;
    } catch (error) {
        console.error('❌ SMTP Error in mailer.js:', error.stack || error.message);
        throw error; // Rethrow to handle in routes
    }
}

/**
 * Send Insurance Request Email (via Gmail)
 * @param {Object} data - Claim details
 * @returns {Promise}
 */
async function sendInsuranceRequestEmail(data) {
    const adminEmail = '2022a1r030@mietjammu.in';
    const mailOptions = {
        from: process.env.GMAIL_FROM,
        to: adminEmail,
        subject: '📋 New Crop Insurance Request',
        html: `
            <div style="font-family: sans-serif; padding: 20px; color: #1a2e1a; line-height: 1.6;">
                <h2 style="color: #2e7d32; border-bottom: 2px solid #e8f5e9; padding-bottom: 10px;">New Insurance Request</h2>
                <p>A new insurance request has been submitted by a farmer.</p>
                
                <div style="background: #f9f9f9; padding: 15px; border-radius: 12px; border: 1px solid #eee; margin: 20px 0;">
                    <p><strong>Claim ID:</strong> ${data.claim_id}</p>
                    <p><strong>Crop:</strong> ${data.crop_name}</p>
                    <p><strong>Season:</strong> ${data.season}</p>
                    <p><strong>Damage:</strong> ${data.damage_percent}%</p>
                    <p><strong>AI Summary:</strong> ${data.result_summary}</p>
                    <p><strong>Date:</strong> ${new Date(data.timestamp).toLocaleString('en-IN')}</p>
                </div>

                <div style="background: #fff8f1; padding: 15px; border-radius: 12px; border: 1px solid #ffe0b2; text-align: center;">
                    <p style="margin: 0; color: #e65100; font-weight: bold; font-size: 1.1rem;">Verification Code</p>
                    <div style="font-size: 28px; font-weight: bold; color: #bf360c; margin: 10px 0;">${data.verification_code}</div>
                    <p style="margin: 0; font-size: 0.85rem; color: #d84315;">Please verify this request on-site.</p>
                </div>

                <hr style="border: none; border-top: 1px solid #e8f5e9; margin: 20px 0;">
                <p style="font-size: 12px; color: #bdbdbd;">FasalBima AI Crop Insurance · Internal Admin Notification</p>
            </div>
        `
    };

    try {
        console.log('📧 SMTP: Attempting to send via Gmail...');
        const info = await gmailTransporter.sendMail(mailOptions);
        console.log('✅ SMTP: Email dispatched successfully. Message ID:', info.messageId);
        return true;
    } catch (error) {
        console.error('❌ SMTP Error (Gmail):', error.message);
        if (error.code === 'EAUTH') {
            console.error('🔑 AUTH FAILURE: Check your Gmail App Password in .env');
        }
        throw error;
    }
}

module.exports = { sendOTPEmail, sendInsuranceRequestEmail };
