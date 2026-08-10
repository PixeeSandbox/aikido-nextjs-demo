-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'visitor',
    "passwordHash" TEXT,
    "membershipExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntrySlot" (
    "id" TEXT NOT NULL,
    "ticketTypeId" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "capacity" INTEGER NOT NULL,
    "booked" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EntrySlot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Member_email_key" ON "Member"("email");

-- CreateIndex
CREATE INDEX "Member_role_idx" ON "Member"("role");

-- CreateIndex
CREATE INDEX "Member_membershipExpiresAt_idx" ON "Member"("membershipExpiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "EntrySlot_ticketTypeId_startsAt_key" ON "EntrySlot"("ticketTypeId", "startsAt");

-- CreateIndex
CREATE INDEX "EntrySlot_ticketTypeId_day_idx" ON "EntrySlot"("ticketTypeId", "day");
