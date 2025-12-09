-- Remove GUEST from UserRole enum
-- Note: This migration safely handles the case where GUEST may already be removed
ALTER TABLE `user` MODIFY `role` ENUM('ADMIN', 'HELPER', 'STUDENT') NOT NULL DEFAULT 'STUDENT';

