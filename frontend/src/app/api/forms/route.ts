import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            priority,
            resultText,
            currentValue,
            targetValue,
            employeeName,
            Department,
            responses,
        } = body;

        const form = await prisma.form.create({
            data: {
                priority,
                resultText,
                currentValue,
                targetValue,
                employeeName: employeeName || 'Unknown',
                department: Department || 'Unknown',
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

        return NextResponse.json({ success: true, id: form.id });
    } catch (error) {
        console.error('Create form error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    try {
        // Basic pagination
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;

        const [forms, total] = await prisma.$transaction([
            prisma.form.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.form.count(),
        ]);

        return NextResponse.json({
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
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
