import { PrismaClient, UserRole, UserStatus } from "../lib/generated/prisma";
import { hashPassword } from "../lib/server/bcrypt";

const prisma = new PrismaClient();

async function main(): Promise<void> {
	const email = process.env.STAFF_EMAIL || "staff.test@rydmentalhealth.org";
	const name = process.env.STAFF_NAME || "Test Staff";
	const passwordPlain = process.env.STAFF_PASSWORD || "Staff123!";

	console.log(`Creating staff user if missing: ${email}`);

	const existing = await prisma.user.findUnique({ where: { email } });
	if (existing) {
		console.log("User already exists, ensuring role/status...");
		await prisma.user.update({
			where: { id: existing.id },
			data: {
				role: UserRole.STAFF,
				status: UserStatus.ACTIVE,
				approvedAt: existing.approvedAt ?? new Date(),
			},
		});
		console.log("Updated existing user to STAFF/ACTIVE.");
		await prisma.$disconnect();
		return;
	}

	const hashed = await hashPassword(passwordPlain);
	await prisma.user.create({
		data: {
			name,
			email,
			password: hashed,
			role: UserRole.STAFF,
			status: UserStatus.ACTIVE,
			approvedAt: new Date(),
		},
	});

	console.log("Staff user created successfully.");
	await prisma.$disconnect();
}

main().catch(async (err) => {
	console.error("Failed to create staff user:", err);
	await prisma.$disconnect();
	process.exit(1);
});

