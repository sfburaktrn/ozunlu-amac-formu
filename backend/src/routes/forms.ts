import express from 'express';
import prisma from '../lib/prisma';

const router = express.Router();

// Create Form
router.post('/', async (req, res) => {
    try {
        const {
            priority,
            resultText,
            currentValue,
            targetValue,
            employeeName,
            Department,
            subject,
            responses,
        } = req.body;

        const form = await prisma.form.create({
            data: {
                priority,
                resultText,
                currentValue,
                targetValue,
                employeeName: employeeName || 'Unknown',
                department: Department || 'Unknown',
                subject: subject || '',
                responses: {
                    create: responses.map((r: any) => ({
                        questionKey: r.questionKey,
                        answer: Array.isArray(r.answer)
                            ? JSON.stringify(r.answer)
                            : r.answer,
                    })),
                },
            },
        });

        res.json({ success: true, id: form.id });
    } catch (error) {
        console.error('Create form error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// List Forms
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page as string || '1');
        const limit = parseInt(req.query.limit as string || '50');
        const skip = (page - 1) * limit;

        const [forms, total] = await prisma.$transaction([
            prisma.form.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: { responses: true },
            }),
            prisma.form.count(),
        ]);

        res.json({
            data: forms,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('List forms error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
