import express from 'express';
import prisma from '../lib/prisma';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const period = (req.query.period as string) || 'all';

        let dateFilter = {};
        const now = new Date();

        if (period === 'day') {
            dateFilter = {
                createdAt: {
                    gte: new Date(now.setHours(0, 0, 0, 0)),
                },
            };
        } else if (period === 'week') {
            const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            dateFilter = {
                createdAt: {
                    gte: lastWeek,
                },
            };
        } else if (period === 'month') {
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            dateFilter = {
                createdAt: {
                    gte: lastMonth,
                },
            };
        }

        // 1. Get responses
        const responses = await prisma.formResponse.findMany({
            where: {
                form: dateFilter,
            },
            select: {
                questionKey: true,
                answer: true,
            },
        });

        // 2. Aggregate manually (since we don't have access to questions list here easily without duplication, we'll just aggregate what we have)
        const stats: Record<string, Record<string, number>> = {};

        responses.forEach((r) => {
            if (!stats[r.questionKey]) {
                stats[r.questionKey] = {};
            }

            let answers: string[] = [];
            try {
                if (r.answer.startsWith('[') && r.answer.endsWith(']')) {
                    answers = JSON.parse(r.answer);
                } else {
                    answers = [r.answer];
                }
            } catch {
                answers = [r.answer];
            }

            answers.forEach((val) => {
                stats[r.questionKey][val] = (stats[r.questionKey][val] || 0) + 1;
            });
        });

        // 3. Priority counts
        const priorityCounts = await prisma.form.groupBy({
            by: ['priority'],
            where: dateFilter,
            _count: {
                priority: true,
            },
        });

        // 4. Total count
        const totalCount = await prisma.form.count({ where: dateFilter });

        res.json({
            stats,
            priorityCounts,
            totalCount,
        });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
