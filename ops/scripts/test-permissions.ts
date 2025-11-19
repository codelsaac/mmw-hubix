/**
 * Test script for dynamic permission system
 * Run with: npx ts-node scripts/test-permissions.ts
 */

import { Permission, PermissionService, UserRole } from "../../lib/permissions"

console.log("🧪 Testing Dynamic Permission System\n")

// Test 1: Role-based permissions (default behavior)
console.log("✅ Test 1: Role-based permissions")
const adminPerms = PermissionService.getRolePermissions(UserRole.ADMIN)
console.log(`   ADMIN has ${adminPerms.length} permissions`)
console.log(`   Can access admin: ${PermissionService.canAccessAdmin(UserRole.ADMIN)}`)

const studentPerms = PermissionService.getRolePermissions(UserRole.STUDENT)
console.log(`   STUDENT has ${studentPerms.length} permissions`)
console.log(`   Can access admin: ${PermissionService.canAccessAdmin(UserRole.STUDENT)}`)
console.log()

// Test 2: Custom permissions (stored as JSON in database)
console.log("✅ Test 2: Custom permissions from database")
const customPerms = JSON.stringify([Permission.MANAGE_WEBSITE, Permission.VIEW_ANALYTICS])
console.log(`   Custom permissions JSON: ${customPerms}`)

const studentWithCustom = PermissionService.getRolePermissions(UserRole.STUDENT, customPerms)
console.log(`   STUDENT with custom perms has ${studentWithCustom.length} permissions`)
console.log(`   Can access admin now: ${PermissionService.canAccessAdmin(UserRole.STUDENT, customPerms)}`)
console.log()

// Test 3: Merged permissions (role + custom)
console.log("✅ Test 3: Merged permissions (role + custom)")
const helperWithExtra = JSON.stringify([Permission.MANAGE_ANNOUNCEMENTS])
const helperMerged = PermissionService.getRolePermissions(UserRole.HELPER, helperWithExtra)
console.log(`   HELPER normally has ${PermissionService.getRolePermissions(UserRole.HELPER).length} permissions`)
console.log(`   HELPER with custom has ${helperMerged.length} permissions`)
console.log(`   Has MANAGE_ANNOUNCEMENTS: ${PermissionService.hasPermission(UserRole.HELPER, Permission.MANAGE_ANNOUNCEMENTS, helperWithExtra)}`)
console.log()

// Test 4: Permission checking
console.log("✅ Test 4: Permission checking")
console.log(`   ADMIN has MANAGE_USERS: ${PermissionService.hasPermission(UserRole.ADMIN, Permission.MANAGE_USERS)}`)
console.log(`   STUDENT has MANAGE_USERS: ${PermissionService.hasPermission(UserRole.STUDENT, Permission.MANAGE_USERS)}`)
console.log(`   STUDENT has VIEW_RESOURCES: ${PermissionService.hasPermission(UserRole.STUDENT, Permission.VIEW_RESOURCES)}`)
console.log()

// Test 5: Invalid JSON handling
console.log("✅ Test 5: Invalid JSON handling")
const invalidJson = "not valid json"
const parsedInvalid = PermissionService.parseCustomPermissions(invalidJson)
console.log(`   Invalid JSON parsed to: ${parsedInvalid.length} permissions (should be 0)`)
console.log()

// Test 6: isReadOnly check
console.log("✅ Test 6: Read-only access check")
console.log(`   STUDENT is read-only: ${PermissionService.isReadOnly(UserRole.STUDENT)}`)
console.log(`   ADMIN is read-only: ${PermissionService.isReadOnly(UserRole.ADMIN)}`)
console.log(`   STUDENT with MANAGE_RESOURCES is read-only: ${PermissionService.isReadOnly(UserRole.STUDENT, JSON.stringify([Permission.MANAGE_RESOURCES]))}`)
console.log()

console.log("✨ All tests completed!\n")
console.log("📚 To use this system:")
console.log("   1. Login to see your role-based permissions")
console.log("   2. Admin can add custom permissions via /api/admin/users/[id]/permissions")
console.log("   3. Permissions are loaded fresh on each login")
console.log("   4. Session includes merged role + custom permissions")
