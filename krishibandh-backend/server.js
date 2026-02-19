import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import Razorpay from "razorpay";
import PDFDocument from "pdfkit";
import axios from "axios";

dotenv.config();

const app = express();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// ===== ES Module Fix =====
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===== Upload Folder =====
const uploadPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(uploadPath));

// ===== MongoDB =====
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// ================= SCHEMAS =================

const userSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: "farmer" }
});

const postSchema = new mongoose.Schema({
  companyId: String,
  companyName: String,
  crop: String,
  quantity: String,
  price: String,
  image: String
}, { timestamps: true });

const applicationSchema = new mongoose.Schema({
  postId: String,
  companyId: String,
  farmerId: String,
  quantity: String,
  price: String,
  finalPrice: String,
  message: String,
  image: String,
  status: { type: String, default: "pending" },
  paymentStatus: { type: String, default: "unpaid" },
  invoiceId: String
}, { timestamps: true });

const messageSchema = new mongoose.Schema({
  senderId: String,
  receiverId: String,
  senderName: String,
  receiverName: String,
  message: String
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
const Post = mongoose.model("Post", postSchema);
const Application = mongoose.model("Application", applicationSchema);
const Message = mongoose.model("Message", messageSchema);

// ================= MULTER =================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// ================= AUTH =================

app.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);

    await User.create({ username, email, password: hashed });

    res.json({ message: "Signup successful" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Wrong password" });

    res.json({
      userId: user._id,
      username: user.username,
      role: user.role
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ================= POSTS =================

app.post("/company/post", upload.single("image"), async (req, res) => {
  try {
    const { companyId, crop, quantity, price } = req.body;

    const user = await User.findById(companyId);
    if (!user) return res.status(400).json({ message: "Company not found" });

    const post = await Post.create({
      companyId,
      companyName: user.username,
      crop,
      quantity,
      price,
      image: req.file ? "uploads/" + req.file.filename : ""
    });

    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/posts", async (req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 });
  res.json(posts);
});

app.get("/posts/count", async (req, res) => {
  const count = await Post.countDocuments();
  res.json({ count });
});

// ================= APPLICATION =================

app.post("/apply", upload.single("image"), async (req, res) => {
  try {
    const { postId, companyId, farmerId, quantity, price, message } = req.body;

    const application = await Application.create({
      postId,
      companyId,
      farmerId,
      quantity,
      price,
      message,
      image: req.file ? "uploads/" + req.file.filename : ""
    });

    res.json(application);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put("/payment/success/:id", async (req, res) => {
  const appData = await Application.findById(req.params.id);
  appData.paymentStatus = "paid";
  appData.invoiceId = "INV-" + Date.now();
  await appData.save();
  res.json(appData);
});

// ================= COMPANY PAID DEALS =================

app.get("/company/paid-deals/:companyId", async (req, res) => {
  const deals = await Application.find({
    companyId: req.params.companyId,
    status: "accepted",
    paymentStatus: "paid"
  }).sort({ createdAt: -1 });

  res.json(deals);
});

// ================= INVOICE PDF =================

app.get("/invoice/:id", async (req, res) => {
  try {
    const deal = await Application.findById(req.params.id);
    if (!deal) return res.status(404).json({ message: "Deal not found" });

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Invoice-${deal.invoiceId}.pdf`
    );

    doc.pipe(res);

    doc.fontSize(20).text("Krishibandh Invoice", { align: "center" });
    doc.moveDown();
    doc.fontSize(12);
    doc.text("Invoice ID: " + deal.invoiceId);
    doc.text("Date: " + new Date().toLocaleDateString());
    doc.text("Quantity: " + deal.quantity);
    doc.text("Final Price: ₹" + deal.finalPrice);
    doc.text("Payment Status: PAID");

    doc.end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ================= CROP IMAGE =================

app.get("/api/crop-image", async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.json({ image: "" });

    const response = await axios.get(
      `https://api.pexels.com/v1/search?query=${query}&per_page=1`,
      {
        headers: { Authorization: process.env.PEXELS_API_KEY }
      }
    );

    const image = response.data.photos?.[0]?.src?.medium || "";
    res.json({ image });

  } catch {
    res.json({ image: "" });
  }
});

// ================= START SERVER =================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
