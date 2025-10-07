# Database Migration and Optimization Summary

This document summarizes the changes made to the database schema and queries to ensure seamless compatibility between the local SQLite development environment and the production MySQL environment.

## 1. Schema Alignment

To prevent data type mismatches between SQLite and MySQL, the following changes were made to `prisma/schema.sqlite.prisma` to align it with `prisma/schema.prisma`:

- Added `@db.Text`, `@db.VarChar`, and `@db.LongText` annotations to the appropriate fields to ensure consistent data type mapping across both database systems.

## 2. JSON Data Type for InternalEvent Attendees

The `attendees` field in the `InternalEvent` model was changed from `String?` to `Json?` in both `prisma/schema.prisma` and `prisma/schema.sqlite.prisma`.

- This change leverages Prisma's native JSON support, which improves data integrity and simplifies the application code by removing the need for manual JSON serialization and deserialization.
- The `createInternalEvent` and `updateInternalEvent` functions in `lib/database.ts` were updated to remove the manual `JSON.stringify` calls.

## 3. Query Performance Optimization

A compound index was added to the `Task` model to improve the performance of queries that sort tasks.

- The following index was added to both `prisma/schema.prisma` and `prisma/schema.sqlite.prisma`:
  ```prisma
  @@index([status, priority, dueDate])
  ```
- This index will significantly speed up queries that sort tasks by their status, priority, and due date, especially as the number of tasks grows.

These changes ensure that the application will function correctly and performantly in both the local development and production environments.