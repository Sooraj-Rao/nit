const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.ALERT_EMAIL, // Your Gmail
    pass: process.env.ALERT_EMAIL_PASSWORD // App password
  }
});

const sendAlertEmail = async (recipients, subject, html) => {
  const mailOptions = {
    from: process.env.ALERT_EMAIL,
    to: recipients, // Comma-separated string or array of emails
    subject,
    html
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendAlertEmail;
