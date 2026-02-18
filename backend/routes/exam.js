const express = require('express');
const Exam = require('../models/Exam');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const exams = await Exam.find();
        res.json(exams);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const exam = await Exam.findOne({ id: req.params.id });
        res.json(exam);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add a question to an exam
router.post('/:id/questions', async (req, res) => {
    try {
        const { year, question } = req.body;
        const exam = await Exam.findOne({ id: req.params.id });

        if (!exam) return res.status(404).json({ message: "Exam not found" });

        // Find paper for the given year or create a new one
        let paper = exam.previousYearPapers.find(p => p.year === year);
        if (!paper) {
            paper = { year, questions: [] };
            exam.previousYearPapers.push(paper);
            paper = exam.previousYearPapers[exam.previousYearPapers.length - 1];
        }

        // Duplicate check
        const isDuplicate = paper.questions.some(q => q.text.toLowerCase().trim() === question.text.toLowerCase().trim());
        if (isDuplicate) {
            return res.status(409).json({ message: "This question already exists in this exam and year." });
        }

        paper.questions.push(question);
        await exam.save();

        res.status(201).json({ message: "Question added successfully", exam });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update exam details
router.patch('/:id', async (req, res) => {
    try {
        const updates = req.body;
        const exam = await Exam.findOneAndUpdate({ id: req.params.id }, updates, { new: true });

        if (!exam) return res.status(404).json({ message: "Exam not found" });

        res.json(exam);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
