const express = require('express');
const bcrypt = require('bcryptjs'); // Use bcryptjs instead of bcrypt for better compatibility with Node.js versions.
const jwt = require('jsonwebtoken');
const { User } = require('./models'); // Ensure this points to your User model.

const router = express.Router();
const JWT_SECRET = 'e2f7c0cbb7e439e4a781578fe403c3aaf45d8f6c4b8a9f6b2d07b0ab0a4f8d94';

// Register
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const existing = await User.findOne({ where: { email } });

        if (existing) {
            return res.status(409).json({ message: 'Email already in use' });
        }

        const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
        const user = await User.create({ username, email, password: hashedPassword });

        res.status(201).json({
            message: 'User registered successfully',
            user: { id: user.id, email: user.email, username: user.username }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email, username: user.username },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({ token: token, message: 'Login successful' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// Logout
router.post('/logout', (req, res) => {
    // Clear the JWT token cookie
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
});

router.get('/me', (req, res) => {
    const token = req.cookies.token;
    if (token) {
        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) {
                console.log(err);
                res.status(401).json({ message: 'Unauthorized' });
            } else {
                res.json({ user: decoded });
            }
        });
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
})

module.exports = router;
