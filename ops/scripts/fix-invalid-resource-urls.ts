/**
 * Fix Invalid Resource URLs Script
 * 
 * This script identifies and fixes resources with invalid URLs
 * (localhost, admin routes, etc.) that shouldn't be in the database.
 * 
 * Run with: npx tsx scripts/fix-invalid-resource-urls.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Helper function to check if URL is invalid (same as validation-schemas.ts)
function isInvalidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    // Check for localhost
    if (urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1') {
      return true
    }
    // Check for internal paths
    const blockedPaths = ['/admin', '/api', '/dashboard', '/auth']
    if (blockedPaths.some(path => urlObj.pathname.includes(path))) {
      return true
    }
    return false
  } catch {
    // Invalid URL format
    return true
  }
}

async function main() {
  console.log('🔍 Scanning for invalid resource URLs...\n')

  // Find all resources with invalid URLs
  const allResources = await prisma.resource.findMany({
    select: {
      id: true,
      name: true,
      url: true,
      category: {
        select: {
          name: true
        }
      }
    }
  })

  const invalidResources = allResources.filter(resource => isInvalidUrl(resource.url))

  if (invalidResources.length === 0) {
    console.log('✅ No invalid resource URLs found!')
    return
  }

  console.log(`❌ Found ${invalidResources.length} resource(s) with invalid URLs:\n`)

  // Display invalid resources
  invalidResources.forEach((resource, index) => {
    console.log(`${index + 1}. Resource: "${resource.name}"`)
    console.log(`   Category: ${resource.category?.name || 'Uncategorized'}`)
    console.log(`   Invalid URL: ${resource.url}`)
    console.log(`   ID: ${resource.id}`)
    console.log()
  })

  console.log('🛠️  Fixing options:')
  console.log('   1. Set status to "inactive" (recommended)')
  console.log('   2. Delete the invalid resources')
  console.log('   3. Update URLs manually in admin panel\n')

  // Option 1: Set invalid resources to inactive status
  console.log('Applying fix: Setting invalid resources to inactive status...\n')

  const updateResult = await prisma.resource.updateMany({
    where: {
      id: {
        in: invalidResources.map(r => r.id)
      }
    },
    data: {
      status: 'inactive'
    }
  })

  console.log(`✅ Updated ${updateResult.count} resource(s) to inactive status`)
  console.log(`\n📝 Next steps:`)
  console.log(`   1. Go to Admin Panel > Resources`)
  console.log(`   2. Find the inactive resources`)
  console.log(`   3. Update them with valid external URLs`)
  console.log(`   4. Change status back to "active"\n`)

  // Generate report
  console.log('📊 Summary Report:')
  console.log(`   - Total resources scanned: ${allResources.length}`)
  console.log(`   - Invalid resources found: ${invalidResources.length}`)
  console.log(`   - Resources fixed: ${updateResult.count}`)
  console.log(`   - Validation now active: Resources will be validated on create/update\n`)

  console.log('✅ Cleanup complete!')
}

main()
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
