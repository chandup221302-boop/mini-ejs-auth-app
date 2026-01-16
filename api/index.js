const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const app = express();

// middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// EJS setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));
app.use(express.static(path.join(__dirname, "../public")));

// MongoDB (serverless safe)
let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGODB_URI);
  isConnected = true;
}

// routes
app.get("/", (req, res) => res.redirect("/login"));

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.post("/signup", async (req, res) => {
  await connectDB();
  const { name, email, password } = req.body;

  const hash = await bcrypt.hash(password, 10);
  await User.create({ name, email, password: hash });

  res.redirect("/login");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  await connectDB();
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.send("User not found");

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.send("Wrong password");

  res.redirect("/dashboard");
});

app.get("/dashboard", async (req, res) => {
  await connectDB();
  const totalUsers = await User.countDocuments();
  res.render("dashboard", { totalUsers });
});

module.exports = app; // ❌ app.listen नहीं
