const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Exam = require('../models/Exam');

// Bulk upload questions from pasted text
router.post('/upload-text', async (req, res) => {
    try {
        const { examId, year, paperName, text, questions: preParsedQuestions } = req.body;
        console.log(`[DEBUG] Received Upload Request: examId=${examId}, year=${year}`);

        if (!examId) return res.status(400).json({ message: "Missing examId" });

        let questions = [];
        let errors = [];

        if (req.body.questions && Array.isArray(req.body.questions)) {
            questions = req.body.questions;
            console.log(`Using pre-parsed question array: ${questions.length} questions`);
        } else {
            if (!text) {
                return res.status(400).json({ message: "No text provided" });
            }

            const lines = text.trim().split('\n').filter(line => line.trim() !== '');
            if (lines.length < 2) {
                return res.status(400).json({ message: "Invalid format. Need header and at least one data row." });
            }

            let headers = lines[0].split('\t').map(h => h.trim().toLowerCase());
            let useTabs = true;

            if (headers.length <= 1) {
                headers = lines[0].split(/\s{2,}/).map(h => h.trim().toLowerCase());
                useTabs = false;
            }

            const dataRows = lines.slice(1);
            dataRows.forEach((line, index) => {
                const cols = useTabs ? line.split('\t').map(c => c.trim()) : line.split(/\s{2,}/).map(c => c.trim());
                const row = {};
                headers.forEach((h, i) => row[h] = cols[i]);

                const qText = row.question || row.text;
                const qOptions = [
                    row.option1 || row.a,
                    row.option2 || row.b,
                    row.option3 || row.c,
                    row.option4 || row.d
                ].filter(opt => opt !== undefined && opt !== "");

                let rawAns = row.correctanswer || row.answer;
                let qCorrectAnswer = 0;

                if (!isNaN(parseInt(rawAns))) {
                    const numericAns = parseInt(rawAns);
                    qCorrectAnswer = numericAns > 0 && numericAns <= 4 ? numericAns - 1 : numericAns;
                } else if (typeof rawAns === 'string') {
                    const letterPos = ["a", "b", "c", "d"].indexOf(rawAns.toLowerCase());
                    if (letterPos !== -1) qCorrectAnswer = letterPos;
                }

                if (!qText || qOptions.length < 2 || isNaN(qCorrectAnswer)) {
                    errors.push(`Row ${index + 2}: Missing required fields or invalid CorrectAnswer.`);
                    return;
                }

                questions.push({
                    text: qText,
                    options: qOptions,
                    correctAnswer: qCorrectAnswer,
                    subject: row.subject || "General",
                    difficulty: (row.difficulty || 'medium').toLowerCase(),
                    explanation: row.explanation || ""
                });
            });
        }

        if (errors.length > 0 && questions.length === 0) {
            return res.status(400).json({ message: "No valid questions found.", errors });
        }

        // Use atomic update to find or create the paper and push questions
        const numericYear = parseInt(year);

        // Check if the paper for this year exists first
        const examObj = await Exam.findOne({
            $or: [
                { id: examId },
                { _id: mongoose.Types.ObjectId.isValid(examId) ? examId : undefined }
            ].filter(query => query.id !== undefined || query._id !== undefined)
        });

        if (!examObj) {
            return res.status(404).json({
                message: `Exam not found with ID: ${examId}. Please ensure the exam ID is correct.`,
                receivedId: examId
            });
        }

        const paper = examObj.previousYearPapers.find(p => p.year === numericYear);
        const existingQuestionTexts = new Set(paper ? paper.questions.map(q => q.text.toLowerCase().trim()) : []);

        const finalQuestionsToPush = [];
        const duplicateErrors = [];

        questions.forEach(q => {
            const cleanText = q.text.toLowerCase().trim();
            if (existingQuestionTexts.has(cleanText)) {
                duplicateErrors.push(q.text);
            } else {
                finalQuestionsToPush.push(q);
                existingQuestionTexts.add(cleanText); // Prevent duplicates within the same batch
            }
        });

        if (finalQuestionsToPush.length === 0 && questions.length > 0) {
            return res.status(200).json({
                message: `All ${questions.length} questions are already present in the database. No new questions added.`,
                skippedCount: questions.length,
                duplicates: duplicateErrors
            });
        }

        if (!paper) {
            console.log(`[DEBUG] Creating new year entry for Year: ${numericYear}`);
            // Create the year entry first if it doesn't exist
            await Exam.findOneAndUpdate(
                { _id: examObj._id },
                { $push: { previousYearPapers: { year: numericYear, questions: [] } } }
            );
        }

        console.log(`[DEBUG] Pushing ${finalQuestionsToPush.length} questions to Exam: ${examObj.id}, Year: ${numericYear}`);
        // Now push the questions into the specific year
        const result = await Exam.findOneAndUpdate(
            { _id: examObj._id, "previousYearPapers.year": numericYear },
            { $push: { "previousYearPapers.$.questions": { $each: finalQuestionsToPush } } },
            { new: true, runValidators: true }
        );

        if (!result) {
            console.error(`[ERROR] Final update failed for Exam ID: ${examObj._id}, Year: ${numericYear}`);
            throw new Error(`Failed to update exam document. Please ensure the year ${numericYear} is valid after creation.`);
        }

        res.status(200).json({
            message: `Successfully uploaded ${finalQuestionsToPush.length} new questions.${duplicateErrors.length > 0 ? ` Skipped ${duplicateErrors.length} duplicates.` : ''}${errors.length > 0 ? ` Skipped ${errors.length} invalid rows.` : ''}`,
            questionsCount: finalQuestionsToPush.length,
            duplicatesCount: duplicateErrors.length,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (err) {
        console.error('Text Upload Error:', err);
        // If it's a Mongoose validation error, provide more detail
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(e => e.message);
            return res.status(400).json({ message: "Validation Error: " + messages.join(', '), errors: messages });
        }
        res.status(500).json({ message: "Database Error: " + err.message });
    }
});

// Middleware to protect routes and check admin
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const adminAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) return res.status(401).send({ error: 'No authentication token provided' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) return res.status(401).send({ error: 'User not found' });

        // Check if user is admin
        const adminEmail = "kartheek04112004@gmail.com";
        if (user.email.toLowerCase().trim() !== adminEmail.toLowerCase().trim()) {
            return res.status(403).send({ error: 'Access denied. Admin only.' });
        }

        req.user = user;
        next();
    } catch (e) {
        return res.status(401).send({ error: 'Authentication failed' });
    }
};

// Create a new exam
router.post('/create', adminAuth, async (req, res) => {
    try {
        const { title, category, shortName, description, icon, eligibility } = req.body;

        // Map shortName to id
        const id = shortName.toLowerCase().replace(/\s+/g, '-');

        const exam = new Exam({
            id,
            name: title,
            category,
            shortName,
            description,
            icon,
            eligibility,
            previousYearPapers: [],
            syllabus: []
        });

        await exam.save();
        res.status(201).json(exam);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin health check
router.get('/', adminAuth, async (req, res) => {
    res.send("Working: Admin routes connected");
});

module.exports = router;
