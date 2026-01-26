/*
  Warnings:

  - You are about to drop the column `name` on the `users` table. All the data in the column will be lost.
  - You are about to alter the column `email` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - Added the required column `password_hash` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'disabled');

-- AlterTable
ALTER TABLE "users" DROP COLUMN "name",
ADD COLUMN     "display_name" VARCHAR(80),
ADD COLUMN     "password_hash" VARCHAR(255) NOT NULL,
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'active',
ALTER COLUMN "email" SET DATA TYPE VARCHAR(255);
