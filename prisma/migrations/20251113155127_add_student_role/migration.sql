/*
  Warnings:

  - You are about to drop the `notification` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE `resource` ADD COLUMN `icon` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `user` MODIFY `role` ENUM('ADMIN', 'HELPER', 'STUDENT', 'GUEST') NOT NULL DEFAULT 'GUEST';

-- DropTable
DROP TABLE `notification`;
