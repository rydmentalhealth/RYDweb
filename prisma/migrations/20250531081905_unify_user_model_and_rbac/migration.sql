/*
  Warnings:

  - You are about to drop the column `memberId` on the `CheckIn` table. All the data in the column will be lost.
  - The `accessLevel` column on the `Document` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `priority` column on the `Project` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `Project` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `memberId` on the `ProjectMember` table. All the data in the column will be lost.
  - You are about to drop the column `assigneeId` on the `TaskAssignee` table. All the data in the column will be lost.
  - You are about to drop the column `teamMemberId` on the `TimeEntry` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `TeamMember` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[projectId,userId]` on the table `ProjectMember` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[taskId,userId]` on the table `TaskAssignee` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `CheckIn` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `ProjectMember` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `TaskAssignee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `TimeEntry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `email` on table `User` required. This step will fail if there are existing NULL values in that column.

*/

-- Step 1: Create new enums and commit them
BEGIN;
CREATE TYPE "UserStatus" AS ENUM ('PENDING', 'ACTIVE', 'INACTIVE', 'SUSPENDED', 'REJECTED');
CREATE TYPE "ProjectPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
CREATE TYPE "DocumentAccess" AS ENUM ('PUBLIC', 'ALL_STAFF', 'STAFF_ONLY', 'ADMIN_ONLY');
COMMIT;

-- Step 2: Update existing enums and commit them
BEGIN;
ALTER TYPE "Availability" ADD VALUE 'FLEXIBLE';
ALTER TYPE "UserRole" ADD VALUE 'STAFF';
COMMIT;

-- Step 3: Add new columns to User table (nullable first)
ALTER TABLE "User" 
ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedById" TEXT,
ADD COLUMN     "availability" "Availability",
ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "department" TEXT,
ADD COLUMN     "district" TEXT,
ADD COLUMN     "emergencyContact" TEXT,
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "jobTitle" TEXT,
ADD COLUMN     "languages" TEXT,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "nationalId" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "region" TEXT,
ADD COLUMN     "skills" TEXT,
ADD COLUMN     "startDate" TIMESTAMP(3),
ADD COLUMN     "status" "UserStatus" DEFAULT 'PENDING',
ADD COLUMN     "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "weeklyHours" INTEGER DEFAULT 40;

-- Step 4: Migrate data from TeamMember to User for linked users
UPDATE "User" SET
  "firstName" = tm."firstName",
  "lastName" = tm."lastName",
  "avatar" = tm."avatar",
  "bio" = tm."bio",
  "jobTitle" = tm."jobTitle",
  "department" = tm."department",
  "phone" = tm."phone",
  "nationalId" = tm."nationalId",
  "startDate" = tm."startDate",
  "endDate" = tm."endDate",
  "location" = tm."location",
  "district" = tm."district",
  "region" = tm."region",
  "languages" = tm."languages",
  "skills" = tm."skills",
  "emergencyContact" = tm."emergencyContact",
  "availability" = CASE 
    WHEN tm."availability" = 'FULL_TIME' THEN 'FULL_TIME'::"Availability"
    WHEN tm."availability" = 'PART_TIME' THEN 'PART_TIME'::"Availability"
    WHEN tm."availability" = 'ON_CALL' THEN 'ON_CALL'::"Availability"
    ELSE 'FLEXIBLE'::"Availability"
  END,
  "weeklyHours" = tm."weeklyHours",
  "status" = CASE 
    WHEN tm."status" = 'ACTIVE' THEN 'ACTIVE'::"UserStatus"
    WHEN tm."status" = 'INACTIVE' THEN 'INACTIVE'::"UserStatus"
    WHEN tm."status" = 'SUSPENDED' THEN 'SUSPENDED'::"UserStatus"
    ELSE 'PENDING'::"UserStatus"
  END,
  "createdAt" = tm."createdAt",
  "updatedAt" = tm."updatedAt"
FROM "TeamMember" tm
WHERE "User"."id" = tm."userId";

-- Step 5: Create users for TeamMembers without linked User accounts
INSERT INTO "User" (
  "id", "email", "firstName", "lastName", "avatar", "bio", "jobTitle", "department",
  "phone", "nationalId", "startDate", "endDate", "location", "district", "region",
  "languages", "skills", "emergencyContact", "availability", "weeklyHours", "status",
  "role", "createdAt", "updatedAt"
)
SELECT
  COALESCE(tm."userId", gen_random_uuid()::text),
  tm."email",
  tm."firstName",
  tm."lastName",
  tm."avatar",
  tm."bio",
  tm."jobTitle",
  tm."department",
  tm."phone",
  tm."nationalId",
  tm."startDate",
  tm."endDate",
  tm."location",
  tm."district",
  tm."region",
  tm."languages",
  tm."skills",
  tm."emergencyContact",
  CASE 
    WHEN tm."availability" = 'FULL_TIME' THEN 'FULL_TIME'::"Availability"
    WHEN tm."availability" = 'PART_TIME' THEN 'PART_TIME'::"Availability"
    WHEN tm."availability" = 'ON_CALL' THEN 'ON_CALL'::"Availability"
    ELSE 'FLEXIBLE'::"Availability"
  END,
  tm."weeklyHours",
  CASE 
    WHEN tm."status" = 'ACTIVE' THEN 'ACTIVE'::"UserStatus"
    WHEN tm."status" = 'INACTIVE' THEN 'INACTIVE'::"UserStatus"
    WHEN tm."status" = 'SUSPENDED' THEN 'SUSPENDED'::"UserStatus"
    ELSE 'PENDING'::"UserStatus"
  END,
  CASE 
    WHEN tm."role" = 'ADMIN' THEN 'ADMIN'::"UserRole"
    ELSE 'VOLUNTEER'::"UserRole"
  END,
  tm."createdAt",
  tm."updatedAt"
FROM "TeamMember" tm
WHERE tm."userId" IS NULL;

-- Step 6: Create a mapping table temporarily to preserve IDs
CREATE TEMPORARY TABLE team_member_user_mapping AS
SELECT 
  tm."id" as team_member_id,
  COALESCE(tm."userId", (SELECT "id" FROM "User" WHERE "email" = tm."email" LIMIT 1)) as user_id
FROM "TeamMember" tm;

-- Step 7: Update foreign key references

-- Update CheckIn references
ALTER TABLE "CheckIn" ADD COLUMN "userId" TEXT;
UPDATE "CheckIn" SET "userId" = (
  SELECT user_id FROM team_member_user_mapping WHERE team_member_id = "CheckIn"."memberId"
);
ALTER TABLE "CheckIn" ALTER COLUMN "userId" SET NOT NULL;

-- Update ProjectMember references
ALTER TABLE "ProjectMember" ADD COLUMN "userId" TEXT;
UPDATE "ProjectMember" SET "userId" = (
  SELECT user_id FROM team_member_user_mapping WHERE team_member_id = "ProjectMember"."memberId"
);
ALTER TABLE "ProjectMember" ALTER COLUMN "userId" SET NOT NULL;

-- Update TaskAssignee references
ALTER TABLE "TaskAssignee" ADD COLUMN "userId" TEXT;
UPDATE "TaskAssignee" SET "userId" = (
  SELECT user_id FROM team_member_user_mapping WHERE team_member_id = "TaskAssignee"."assigneeId"
);
ALTER TABLE "TaskAssignee" ALTER COLUMN "userId" SET NOT NULL;

-- Update TimeEntry references
ALTER TABLE "TimeEntry" ADD COLUMN "userId" TEXT;
UPDATE "TimeEntry" SET "userId" = (
  SELECT user_id FROM team_member_user_mapping WHERE team_member_id = "TimeEntry"."teamMemberId"
);
ALTER TABLE "TimeEntry" ALTER COLUMN "userId" SET NOT NULL;

-- Update Task createdBy references
UPDATE "Task" SET "createdById" = (
  SELECT user_id FROM team_member_user_mapping WHERE team_member_id = "Task"."createdById"
) WHERE "createdById" IS NOT NULL;

-- Update TaskComment author references
UPDATE "TaskComment" SET "authorId" = (
  SELECT user_id FROM team_member_user_mapping WHERE team_member_id = "TaskComment"."authorId"
);

-- Update Project owner references
UPDATE "Project" SET "ownerId" = (
  SELECT user_id FROM team_member_user_mapping WHERE team_member_id = "Project"."ownerId"
);

-- Update Document uploadedBy references
UPDATE "Document" SET "uploadedById" = (
  SELECT user_id FROM team_member_user_mapping WHERE team_member_id = "Document"."uploadedById"
);

-- Step 8: Drop old foreign key constraints
ALTER TABLE "CheckIn" DROP CONSTRAINT IF EXISTS "CheckIn_memberId_fkey";
ALTER TABLE "Document" DROP CONSTRAINT IF EXISTS "Document_uploadedById_fkey";
ALTER TABLE "Project" DROP CONSTRAINT IF EXISTS "Project_ownerId_fkey";
ALTER TABLE "ProjectMember" DROP CONSTRAINT IF EXISTS "ProjectMember_memberId_fkey";
ALTER TABLE "Task" DROP CONSTRAINT IF EXISTS "Task_createdById_fkey";
ALTER TABLE "TaskAssignee" DROP CONSTRAINT IF EXISTS "TaskAssignee_assigneeId_fkey";
ALTER TABLE "TaskComment" DROP CONSTRAINT IF EXISTS "TaskComment_authorId_fkey";
ALTER TABLE "TeamMember" DROP CONSTRAINT IF EXISTS "TeamMember_userId_fkey";
ALTER TABLE "TimeEntry" DROP CONSTRAINT IF EXISTS "TimeEntry_teamMemberId_fkey";

-- Step 9: Drop old indexes
DROP INDEX IF EXISTS "ProjectMember_projectId_memberId_key";
DROP INDEX IF EXISTS "TaskAssignee_taskId_assigneeId_key";

-- Step 10: Drop old columns
ALTER TABLE "CheckIn" DROP COLUMN "memberId";
ALTER TABLE "ProjectMember" DROP COLUMN "memberId";
ALTER TABLE "TaskAssignee" DROP COLUMN "assigneeId";
ALTER TABLE "TimeEntry" DROP COLUMN "teamMemberId";
ALTER TABLE "User" DROP COLUMN IF EXISTS "image";

-- Step 11: Update Project status and priority columns
ALTER TABLE "Project" ADD COLUMN "new_status" "ProjectStatus" DEFAULT 'PLANNING';
ALTER TABLE "Project" ADD COLUMN "new_priority" "ProjectPriority" DEFAULT 'MEDIUM';

UPDATE "Project" SET 
  "new_status" = CASE 
    WHEN "status" = 'PLANNING' THEN 'PLANNING'::"ProjectStatus"
    WHEN "status" = 'ACTIVE' THEN 'ACTIVE'::"ProjectStatus"
    WHEN "status" = 'COMPLETED' THEN 'COMPLETED'::"ProjectStatus"
    WHEN "status" = 'ON_HOLD' THEN 'ON_HOLD'::"ProjectStatus"
    WHEN "status" = 'CANCELLED' THEN 'CANCELLED'::"ProjectStatus"
    ELSE 'PLANNING'::"ProjectStatus"
  END,
  "new_priority" = CASE 
    WHEN "priority" = 'LOW' THEN 'LOW'::"ProjectPriority"
    WHEN "priority" = 'MEDIUM' THEN 'MEDIUM'::"ProjectPriority"
    WHEN "priority" = 'HIGH' THEN 'HIGH'::"ProjectPriority"
    WHEN "priority" = 'URGENT' THEN 'URGENT'::"ProjectPriority"
    ELSE 'MEDIUM'::"ProjectPriority"
  END;

ALTER TABLE "Project" DROP COLUMN "status";
ALTER TABLE "Project" DROP COLUMN "priority";
ALTER TABLE "Project" RENAME COLUMN "new_status" TO "status";
ALTER TABLE "Project" RENAME COLUMN "new_priority" TO "priority";
ALTER TABLE "Project" ALTER COLUMN "status" SET NOT NULL;
ALTER TABLE "Project" ALTER COLUMN "priority" SET NOT NULL;

-- Step 12: Update Document accessLevel
ALTER TABLE "Document" ADD COLUMN "new_accessLevel" "DocumentAccess" DEFAULT 'ALL_STAFF';
UPDATE "Document" SET "new_accessLevel" = 'ALL_STAFF'::"DocumentAccess";
ALTER TABLE "Document" DROP COLUMN "accessLevel";
ALTER TABLE "Document" RENAME COLUMN "new_accessLevel" TO "accessLevel";
ALTER TABLE "Document" ALTER COLUMN "accessLevel" SET NOT NULL;

-- Step 13: Make required columns NOT NULL and set defaults
ALTER TABLE "User" ALTER COLUMN "email" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "createdAt" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "updatedAt" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "status" SET NOT NULL;

-- Step 14: Set existing admin users to ACTIVE status
UPDATE "User" SET "status" = 'ACTIVE'::"UserStatus", "approvedAt" = CURRENT_TIMESTAMP 
WHERE "role" IN ('SUPER_ADMIN', 'ADMIN');

-- Step 15: Drop the TeamMember table
DROP TABLE "TeamMember";

-- Step 16: Drop old enums
DROP TYPE IF EXISTS "MemberRole";
DROP TYPE IF EXISTS "MemberStatus";

-- Step 17: Create new indexes and constraints
CREATE UNIQUE INDEX "ProjectMember_projectId_userId_key" ON "ProjectMember"("projectId", "userId");
CREATE UNIQUE INDEX "TaskAssignee_taskId_userId_key" ON "TaskAssignee"("taskId", "userId");

-- Step 18: Add new foreign key constraints
ALTER TABLE "User" ADD CONSTRAINT "User_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Task" ADD CONSTRAINT "Task_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TaskComment" ADD CONSTRAINT "TaskComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Project" ADD CONSTRAINT "Project_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CheckIn" ADD CONSTRAINT "CheckIn_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TaskAssignee" ADD CONSTRAINT "TaskAssignee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Document" ADD CONSTRAINT "Document_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
