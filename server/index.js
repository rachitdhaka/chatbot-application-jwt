import express from "express";
import cors from "cors";
import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import jwt from "jsonwebtoken";

const app = express();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.use(cors());
app.use(express.json());
const authData=[];

app.post("/ask", async (req, res) => {
  const { question } = req.body;
  console.log("this is the question");
  console.log(question);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: question,
    });

    res.json({ reply: response.text });
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "Failed to generate answer" });
  }

  //   try {
  //     const response = await ai.models.generateContent({
  //       model: "gemini-3.7-flash",
  //       contents: [question],
  //     });

  //     console.log(response);

  //     // const replyText = response.text || "No response generated.";
  //     // res.json({ reply: replyText });

  //   } catch (error) {
  //     console.error("Gemini API Error:", error);
  //     // res.status(500).json({ error: "Failed to generate answer from Gemini" });
  //   }
});


app.post('/signup', function (req, res) {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  authData.push({ username, password });

  res.json({
    message: "SignUp Complete, please log in"
  });
});

app.post('/login' , (req , res)=>{
  const {username , password} = req.body;

  let UserFound=null;
  for (let i = 0; i < authData.length; i++) {
        if (authData[i].username === username && authData[i].password === password) {
            UserFound = authData[i];
        }
  }

  if (UserFound) {
        const token = jwt.sign({
            username: username,
            password: password
        }, JWT_KEY)

        res.json({
            token: token
        })
    }
    else {
        res.status(403).send({
            message: "Invalid username or password"
        })
    }



})

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(4000);
