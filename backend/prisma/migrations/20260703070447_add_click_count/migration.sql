-- AlterTable
ALTER TABLE "SearchAnalytics" ADD COLUMN     "clickCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastClickedAt" TIMESTAMP(3);
