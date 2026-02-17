import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connect
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// ================= USER SCHEMA =================
const userSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true },
  phone: String,
  state: String,
  district: String,
  village: String,
  password: String,
  role: { type: String, default: "farmer" } 
});
// ================= COMPANY POST SCHEMA =================
const postSchema = new mongoose.Schema({
  companyId: String,
  companyName: String,
  crop: String,
  quantity: String,
  price: String,
  createdAt: { type: Date, default: Date.now }
});

const Post = mongoose.model("Post", postSchema);
const User = mongoose.model("User", userSchema);

app.post("/signup", async (req, res) => {
  try {
    const { username, email, phone, state, district, village, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      phone,
      state,
      district,
      village,
      password: hashed
    });

    // ================= SEND WELCOME EMAIL =================
    await transporter.sendMail({
      from: `"Krishibandh" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Welcome to Krishibandh 🌾",
      html: `
        <h2>Welcome ${username} 👋</h2>
        <p>Thank you for joining Krishibandh.</p>
        <p>Your farming journey starts here 🚜</p>
        <br/>
        <p>Team Krishibandh</p>
      `
    });

    res.json({ message: "Signup successful & Email sent" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Signup failed" });
  }
});


// ================= LOGIN =================
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Wrong password" });

    const token = jwt.sign({ id: user._id }, "secretkey");

    res.json({
      token,
      userId: user._id,
      username: user.username
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ================= GET USER =================
app.get("/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "User not found" });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
// ================= EMAIL TRANSPORTER =================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});


// ================= FORGOT PASSWORD =================
app.post("/forgot-password", async (req, res) => {
  try {

    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");

    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 min
    await user.save();

    const resetLink = `http://localhost:5500/html/reset.html?token=${token}`;

    await transporter.sendMail({
      from: `"Krishibandh" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset - Krishibandh",
      html: `
        <h2>Password Reset</h2>
        <p>Click below to reset your password:</p>
        <a href="${resetLink}" style="padding:10px 20px;background:green;color:white;text-decoration:none;">
          Reset Password
        </a>
        <p>This link will expire in 15 minutes.</p>
      `
    });

    res.json({ message: "Reset link sent to email" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong" });
  }
});
// ================= RESET PASSWORD =================
app.post("/reset-password", async (req, res) => {
  try {

    const { token, newPassword } = req.body;

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    const hashed = await bcrypt.hash(newPassword, 10);

    user.password = hashed;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();

    res.json({ message: "Password updated successfully" });

  } catch (err) {
    res.status(500).json({ message: "Error resetting password" });
  }
});

// ================= ADMIN - GET ALL USERS =================
app.get("/admin/users", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// ================= ADMIN - DELETE USER =================
app.delete("/admin/user/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
//===================razorpay integration====================
import http from "http";
import Razorpay from "razorpay";
import nodecrypto from "crypto";

const PORT = 5001;

// 🔑 Razorpay Instance
const razorpay = new Razorpay({
  key_id: "rzp_test_SGtadFAcSDWJxt",
  key_secret: "yC3b71hPXckvd6VipOQ9VYd4",
});

const server = http.createServer(async (req, res) => {

  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "GET" && req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    return res.end("Server is running...");
  }

  // 🟢 Create Order
  if (req.method === "POST" && req.url === "/create-order") {
    try {
      const options = {
        amount: 50000,
        currency: "INR",
        receipt: "receipt_" + Date.now(),
      };

      const order = await razorpay.orders.create(options);

      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(order));
    } catch (err) {
      res.writeHead(500);
      return res.end("Error creating order");
    }
  }

  // 🟢 Verify Payment
  if (req.method === "POST" && req.url === "/verify-payment") {
    let body = "";

    req.on("data", chunk => {
      body += chunk;
    });

    req.on("end", () => {
      const data = JSON.parse(body);

      const generatedSignature = nodecrypto
        .createHmac("sha256", "yC3b71hPXckvd6VipOQ9VYd4")
        .update(data.razorpay_order_id + "|" + data.razorpay_payment_id)
        .digest("hex");

      if (generatedSignature === data.razorpay_signature) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "success" }));
      } else {
        res.writeHead(400);
        res.end(JSON.stringify({ status: "failure" }));
      }
    });

    return;
  }

  res.writeHead(404);
  res.end("Route not found");
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
// ================= COMPANY SIGNUP =================
app.post("/company/signup", async (req, res) => {
  try {

    const { username, email, phone, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const company = await User.create({
      username,
      email,
      phone,
      password: hashed,
      role: "company"
    });

    res.json({ message: "Company signup successful" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
app.post("/login", async (req, res) => {

  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "User not found" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: "Wrong password" });

  const token = jwt.sign({ id: user._id }, "secretkey");

  res.json({
    token,
    userId: user._id,
    username: user.username,
    role: user.role
  });
});
// ================= CREATE COMPANY POST =================
app.post("/company/post", async (req, res) => {

  const { companyId, crop, quantity, price } = req.body;

  const user = await User.findById(companyId);

  const post = await Post.create({
    companyId,
    companyName: user.username,
    crop,
    quantity,
    price
  });

  res.json({ message: "Post created" });
});
// ================= GET COMPANY POSTS =================
app.get("/company/posts/:id", async (req, res) => {
  const posts = await Post.find({ companyId: req.params.id });
  res.json(posts);
});
app.post("/login", async (req, res) => {

  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(400).json({ message: "Wrong password" });
  }

  const token = jwt.sign({ id: user._id }, "secretkey");

  // 🔥 IMPORTANT: role return kara
  res.json({
    token,
    userId: user._id,
    username: user.username,
    role: user.role   // 👈 MUST HAVE
  });
});
