/*
  Warnings:

  - You are about to drop the column `link` on the `Post` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Post" DROP COLUMN "link",
ADD COLUMN     "url" TEXT;
