import { handlers } from "@/lib/auth";

export const runtime = "nodejs"; // Ensure Node runtime (Prisma not supported on Edge)

export const GET = handlers.GET;
export const POST = handlers.POST;