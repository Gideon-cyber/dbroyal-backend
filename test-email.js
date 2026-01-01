require("dotenv").config();
const nodemailer = require("nodemailer");

async function testEmail() {
  console.log("Testing SMTP Connection...");
  console.log("Host:", process.env.SMTP_HOST);
  console.log("Port:", process.env.SMTP_PORT);
  console.log("User:", process.env.SMTP_USER);
  console.log(
    "Password:",
    process.env.SMTP_PASSWORD
      ? "****" + process.env.SMTP_PASSWORD.slice(-4)
      : "NOT SET"
  );
  console.log("---\n");

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
    tls: {
      ciphers: "SSLv3",
      rejectUnauthorized: false,
    },
    debug: true,
    logger: true,
  });

  try {
    console.log("Verifying connection...");
    await transporter.verify();
    console.log("✅ SMTP connection successful!\n");

    console.log("Sending test email...");
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: process.env.SMTP_USER, // Send to yourself
      subject: "Test Email from DBRoyal Backend",
      text: "If you receive this, your SMTP configuration is working correctly!",
      html: "<h1>Success!</h1><p>If you receive this, your SMTP configuration is working correctly!</p>",
    });

    console.log("✅ Test email sent successfully!");
    console.log("Message ID:", info.messageId);
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error("\nPossible solutions:");
    console.error("1. Check your email and password are correct");
    console.error(
      "2. If you have 2FA enabled, generate an app-specific password"
    );
    console.error("3. Make sure the email account is active and verified");
    console.error(
      "4. Check if your email provider requires different settings"
    );
  }
}

testEmail();
