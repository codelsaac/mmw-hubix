import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limiter"

import { logger } from "@/lib/logger"
const ALLOWED_FILE_TYPES = {
  // Documents
  'application/pdf': 'documents',
  'application/msword': 'documents',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'documents',
  'application/vnd.ms-excel': 'documents',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'documents',
  'application/vnd.ms-powerpoint': 'documents',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'documents',
  'text/plain': 'documents',
  'text/csv': 'documents',
  
  // Images
  'image/jpeg': 'images',
  'image/jpg': 'images',
  'image/png': 'images',
  'image/gif': 'images',
  'image/webp': 'images',
  
  // Videos
  'video/mp4': 'videos',
  'video/webm': 'videos',
  'video/ogg': 'videos',
  'video/avi': 'videos',
  'video/mov': 'videos',
  'video/quicktime': 'videos',
  
  // Archives
  'application/zip': 'archives',
  'application/x-rar-compressed': 'archives',
  'application/x-7z-compressed': 'archives'
}

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

// File signature validation for security
const FILE_SIGNATURES: Record<string, string[]> = {
  'image/jpeg': ['FF D8 FF'],
  'image/png': ['89 50 4E 47'],
  'image/gif': ['47 49 46 38'],
  'application/pdf': ['25 50 44 46'],
  'application/zip': ['50 4B 03 04', '50 4B 05 06', '50 4B 07 08'],
  'video/mp4': ['00 00 00 18 66 74 79 70', '00 00 00 20 66 74 79 70'],
}

async function getFileSignature(buffer: Buffer): Promise<string> {
  const firstBytes = buffer.slice(0, 16)
  return Array.from(firstBytes)
    .map(byte => byte.toString(16).padStart(2, '0').toUpperCase())
    .join(' ')
}

function isValidFileSignature(mimeType: string, signature: string): boolean {
  const expectedSignatures = FILE_SIGNATURES[mimeType]
  if (!expectedSignatures) return true // Allow unknown types to pass through
  
  return expectedSignatures.some(expected => 
    signature.startsWith(expected)
  )
}

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await rateLimit(request, RATE_LIMITS.UPLOAD)
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.username) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 })
    }

    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        success: false, 
        error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit` 
      })
    }

    // Validate file type
    const fileCategory = ALLOWED_FILE_TYPES[file.type as keyof typeof ALLOWED_FILE_TYPES]
    if (!fileCategory) {
      return NextResponse.json({ 
        success: false, 
        error: 'File type not allowed. Supported: PDF, Word, Excel, PowerPoint, images, videos, and archives' 
      })
    }

    // Convert file to buffer first
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Additional security: Check file signature (magic numbers)
    const fileSignature = await getFileSignature(buffer)
    if (!isValidFileSignature(file.type, fileSignature)) {
      return NextResponse.json({ 
        success: false, 
        error: 'File content does not match declared type. Possible security threat.' 
      })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    const fileExtension = path.extname(file.name)
    const fileName = `${timestamp}_${randomString}${fileExtension}`

    // Create directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', fileCategory)
    await mkdir(uploadDir, { recursive: true })

    // Save file
    const filePath = path.join(uploadDir, fileName)
    await writeFile(filePath, buffer)

    // Return the public URL path
    const publicUrl = `/uploads/${fileCategory}/${fileName}`

    return NextResponse.json({ 
      success: true, 
      fileName: fileName,
      originalName: file.name,
      url: publicUrl,
      size: file.size,
      type: file.type,
      category: fileCategory
    })

  } catch (error) {
    logger.error('Upload error:', error)
    return NextResponse.json({ success: false, error: 'Upload failed' })
  }
}
