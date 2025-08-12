-- CreateTable
CREATE TABLE "Registration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "aadhaarNumber" TEXT NOT NULL,
    "applicantName" TEXT NOT NULL,
    "mobileNumber" TEXT NOT NULL,
    "otpVerified" BOOLEAN NOT NULL DEFAULT false,
    "panNumber" TEXT NOT NULL,
    "pinCode" TEXT,
    "state" TEXT,
    "city" TEXT
);
