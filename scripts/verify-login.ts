
import { prisma } from '../lib/prisma'
import { verifyPassword } from 'better-auth/crypto'

async function verifyAdminPassword() {
    try {
        const admin = await prisma.user.findUnique({
            where: { username: 'admin' },
        })

        if (!admin || !admin.password) {
            console.error('❌ Admin user not found or has no password')
            return
        }

        console.log('User found:', admin.username)
        console.log('Stored hash:', admin.password)

        const passwordAttempt = 'admin1234'
        const isValid = await verifyPassword(admin.password, passwordAttempt)

        if (isValid) {
            console.log('✅ verification SUCCESS: Password matches the hash.')
        } else {
            console.error('❌ verification FAILED: Password does NOT match the hash.')
        }

    } catch (error) {
        console.error('Error verifying password:', error)
    } finally {
        await prisma.$disconnect()
    }
}

verifyAdminPassword()
