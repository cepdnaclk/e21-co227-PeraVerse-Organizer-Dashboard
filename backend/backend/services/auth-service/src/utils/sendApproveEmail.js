// utils/sendApproveEmail.js
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.ADMIN_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

async function sendApprovalEmail(adminEmail, organizer, approvalLink) {
    const mailOptions = {
        from: process.env.ADMIN_EMAIL,
        to: adminEmail,
        subject: 'Organizer Approval Request',
        html: `
      <div style="font-family: Arial, sans-serif; background-color: #f6f9fc; padding: 30px;">
        <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); padding: 20px;">
          
          <div style="text-align: center;">
            <img src="https://cdn-icons-png.flaticon.com/512/906/906343.png" alt="Logo" width="80" style="margin-bottom: 20px;">
            <h2 style="color: #333;">Organizer Approval Request</h2>
          </div>

          <p style="font-size: 16px; color: #555;">
            Hello Admin,
          </p>
          <p style="font-size: 15px; color: #555;">
            A new organizer has requested registration approval on the platform. Here are the details:
          </p>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Name</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${organizer.organizer_name}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Email</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${organizer.email}</td>
            </tr>
          </table>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${approvalLink}" 
               style="background-color: #007bff; color: white; text-decoration: none; 
                      padding: 12px 25px; border-radius: 5px; font-weight: bold;">
              ✅ Approve Organizer
            </a>
          </div>

          <p style="margin-top: 30px; color: #888; font-size: 13px; text-align: center;">
            This is an automated message. Please do not reply directly.
          </p>

        </div>
      </div>
    `    };
    await transporter.sendMail(mailOptions);
}

module.exports = { sendApprovalEmail };
