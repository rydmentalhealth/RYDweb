import { PrismaClient, UserRole, UserStatus } from '../lib/generated/prisma';

const prisma = new PrismaClient();

async function activateAllStaffUsers(): Promise<void> {
	console.log('Activating all STAFF users...');
	const result = await prisma.user.updateMany({
		where: {
			role: UserRole.STAFF,
			status: { not: UserStatus.ACTIVE },
		},
		data: {
			status: UserStatus.ACTIVE,
			approvedAt: new Date(),
		},
	});
	console.log(`Updated ${result.count} STAFF user(s) to ACTIVE.`);
}

async function main(): Promise<void> {
	try {
		await activateAllStaffUsers();
	} catch (error) {
		console.error('Failed to activate STAFF users:', error);
		process.exitCode = 1;
	} finally {
		await prisma.$disconnect();
	}
}

main();