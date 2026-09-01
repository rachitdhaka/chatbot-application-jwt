import express from "express";
import cors from "cors";
import "dotenv/config";
import axios from "axios";
import { GoogleGenAI } from "@google/genai";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { User, Chat } from "./db.js";

const app = express();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error("JWT_SECRET must be configured in the environment");
}

app.use(cors());
app.use(express.json());

function authenticateToken(req, res, next) {
  const authorization = req.headers.authorization;
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice(7)
    : null;

  if (!token) {
    return res
      .status(401)
      .json({ message: "Authentication token is required" });
  }

  try {
    req.user = jwt.verify(token, jwtSecret);
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

app.post("/ask", authenticateToken, async (req, res) => {
  const { question } = req.body;

  if (!question || typeof question !== "string") {
    return res.status(400).json({ message: "Question is required" });
  }

  const systemInstruction =
    "You are a strict sports assistant. If the user query is NOT about sports, fitness, athletes, leagues, or games, you must strictly reply exactly with: 'Cannot be answered. I only answer about sports.' and stop. If it IS about sports, answer the question in under 100 words. Format it using bolding, a brief 1-sentence analogy or definition, and short, punchy bullet points.";

  const formattedPrompt = `${systemInstruction}\n\nQuestion: ${question}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: formattedPrompt,
    });

    res.json({ reply: response.text });
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "Failed to generate answer" });
  }
});

app.post("/api/chat", authenticateToken, async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.userId;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ message: "Message is required" });
    }

    let chat = await Chat.findOne({ userId });

    if (!chat) {
      chat = new Chat({
        userId,
        messages: [],
      });
    }

    chat.messages.push({
      role: "user",
      content: message,
    });

    const systemInstruction =
      "You are a strict sports assistant. If the user query is NOT about sports, fitness, athletes, leagues, or games, you must strictly reply exactly with: 'Cannot be answered. I only answer about sports.' and stop. If it IS about sports, answer the question in under 100 words. Format it using bolding, a brief 1-sentence analogy or definition, and short, punchy bullet points.";

    const formattedPrompt = `${systemInstruction}\n\nQuestion: ${message}`;

    const aiResponse = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: formattedPrompt,
    });

    const reply = aiResponse.text;

    chat.messages.push({
      role: "assistant",
      content: reply,
    });

    await chat.save();

    res.json({
      chatId: chat._id,
      reply,
    });
  } catch (error) {
    console.error("Chat save error:", error);
    res.status(500).json({ message: "Failed to save chat" });
  }
});

app.get("/api/chat", authenticateToken, async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user.userId }).sort({
      createdAt: -1,
    });
    res.json(chats);
  } catch (error) {
    console.error("Fetch chat error:", error);
    res.status(500).json({ message: "Failed to load chat history" });
  }
});

app.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  if (typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({ message: "email and password are required" });
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    return res.status(409).json({ message: "email is already registered" });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await User.create({ email: normalizedEmail, passwordHash });

  res.json({
    message: "SignUp complete, please log in",
  });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail =
    typeof email === "string" ? email.trim().toLowerCase() : "";

  const user = await User.findOne({ email: normalizedEmail });

  if (user && user.authProvider === "github") {
    return res.status(400).json({
      message:
        "This account uses GitHub Login. Please click the 'Sign in with GitHub' button.",
    });
  }

  const passwordMatches = user
    ? await bcrypt.compare(password ?? "", user.passwordHash)
    : false;

  if (!passwordMatches) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const token = jwt.sign(
    { userId: user._id.toString(), email: user.email },
    jwtSecret,
  );

  res.json({ token });
});

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/api/auth/github/callback", async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ message: "Authorization code missing" });
  }

  try {
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      {
        headers: {
          Accept: "application/json",
        },
      },
    );

    const accessToken = tokenResponse.data.access_token;

    if (!accessToken) {
      return res.status(400).json({ message: "Failed to obtain access token" });
    }

    const userResponse = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const githubUser = userResponse.data;
    const userEmail = githubUser.email || `${githubUser.login}@github.auth`;

    let user = await User.findOne({ githubId: githubUser.id.toString() });

    if (!user) {
      user = await User.findOne({ email: userEmail.toLowerCase().trim() });

      if (user) {
        user.githubId = githubUser.id.toString();
        user.authProvider = "github";
        await user.save();
      } else {
        user = await User.create({
          email: userEmail,
          githubId: githubUser.id.toString(),
          authProvider: "github",
        });
      }
    }

    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      jwtSecret,
    );

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    res.redirect(`${frontendUrl}/login-success?token=${token}`);
  } catch (error) {
    console.error("GitHub Auth Error:", error.message);
    res.status(500).json({ error: "Authentication pipeline failed" });
  }
});

const main = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("MONGO_URI must be configured in the environment");
  }

  await mongoose.connect(mongoUri);
  console.log("Database connected");
  app.listen(4000, () => console.log("Server running on port 4000"));
};

main().catch((error) => {
  console.error("Failed to start server:", error.message);
  process.exit(1);
});
