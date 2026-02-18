const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' }); // Adjust path to find your .env
const Exam = require('../models/Exam');

/**
 * STANDALONE IMPORT SCRIPT
 * Usage: node import-questions.js <examId> <year> <jsonFilePath>
 * Example: node import-questions.js ssc-cgl 2024 ./questions.json
 */

const importData = async () => {
    const [, , examId, year, filePath] = process.argv;

    if (!examId || !year || !filePath) {
        console.error('Usage: node import-questions.js <examId> <year> <jsonFilePath>');
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB.');

        const fs = require('fs');
        const questions = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        if (!Array.isArray(questions)) {
            throw new Error('JSON file must contain an array of questions.');
        }

        const numericYear = parseInt(year);

        // Find or create paper entry
        const exam = await Exam.findOne({ id: examId });
        if (!exam) throw new Error(`Exam with ID "${examId}" not found.`);

        let paper = exam.previousYearPapers.find(p => p.year === numericYear);
        if (!paper) {
            console.log(`Creating new year entry for ${numericYear}...`);
            exam.previousYearPapers.push({ year: numericYear, questions: [] });
            paper = exam.previousYearPapers[exam.previousYearPapers.length - 1];
        }

        console.log(`Adding ${questions.length} questions to ${examId} (${year})...`);
        paper.questions.push(...questions);

        await exam.save();
        console.log('Successfully imported questions!');
        process.exit(0);
    } catch (err) {
        console.error('Import Failed:', err.message);
        process.exit(1);
    }
};

importData();
