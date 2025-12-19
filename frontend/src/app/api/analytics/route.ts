import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { questions } from '@/lib/questions';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period') || 'all'; // day, week, month, all

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

        // 1. Get all responses based on filter
        const responses = await prisma.formResponse.findMany({
            where: {
                form: dateFilter,
            },
            select: {
                questionKey: true,
                answer: true,
            },
        });

        // 2. Aggregate data for each question
        const stats: Record<string, Record<string, number>> = {};

        questions.forEach((q) => {
            stats[q.id] = {};
            if (q.options) {
                q.options.forEach((opt) => {
                    stats[q.id][opt.value] = 0;
                });
            }
        });

        responses.forEach((r) => {
            if (!stats[r.questionKey]) {
                stats[r.questionKey] = {}; // Should depend on logic but safe fallback
            }

            let answers: string[] = [];
            try {
                // Check if answer is JSON array (checkboxes)
                if (r.answer.startsWith('[') && r.answer.endsWith(']')) {
                    answers = JSON.parse(r.answer);
                } else {
                    answers = [r.answer];
                }
            } catch {
                answers = [r.answer];
            }

            answers.forEach((val) => {
                // Normalize checking against options could be complex if values changed, 
                // but generally we count string matches.
                if (stats[r.questionKey][val] !== undefined) {
                    stats[r.questionKey][val]++;
                } else {
                    // Dynamic values?
                    stats[r.questionKey][val] = (stats[r.questionKey][val] || 0) + 1;
                }
            });
        });

        // 3. Count forms by priority
        const priorityCounts = await prisma.form.groupBy({
            by: ['priority'],
            where: dateFilter,
            _count: {
                priority: true,
            },
        });

        // 4. Counts over time (for line chart)
        // This is a bit heavier, maybe simplified for now: total count
        const totalCount = await prisma.form.count({ where: dateFilter });

        return NextResponse.json({
            stats,
            priorityCounts,
            totalCount,
        });
    } catch (error) {
        console.error('Analytics error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
