import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { GoogleGenerativeAI } from "@google/generative-ai";
import NodeCache from "node-cache"; 

import User from "./db.js";
import Submission from "./submissionModel.js";
import Problem from "./problemModel.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const cache = new NodeCache({ stdTTL: 3600 }); // Cache expiration set to 1 hour

// Initialize Google Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.use(express.static("public"));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected successfully."))
  .catch((err) => console.error("MongoDB connection error:", err));

// API Endpoint: Fetch User Report
app.get("/api/user-report", async (req, res) => {
  try {
    const query = req.query.query?.trim();
    if (!query) {
      return res.status(400).json({ error: "A valid query parameter is required." });
    }

    // Check if data is available in cache
    if (cache.has(query)) {
      return res.json(cache.get(query));
    }

    // Fetch user details based on User ID, Email, or Display Name
    const user = await User.findOne({
      $or: [
        { "user_account.user_id": query },
        { "user_account.primary_email": query },
        { "user_profile.display_name": query },
      ],
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Fetch user submissions and related problem details
    const submissions = await Submission.aggregate([
      { $match: { user_id: user.user_account.user_id } },
      {
        $lookup: {
          from: "problems",
          localField: "problem_id",
          foreignField: "problem_id",
          as: "problemDetails",
        },
      },
      { $unwind: "$problemDetails" },
    ]);

    if (submissions.length === 0) {
      return res.status(404).json({ error: "No submissions found for this user." });
    }

    // Aggregate performance data based on topics
    const topicStats = {};
    const problemStats = {};

    for (const submission of submissions) {
      const { problemDetails, submission_status, problem_id } = submission;
      const topics = problemDetails.problem_tags || [];

      // Track topic performance
      topics.forEach(topic => {
        if (!topicStats[topic]) {
          topicStats[topic] = { accepted: 0, wrong: 0 };
        }
        if (submission_status?.status === "Accepted") {
          topicStats[topic].accepted++;
        } else if (submission_status?.status === "Wrong Answer") {
          topicStats[topic].wrong++;
        }
      });

      // Track problem-specific statistics
      if (!problemStats[problem_id]) {
        problemStats[problem_id] = {
          title: problemDetails.problem_title,
          level: problemDetails.problem_level,
          attempts: 0,
          correct: 0,
        };
      }
      problemStats[problem_id].attempts++;
      if (submission_status?.status === "Accepted") {
        problemStats[problem_id].correct++;
      }
    }

    // Identify strong and weak topics
    const strongTopics = [];
    const weakTopics = [];

    for (const topic in topicStats) {
      const { accepted, wrong } = topicStats[topic];
      const totalAttempts = accepted + wrong;
      const acceptanceRatio = totalAttempts > 0 ? (accepted / totalAttempts) * 100 : 0;

      if (acceptanceRatio >= 70) {
        strongTopics.push(`${topic} (${acceptanceRatio.toFixed(0)}%)`);
      } else if (acceptanceRatio <= 50) {
        weakTopics.push(`${topic} (${acceptanceRatio.toFixed(0)}%)`);
      }
    }

    // Generate AI prompt with user's performance data
    const prompt = `
      User ID: ${user.user_account.user_id}
      Name: ${user.user_profile.display_name}
      Strong Topics: ${strongTopics.join(", ") || "None"}
      Weak Topics: ${weakTopics.join(", ") || "None"}

      Performance Data: ${JSON.stringify(problemStats)}

      Based on the user's submissions, generate a detailed AI-powered report covering:
      1. Strong topics where the user performs well.
      2. Weak topics that need improvement.
      3. Performance trends over different problem levels.
      4. Personalized suggestions, including study tips and problem-solving techniques.

      The report should be structured professionally and provide actionable insights.
    `;

    // Generate AI Report using Google Gemini AI
    let retries = 3;
    let aiReport = "AI report generation failed.";
    
    while (retries > 0) {
      try {
        const result = await model.generateContent(prompt);
        if (result?.response?.candidates?.length > 0) {
          aiReport = result.response.candidates[0]?.content?.parts?.[0]?.text || "AI report could not be retrieved.";
        } else {
          console.warn("AI response is empty or invalid.");
        }
        break;
      } catch (err) {
        console.error(`AI request failed. Retries left: ${retries - 1}`, err);
        retries--;
      }
    }

    // Prepare the final response
    const finalResult = {
      user: {
        id: user.user_account.user_id,
        name: user.user_profile.display_name,
        email: user.user_account.primary_email,
        avatar: user.user_profile.avatar_url
      },  
      strongTopics,
      weakTopics,
      aiReport,
      problemStats, // Useful for frontend visualization
    };

    // Store result in cache for improved performance
    cache.set(query, finalResult);
    
    res.json(finalResult);
  } catch (error) {
    console.error("Error fetching user report:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
