import express from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { username, password } = req.body;

        const admin = await prisma.admin.findUnique({
            where: { username },
        });

        if (!admin) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isValid = await bcrypt.compare(password, admin.password);

        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Since we separated backend, setting httpOnly cookie for localhost:3000 from localhost:3001 is tricky without advanced CORS/Cookie setup.
        // For simplicity, we'll return a token or just success, and let frontend handle session state (e.g. localStorage or non-httpOnly cookie for now).
        // Or better: plain text success, frontend sets a cookie.

        // Simplest approach for this scope:
        res.json({ success: true, username: admin.username });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
