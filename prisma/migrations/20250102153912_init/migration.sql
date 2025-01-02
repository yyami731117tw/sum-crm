/*
  Warnings:

  - You are about to drop the column `contractId` on the `Investment` table. All the data in the column will be lost.
  - You are about to drop the column `projectName` on the `Investment` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Investment` table. All the data in the column will be lost.
  - You are about to drop the column `bankAccount` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `contractAmount` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `contractDate` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `contractNo` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `dietaryHabits` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `education` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `emergencyContact` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `emergencyPhone` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `emergencyRelation` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `expertise` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `familyStatus` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `hasMembershipPeriod` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `idCardBack` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `idCardFront` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `interests` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `invoiceInfo` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `isUSCitizen` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `joinCondition` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `joinDate` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `memberCategory` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `nationality` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `passportName` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `passportNo` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `paymentMethod` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `referrer` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `taboos` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `vipEndDate` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `vipStartDate` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `relatedId` on the `RelatedMember` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `RelatedMember` table. All the data in the column will be lost.
  - You are about to drop the column `joinDate` on the `User` table. All the data in the column will be lost.
  - Added the required column `type` to the `Investment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `memberType` to the `Member` table without a default value. This is not possible if the table is not empty.
  - Added the required column `relatedMemberId` to the `RelatedMember` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "RelatedMember_memberId_relatedId_key";

-- AlterTable
ALTER TABLE "Investment" DROP COLUMN "contractId",
DROP COLUMN "projectName",
DROP COLUMN "updatedAt",
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "type" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Member" DROP COLUMN "bankAccount",
DROP COLUMN "contractAmount",
DROP COLUMN "contractDate",
DROP COLUMN "contractNo",
DROP COLUMN "dietaryHabits",
DROP COLUMN "education",
DROP COLUMN "emergencyContact",
DROP COLUMN "emergencyPhone",
DROP COLUMN "emergencyRelation",
DROP COLUMN "expertise",
DROP COLUMN "familyStatus",
DROP COLUMN "hasMembershipPeriod",
DROP COLUMN "idCardBack",
DROP COLUMN "idCardFront",
DROP COLUMN "interests",
DROP COLUMN "invoiceInfo",
DROP COLUMN "isUSCitizen",
DROP COLUMN "joinCondition",
DROP COLUMN "joinDate",
DROP COLUMN "memberCategory",
DROP COLUMN "nationality",
DROP COLUMN "passportName",
DROP COLUMN "passportNo",
DROP COLUMN "paymentMethod",
DROP COLUMN "referrer",
DROP COLUMN "taboos",
DROP COLUMN "tags",
DROP COLUMN "vipEndDate",
DROP COLUMN "vipStartDate",
ADD COLUMN     "age" INTEGER,
ADD COLUMN     "memberType" TEXT NOT NULL,
ADD COLUMN     "remainingDays" INTEGER;

-- AlterTable
ALTER TABLE "RelatedMember" DROP COLUMN "relatedId",
DROP COLUMN "updatedAt",
ADD COLUMN     "relatedMemberId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "joinDate";

-- CreateIndex
CREATE INDEX "Investment_memberId_idx" ON "Investment"("memberId");

-- CreateIndex
CREATE INDEX "MemberLog_memberId_idx" ON "MemberLog"("memberId");

-- CreateIndex
CREATE INDEX "RelatedMember_memberId_idx" ON "RelatedMember"("memberId");
