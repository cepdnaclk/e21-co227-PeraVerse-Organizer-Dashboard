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

async function sendOrganizerApprovedEmail(organizer) {
  const htmlContent = `
  <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #dce7f7; border-radius: 10px; padding: 25px; background-color: #f4f9ff;">
    
    <!-- Message Content -->
    <p style="font-size: 16px;">
      Dear <strong>${organizer.organizer_name}</strong>,
    </p>

    <p style="font-size: 15px;">
      🎉 <strong>Congratulations!</strong> Your registration has been successfully approved.
    </p>

    <p style="font-size: 15px;">
      You can now 
      <a href="http://localhost:5173/dashboard" style="color: #0078d7; text-decoration: none; font-weight: bold;">log in</a> 
      to your account and start exploring the exciting features available on our platform.
    </p>

    <p style="font-size: 15px;">
      We’re delighted to have you as part of our exhibition community and look forward to your active participation.
    </p>

    <!-- Button -->
    <div style="text-align: center; margin: 30px 0;">
      <a href="http://localhost:5173/dashboard" style="background-color: #0078d7; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
        Log In to Your Account
      </a>
    </div>

    <p style="font-size: 15px; margin-top: 20px;">
      Best regards,<br>
      <strong>The Smart Exhibition Team</strong>
    </p>
  </div>
  `;

  const mailOptions = {
    from: process.env.ADMIN_EMAIL,
    to: organizer.email,
    subject: 'Your Organizer Request Has Been Approved 🎉',
    html: htmlContent
  };

  await transporter.sendMail(mailOptions);
}


module.exports = { sendOrganizerApprovedEmail };
