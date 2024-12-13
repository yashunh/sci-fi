-- CreateTable
CREATE TABLE "User" (
    "UID" TEXT NOT NULL,
    "FirstName" TEXT,
    "LastName" TEXT,
    "username" TEXT,
    "clubID" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT,
    "auth" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "OTP" (
    "otp" INTEGER NOT NULL,
    "userID" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_UID_key" ON "User"("UID");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "OTP_userID_key" ON "OTP"("userID");

-- AddForeignKey
ALTER TABLE "OTP" ADD CONSTRAINT "OTP_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("UID") ON DELETE RESTRICT ON UPDATE CASCADE;
