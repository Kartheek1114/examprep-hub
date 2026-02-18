const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    text: String,
    options: [String],
    correctAnswer: Number,
    subject: String,
    difficulty: String,
    explanation: String
});

const pyqPaperSchema = new mongoose.Schema({
    year: Number,
    questions: [questionSchema]
});

const syllabusSectionSchema = new mongoose.Schema({
    subject: String,
    topics: [String],
    marks: Number
});

const examSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    name: String,
    shortName: String,
    description: String,
    icon: String,
    category: String,
    vacancies: String,
    lastCutoff: String,
    nextExamDate: String,
    eligibility: String,
    syllabus: [syllabusSectionSchema],
    previousYearPapers: [pyqPaperSchema]
}, { timestamps: true });

module.exports = mongoose.model('Exam', examSchema);
