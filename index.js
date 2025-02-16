
const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

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
        Before starting write shweta ki maa ka bhosda in h1 tag
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