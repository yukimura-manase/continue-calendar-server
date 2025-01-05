/*
  Warnings:

  - The primary key for the `CalendarDate` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `calendarDate_id` on the `CalendarDate` table. All the data in the column will be lost.
  - The required column `calendarDateId` was added to the `CalendarDate` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "CalendarDate" DROP CONSTRAINT "CalendarDate_pkey",
DROP COLUMN "calendarDate_id",
ADD COLUMN     "calendarDateId" TEXT NOT NULL,
ADD CONSTRAINT "CalendarDate_pkey" PRIMARY KEY ("calendarDateId");

-- AlterTable
ALTER TABLE "Goal" ALTER COLUMN "calendarId" DROP NOT NULL;
