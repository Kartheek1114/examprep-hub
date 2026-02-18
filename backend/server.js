const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
require('dotenv').config();

const app = express();
app.set('trust proxy', 1); // Trust Render's proxy
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors());
app.use(passport.initialize());

require('./config/passport')(passport);

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected to Prepnovus DB'))
    .catch(err => console.log(err));

// Existing logic from previous backend
app.use('/api/auth', require('./routes/auth'));
app.use('/api/exams', require('./routes/exam'));
app.use('/api/user', require('./routes/user'));
app.use('/api/admin', require('./routes/admin'));

app.get('/', (req, res) => res.send('Prepnovus API Running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
