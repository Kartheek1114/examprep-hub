const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });
const Exam = require('../models/Exam');

/**
 * DUPLICATE QUESTIONS CHECK SCRIPT
 * Usage: node check-duplicates.js
 * Reports all duplicate questions across exams
 */

const checkDuplicates = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB.\n');

        const exams = await Exam.find({});
        
        // Collect all questions with metadata
        const allQuestions = [];
        
        exams.forEach(exam => {
            exam.previousYearPapers.forEach(paper => {
                paper.questions.forEach(question => {
                    allQuestions.push({
                        text: question.text,
                        examId: exam.id,
                        examName: exam.name,
                        year: paper.year,
                        subject: question.subject,
                        correctAnswer: question.correctAnswer,
                        options: question.options.join(' | ')
                    });
                });
            });
        });

        console.log(`Total questions found: ${allQuestions.length}\n`);

        // Find duplicates by question text
        const questionMap = {};
        const duplicates = [];

        allQuestions.forEach((q, index) => {
            const key = q.text.toLowerCase();
            
            if (!questionMap[key]) {
                questionMap[key] = [];
            }
            questionMap[key].push(index);
        });

        // Find entries with more than 1 occurrence
        Object.keys(questionMap).forEach(key => {
            if (questionMap[key].length > 1) {
                duplicates.push({
                    questionText: key,
                    count: questionMap[key].length,
                    occurrences: questionMap[key].map(idx => allQuestions[idx])
                });
            }
        });

        if (duplicates.length === 0) {
            console.log('✅ No duplicate questions found!');
        } else {
            console.log(`⚠️  Found ${duplicates.length} duplicate(s):\n`);
            
            duplicates.forEach((dup, idx) => {
                console.log(`\n${idx + 1}. "${dup.questionText.substring(0, 80)}..."`);
                console.log(`   Appears ${dup.count} times:`);
                
                dup.occurrences.forEach((occ, i) => {
                    console.log(`   ${i + 1}. ${occ.examName} (${occ.year}) - ${occ.subject}`);
                    console.log(`      Options: ${occ.options}`);
                    console.log(`      Correct Answer: ${occ.correctAnswer}`);
                });
            });
        }

        // Summary statistics
        console.log(`\n${'='.repeat(60)}`);
        console.log(`Total Questions: ${allQuestions.length}`);
        console.log(`Unique Questions: ${Object.keys(questionMap).length}`);
        console.log(`Duplicate Groups: ${duplicates.length}`);
        
        if (duplicates.length > 0) {
            const totalDupQuestions = duplicates.reduce((sum, d) => sum + (d.count - 1), 0);
            console.log(`Total Duplicate Instances: ${totalDupQuestions}`);
        }

        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
};

checkDuplicates();
