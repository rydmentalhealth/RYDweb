import { handlers } from "@/lib/auth";

export const runtime = "node"; // Ensure Node runtime (Prisma not supported on Edge)

export const GET = handlers.GET;
export const POST = handlers.POST;