-- DropForeignKey
ALTER TABLE "Residents" DROP CONSTRAINT "Residents_roomId_fkey";

-- AlterTable
ALTER TABLE "Residents" ALTER COLUMN "firstname" DROP NOT NULL,
ALTER COLUMN "lastname" DROP NOT NULL,
ALTER COLUMN "roomId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Residents" ADD CONSTRAINT "Residents_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;
