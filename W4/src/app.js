const express = require('express');
const authRoutes = require('./routes/auth.routes');
const protectedRoutes = require('./routes/protected.routes');

const app = express();
app.use(express.json());

// Mount routes
app.use('/auth', authRoutes);
app.use('/public', protectedRoutes);
app.use('/protected', protectedRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Auth API is running!' });
});

module.exports = app;