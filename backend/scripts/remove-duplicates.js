const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });
const Exam = require('../models/Exam');

/**
 * REMOVE DUPLICATE QUESTIONS SCRIPT
 * Usage: node remove-duplicates.js
 * Removes duplicate questions, keeping only the first occurrence
 */

const removeDuplicates = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB.\n');

        const exams = await Exam.find({});
        let totalRemoved = 0;

        for (const exam of exams) {
            // Track seen question texts
            const seenQuestions = new Set();
            let exameRemoved = 0;

            exam.previousYearPapers.forEach(paper => {
                // Filter questions, keeping only first occurrence
                const uniqueQuestions = [];
                
                paper.questions.forEach(question => {
                    const key = question.text.toLowerCase();
                    
                    if (!seenQuestions.has(key)) {
                        seenQuestions.add(key);
                        uniqueQuestions.push(question);
                    } else {
                        exameRemoved++;
                    }
                });

                paper.questions = uniqueQuestions;
            });

            if (exameRemoved > 0) {
                await exam.save();
                console.log(`✅ ${exam.name}: Removed ${exameRemoved} duplicate(s)`);
                totalRemoved += exameRemoved;
            }
        }

        console.log(`\n${'='.repeat(60)}`);
        console.log(`Total duplicates removed: ${totalRemoved}`);
        console.log('Database cleaned successfully!');

        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
};

removeDuplicates();
