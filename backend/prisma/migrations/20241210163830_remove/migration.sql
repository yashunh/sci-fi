/*
  Warnings:

  - You are about to drop the `OTP` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "OTP" DROP CONSTRAINT "OTP_userID_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "otp" INTEGER;

-- DropTable
DROP TABLE "OTP";
