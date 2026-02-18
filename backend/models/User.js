const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePicture: { type: String, default: "" }, // Base64 or URL
    progress: [{
        examId: String,
        topic: String,
        questionsAttempted: { type: Number, default: 0 },
        questionsCorrect: { type: Number, default: 0 },
        totalTimeSpent: { type: Number, default: 0 },
        lastAttempted: { type: Date, default: Date.now }
    }],
    resetPasswordOtp: { type: String },
    resetPasswordOtpExpires: { type: Date }
}, { timestamps: true });

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model('User', userSchema);
