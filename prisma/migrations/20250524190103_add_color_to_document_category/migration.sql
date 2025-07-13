-- DropIndex
DROP INDEX "DocumentCategory_name_key";

-- AlterTable
ALTER TABLE "DocumentCategory" ADD COLUMN     "color" TEXT;
