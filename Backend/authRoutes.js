const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto"); // To generate reset token
const nodemailer = require("nodemailer"); // To send reset emails
const { Pool } = require("pg");

const router = express.Router();

const pool = new Pool({
  host: "localhost",
  user: "postgres",
  port: 5432,
  password: "", // Set your actual DB password
  database: "transactions_db",
});

const SECRET_KEY = "your_jwt_secret"; // Use a strong secret key in production
const EMAIL_USER = "your-email@example.com"; // Your email for sending
const EMAIL_PASS = "your-email-password"; // Your email password

// Email transport configuration
const transporter = nodemailer.createTransport({
  service: "gmail", // Use your email provider
  auth: {
    user: "",
    pass: "",
  },
});

// Signup Route
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3)",
      [name, email, hashedPassword]
    );

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error during signup:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (user.rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.rows[0].password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.rows[0].id }, SECRET_KEY, {
      expiresIn: "1h",
    });
    res.json({ token, userId: user.rows[0].id, name: user.rows[0].name });
  } catch (error) {
    console.error("Error during login:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Forgot Password Route
// Forgot Password Route with OTP generation
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    // Check if user exists
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (user.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a 6-digit OTP and expiration time
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generates a 6-digit OTP
    const otpExpires = Date.now() + 3600000; // OTP valid for 1 hour

    // Update user with OTP and expiration
    await pool.query(
      "UPDATE users SET otp = $1, otp_expiration = $2 WHERE email = $3",
      [otp, otpExpires, email]
    );

    // Send OTP via email
    const mailOptions = {
      from: "",
      to: email,
      subject: "Your Password Reset OTP",
      text: `Your OTP for password reset is ${otp}. It is valid for 1 hour.`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Error sending OTP email:", err);
        return res.status(500).json({ message: "Error sending OTP email" });
      }
      res.json({ message: "OTP sent successfully to your email" });
    });
  } catch (error) {
    console.error("Error in forgot-password route:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Reset Password Route
// Verify OTP and Reset Password Route
router.post("/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    // Check if user exists and if the OTP is valid
    const user = await pool.query(
      "SELECT * FROM users WHERE email = $1 AND otp = $2 AND otp_expiration > $3",
      [email, otp, Date.now()]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password and remove the OTP
    await pool.query(
      "UPDATE users SET password = $1, otp = NULL, otp_expiration = NULL WHERE email = $2",
      [hashedPassword, email]
    );

    res.json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error("Error during password reset:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});
// In your authRoutes.js or similar
router.post('/user-login', async (req, res) => {
  const { mobile_number, dob } = req.body;

  try {
      const result = await db.query(
          'SELECT * FROM user_credentials WHERE mobile_number = $1 AND dob = $2',
          [mobile_number, dob]
      );

      if (result.rows.length > 0) {
          // Login successful
          res.status(200).json({ message: 'Login successful' });
      } else {
          // Invalid credentials
          res.status(401).json({ message: 'Invalid mobile number or password' });
      }
  } catch (error) {
      console.error('Error during user login:', error);
      res.status(500).json({ message: 'Server error, please try again later.' });
  }
});




// Middleware to protect routes


// Verify OTP and Reset Password
router.post("/verify-otp", async (req, res) => {
  const { otp, newPassword, email } = req.body;

  try {
    // Find the user with the email and check if OTP matches and is still valid
    const user = await pool.query(
      "SELECT * FROM users WHERE email = $1 AND otp = $2 AND otp_expiration > $3",
      [email, otp, Date.now()]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password and clear the OTP and expiration fields
    await pool.query(
      "UPDATE users SET password = $1, otp = NULL, otp_expiration = NULL WHERE email = $2",
      [hashedPassword, email]
    );

    res.json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error("Error during OTP verification:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
