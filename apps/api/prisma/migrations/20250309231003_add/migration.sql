/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Residents` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `Residents` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Residents" ADD COLUMN     "email" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Residents_email_key" ON "Residents"("email");
