import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'admin123';

    if (!username || !password) {
        console.error('ADMIN_USERNAME or ADMIN_PASSWORD not set in .env');
        return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.admin.upsert({
        where: { username },
        update: { password: hashedPassword },
        create: {
            username,
            password: hashedPassword,
        },
    });

    console.log(`Admin user '${user.username}' created/updated successfully.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
