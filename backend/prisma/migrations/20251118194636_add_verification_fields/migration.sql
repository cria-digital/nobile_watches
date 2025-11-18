-- AlterTable
ALTER TABLE "User" ADD COLUMN     "documentBackUrl" TEXT,
ADD COLUMN     "documentFrontUrl" TEXT,
ADD COLUMN     "selfieUrl" TEXT,
ADD COLUMN     "verificationStatus" TEXT,
ADD COLUMN     "verificationSubmittedAt" TIMESTAMP(3);
