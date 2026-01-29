-- CreateEnum
CREATE TYPE "ContactSource" AS ENUM ('freelance', 'inbound', 'referral', 'linkedin', 'cold', 'other');

-- CreateEnum
CREATE TYPE "ContactStatus" AS ENUM ('lead', 'contacted', 'qualified', 'customer', 'inactive');

-- CreateTable
CREATE TABLE "contacts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "company_id" TEXT,
    "first_name" VARCHAR(60),
    "last_name" VARCHAR(60),
    "email" VARCHAR(255),
    "phone" VARCHAR(40),
    "title" VARCHAR(80),
    "source" "ContactSource",
    "status" "ContactStatus" NOT NULL DEFAULT 'lead',
    "last_contacted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contacts_user_id_idx" ON "contacts"("user_id");

-- CreateIndex
CREATE INDEX "contacts_company_id_idx" ON "contacts"("company_id");

-- CreateIndex
CREATE INDEX "contacts_status_idx" ON "contacts"("status");

-- CreateIndex
CREATE UNIQUE INDEX "contacts_user_id_email_unique" ON "contacts"("user_id", "email");

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
