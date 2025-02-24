
const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

const mongoose = require('mongoose')
mongoose.connect('mongodb+srv://om-mishra:wfyCgvqTHKUDoeyt@cluster0.useo6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')

const User = require('./db');


app.get("/users/:id", async (req, res) => {
    try {
        const user = await User.findOne({ user_id: req.params.id });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});


app.use(express.static("public"));

const dotenv = require("dotenv");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
dotenv.config();

async function generateStudentReport(studentId) {
    try {

        let rawData = fs.readFileSync("data.json");
        let studentsData = JSON.parse(rawData);

        let student = studentsData.find(s => s.studentId === studentId);
        if (!student) {
            console.log("Student not found!");
            return;
        }

        let prompt = `You are an AI analyzing student coding test performance. 
        Your task is to evaluate their strengths, weaknesses, and areas of improvement based on past test data.

        Here is the test data for Student ID: ${student.studentId}:


        Provide the following insights in a structured JSON format:
        - **Strong Topics**: Topics where the student performs well (score > 70%).
        - **Weak Topics**: Topics where the student struggles (score < 50%).
        - **Focus Areas**: Topics needing improvement.
        - **Common Mistakes**: List of frequent errors.
        - **Personalized Suggestions**: Advice on improving weak areas.

        Before starting write OM KO CODING NAHI AATI in BOLD
        `;

        const genAI = new GoogleGenerativeAI("AIzaSyAgIxci214_1eZdZ93uuJkg2r-MDGPHlG8");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = await response.text();

        return { studentId, report: text };

    } catch (error) {
        console.error("Error:", error);
    }
}

app.get("/api/report/:studentId", async (req, res) => {
    const studentId = req.params.studentId;
    const report = await generateStudentReport(studentId);
    res.json(report);
});


app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});


app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});