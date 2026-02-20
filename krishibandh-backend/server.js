import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import nodemailer from "nodemailer";
import Razorpay from "razorpay";
import PDFDocument from "pdfkit";
import axios from "axios";

dotenv.config(); // 🔥 MUST BE HERE

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});


const app = express();

// ===== ES Module __dirname fix =====
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// ===== CREATE UPLOADS FOLDER IF NOT EXISTS =====
const uploadPath = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
  console.log("Uploads folder created");
}

// ===== Middlewares =====
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ===== MongoDB Connect =====
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// ================= SCHEMAS =================

// User
// ================= USER SCHEMA =================
const userSchema = new mongoose.Schema({

  username: { type: String, required: true },

  email: { 
    type: String, 
    unique: true, 
    required: true 
  },

  password: { 
    type: String, 
    required: true 
  },

  phone: { type: String },

  state: { type: String },
  district: { type: String },
  village: { type: String },
  address: { type: String },

  profileImage: { type: String },

  role: { 
    type: String, 
    default: "farmer" 
  }

}, { timestamps: true });
// Post
const postSchema = new mongoose.Schema({
  companyId: String,
  companyName: String,
  crop: String,
  quantity: String,
  price: String,
  image: String
}, { timestamps: true });

// Application
const applicationSchema = new mongoose.Schema({
  postId: String,
  companyId: String,
  farmerId: String,
companyName: String,
  quantity: String,
  price: String,        // farmer offered
  finalPrice: String,   // ✅ company final price

  message: String,
  image: String,

  status: { type: String, default: "pending" },
  paymentStatus: { type: String, default: "unpaid" },
  invoiceId: String

}, { timestamps: true });



// ================= CHAT SCHEMA =================
const messageSchema = new mongoose.Schema({
  senderId: String,
  receiverId: String,
  senderName: String,
  receiverName: String,
  message: String
}, { timestamps: true });

const Message = mongoose.model("Message", messageSchema);

const User = mongoose.model("User", userSchema);
const Post = mongoose.model("Post", postSchema);
const Application = mongoose.model("Application", applicationSchema);

// ================= MULTER =================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });


// ================= ROUTES =================

// ================= SIGNUP =================
// ================= SIGNUP WITH PROFILE IMAGE =================
app.post("/signup", upload.single("profileImage"), async (req, res) => {
  try {

    const {
      username,
      email,
      password,
      phone,
      state,
      district,
      village,
      address
    } = req.body;

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: hashed,
      phone,
      state,
      district,
      village,
      address,
      profileImage: req.file ? "uploads/" + req.file.filename : ""
    });

    res.json({
      message: "Signup successful",
      user: newUser
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ message: "Wrong password" });

    res.json({
      userId: user._id,
      username: user.username,
      role: user.role
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// ================= CREATE ORDER =================
app.post("/create-order", async (req, res) => {
  try {

    const { amount } = req.body;

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: "receipt_" + Date.now()
    });

    res.json(order);

  } catch (err) {
    console.log("Order Error:", err);
    res.status(500).json({ message: err.message });
  }
});

// ================= GET USER BY ID =================
app.get("/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ================= CREATE COMPANY POST =================
// ================= CREATE COMPANY POST =================
app.post("/company/post", upload.single("image"), async (req, res) => {
  try {
    const { companyId, crop, quantity, price } = req.body;

    const user = await User.findById(companyId);
    if (!user)
      return res.status(400).json({ message: "Company not found" });

    const post = await Post.create({
      companyId,
      companyName: user.username,
      crop,
      quantity,
      price,
      image: req.file ? "uploads/" + req.file.filename : ""
    });

    res.json({ message: "Post created successfully", post });

  } catch (err) {
    console.log("Post Error:", err);
    res.status(500).json({ message: err.message });
  }
});

// Get Company Posts
app.get("/company/posts/:id", async (req, res) => {
  try {
    const posts = await Post.find({ companyId: req.params.id });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔥 GET ALL POSTS (Farmer Side)
app.get("/posts", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// ================= GET POSTS COUNT =================
app.get("/posts/count", async (req, res) => {
  try {
    const count = await Post.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Farmer Apply
app.post("/apply", upload.single("image"), async (req, res) => {
  try {

    const { postId, companyId, farmerId, quantity, price, message } = req.body;

    // 🔥 Company Name get कर
    const company = await User.findById(companyId);

    if (!company) {
      return res.status(400).json({ message: "Company not found" });
    }

    const application = await Application.create({
      postId,
      companyId,
      companyName: company.username,  // 👈 SAVE NAME
      farmerId,
      quantity,
      price,
      message,
      image: req.file ? "uploads/" + req.file.filename : "",
      status: "Pending"
    });

    res.json(application);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ================= ADMIN - GET ALL USERS =================
app.get("/admin/users", async (req, res) => {
  try {

    const users = await User.find().select("-password").sort({ createdAt: -1 });

    res.json(users);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ================= ADMIN - DELETE USER =================
app.delete("/admin/user/:id", async (req, res) => {
  try {

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Get Company Applications
app.get("/company/applications/:companyId", async (req, res) => {
  try {
    const applications = await Application.find({
      companyId: req.params.companyId
    }).sort({ createdAt: -1 });

    res.json(applications);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// ================= UPDATE APPLICATION STATUS =================
app.get("/farmer/applications/:farmerId", async (req, res) => {
  try {
    const applications = await Application.find({
      farmerId: req.params.farmerId
    }).sort({ createdAt: -1 });

    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
app.put("/application/status/:id", async (req, res) => {
  try {

    const { status, finalPrice } = req.body;

    const appData = await Application.findById(req.params.id);

    if (!appData)
      return res.status(404).json({ message: "Not found" });

    appData.status = status;

    if (finalPrice) {
      appData.finalPrice = finalPrice;
    }

    await appData.save();

    res.json(appData);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



// ================= SEND MESSAGE =================
app.post("/chat/send", async (req, res) => {
  try {

    const { senderId, receiverId, message } = req.body;

    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!sender || !receiver)
      return res.status(400).json({ message: "User not found" });

    const newMessage = await Message.create({
      senderId,
      receiverId,
      senderName: sender.username,
      receiverName: receiver.username,
      message
    });

    res.json(newMessage);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// ================= GET CHAT =================
app.get("/chat/:user1/:user2", async (req, res) => {
  try {

    const { user1, user2 } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: user1, receiverId: user2 },
        { senderId: user2, receiverId: user1 }
      ]
    }).sort({ createdAt: 1 });

    res.json(messages);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// ================= PAYMENT SUCCESS =================
app.put("/payment/success/:id", async (req, res) => {

  const appData = await Application.findById(req.params.id);

  appData.paymentStatus = "paid";
  appData.invoiceId = "INV-" + Date.now();

  await appData.save();

  res.json(appData);
});

// Admin - Accepted Deals
app.get("/admin/deals", async (req, res) => {
  try {

    const deals = await Application.find({
      status: "accepted"
    }).sort({ createdAt: -1 });

    res.json(deals);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
app.get("/application/:id", async (req, res) => {
  const appData = await Application.findById(req.params.id);
  res.json(appData);
});
// ================= GET SINGLE APPLICATION =================
app.get("/application/:id", async (req, res) => {
  try {

    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.json(application);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// ================= COMPANY PAID DEALS =================
app.get("/company/paid-deals/:companyId", async (req, res) => {
  try {

    const deals = await Application.find({
      companyId: req.params.companyId,
      status: "accepted",
      paymentStatus: "paid"
    }).sort({ createdAt: -1 });

    res.json(deals);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// ================= DOWNLOAD INVOICE PDF =================
app.get("/invoice/:id", async (req, res) => {
  try {

    const deal = await Application.findById(req.params.id);

    if (!deal) {
      return res.status(404).json({ message: "Deal not found" });
    }

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Invoice-${deal.invoiceId || deal._id}.pdf`
    );

    doc.pipe(res);

    // ===== HEADER =====
    doc.fontSize(20).text("Krishibandh Invoice", { align: "center" });
    doc.moveDown();

    doc.fontSize(12);
    doc.text("Invoice ID: " + (deal.invoiceId || "-"));
    doc.text("Date: " + new Date().toLocaleDateString());
    doc.moveDown();

    doc.text("Farmer ID: " + deal.farmerId);
    doc.text("Company ID: " + deal.companyId);
    doc.moveDown();

    doc.text("Crop Quantity: " + deal.quantity);
    doc.text("Final Price: ₹" + deal.finalPrice);
    doc.moveDown();

    doc.fontSize(14).text("Payment Status: PAID");

    doc.end();

  } catch (err) {
    console.log("Invoice Error:", err);
    res.status(500).json({ message: err.message });
  }
});
// ================= CROP IMAGE API =================
app.get("/api/crop-image", async (req, res) => {
  try {
    const query = req.query.q;

    if (!query) {
      return res.json({
        image: "https://via.placeholder.com/400x300?text=Crop"
      });
    }

    const response = await axios.get(
      `https://api.pexels.com/v1/search?query=${query}&per_page=1`,
      {
        headers: {
          Authorization: process.env.PEXELS_API_KEY
        }
      }
    );

    const image =
      response.data.photos?.[0]?.src?.medium ||
      "https://via.placeholder.com/400x300?text=Crop";

    res.json({ image });

  } catch (error) {
    console.log("Pexels Error:", error.message);
    res.json({
      image: "https://via.placeholder.com/400x300?text=Crop"
    });
  }
});

// ===== START SERVER =====
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});

