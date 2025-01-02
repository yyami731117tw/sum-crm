-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'guest',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "joinDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL,
    "memberNo" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "nickname" TEXT,
    "idNumber" TEXT NOT NULL,
    "birthday" TIMESTAMP(3) NOT NULL,
    "joinDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'active',
    "email" TEXT,
    "lineId" TEXT,
    "address" TEXT,
    "memberCategory" TEXT NOT NULL DEFAULT '一般會員',
    "joinCondition" TEXT,
    "nationality" TEXT,
    "occupation" TEXT,
    "notes" TEXT,
    "emergencyContact" TEXT,
    "emergencyPhone" TEXT,
    "emergencyRelation" TEXT,
    "interests" TEXT[],
    "referrer" TEXT,
    "dietaryHabits" TEXT,
    "tags" TEXT[],
    "vipStartDate" TIMESTAMP(3),
    "vipEndDate" TIMESTAMP(3),
    "contractNo" TEXT,
    "contractDate" TIMESTAMP(3),
    "contractAmount" DOUBLE PRECISION,
    "paymentMethod" TEXT,
    "bankAccount" TEXT,
    "invoiceInfo" TEXT,
    "passportName" TEXT,
    "passportNo" TEXT,
    "isUSCitizen" BOOLEAN NOT NULL DEFAULT false,
    "idCardFront" TEXT,
    "idCardBack" TEXT,
    "hasMembershipPeriod" BOOLEAN NOT NULL DEFAULT false,
    "membershipStartDate" TIMESTAMP(3),
    "membershipEndDate" TIMESTAMP(3),
    "familyStatus" TEXT,
    "education" TEXT,
    "expertise" TEXT[],
    "taboos" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RelatedMember" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "relatedId" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RelatedMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Investment" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "projectName" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Investment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemberLog" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "operator" TEXT NOT NULL,
    "changes" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MemberLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Member_memberNo_key" ON "Member"("memberNo");

-- CreateIndex
CREATE UNIQUE INDEX "Member_idNumber_key" ON "Member"("idNumber");

-- CreateIndex
CREATE UNIQUE INDEX "RelatedMember_memberId_relatedId_key" ON "RelatedMember"("memberId", "relatedId");

-- AddForeignKey
ALTER TABLE "RelatedMember" ADD CONSTRAINT "RelatedMember_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Investment" ADD CONSTRAINT "Investment_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberLog" ADD CONSTRAINT "MemberLog_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
