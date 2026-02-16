/*
  Warnings:

  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "companies" DROP CONSTRAINT "companies_user_id_fkey";

-- DropForeignKey
ALTER TABLE "contacts" DROP CONSTRAINT "contacts_user_id_fkey";

-- DropForeignKey
ALTER TABLE "deals" DROP CONSTRAINT "deals_user_id_fkey";

-- DropForeignKey
ALTER TABLE "interactions" DROP CONSTRAINT "interactions_user_id_fkey";

-- DropForeignKey
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_user_id_fkey";

-- DropTable
DROP TABLE "users";

-- DropEnum
DROP TYPE "UserStatus";
