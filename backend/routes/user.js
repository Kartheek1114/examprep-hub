const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Middleware to protect routes
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) throw new Error();
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) throw new Error();
        req.user = user;
        next();
    } catch (e) {
        res.status(401).send({ error: 'Please authenticate.' });
    }
};

// Get current user profile
router.get('/me', auth, async (req, res) => {
    res.send(req.user);
});

// Update profile
router.patch('/me', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'profilePicture'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' });
    }

    try {
        // Validate name
        if (req.body.name !== undefined) {
            if (typeof req.body.name !== 'string' || req.body.name.trim().length === 0) {
                return res.status(400).send({ error: 'Name is required and must be a non-empty string' });
            }
            req.user.name = req.body.name.trim();
        }

        // Validate profilePicture
        if (req.body.profilePicture !== undefined) {
            if (typeof req.body.profilePicture === 'string') {
                // Check if it's a base64 string or URL
                const maxSize = 10 * 1024 * 1024; // 10MB limit
                if (req.body.profilePicture.startsWith('data:image') && req.body.profilePicture.length > maxSize) {
                    return res.status(400).send({ error: 'Image is too large. Maximum size is 10MB.' });
                }
                req.user.profilePicture = req.body.profilePicture;
            } else if (req.body.profilePicture === null || req.body.profilePicture === '') {
                req.user.profilePicture = '';
            } else {
                return res.status(400).send({ error: 'Profile picture must be a string URL or base64 image' });
            }
        }

        await req.user.save();
        res.send(req.user);
    } catch (e) {
        console.error('Profile update error:', e);
        res.status(400).send({ error: 'Failed to update profile: ' + e.message });
    }
});

// Update progress
router.post('/progress', auth, async (req, res) => {
    try {
        const { examId, subject, correct, timeSpent } = req.body;
        const user = req.user;

        let progressEntry = user.progress.find(p => p.examId === examId && p.topic === subject);

        if (progressEntry) {
            progressEntry.questionsAttempted += 1;
            if (correct) progressEntry.questionsCorrect += 1;
            progressEntry.totalTimeSpent += timeSpent;
            progressEntry.lastAttempted = Date.now();
        } else {
            user.progress.push({
                examId,
                topic: subject,
                questionsAttempted: 1,
                questionsCorrect: correct ? 1 : 0,
                totalTimeSpent: timeSpent,
                lastAttempted: Date.now()
            });
        }

        await user.save();
        res.status(200).send(user);
    } catch (e) {
        res.status(400).send({ error: e.message });
    }
});

module.exports = router;
