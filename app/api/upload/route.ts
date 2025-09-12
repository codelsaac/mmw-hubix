import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' })
    }

    // Validate file type
    if (!file.type.startsWith('video/')) {
      return NextResponse.json({ success: false, error: 'Only video files are allowed' })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    const fileExtension = path.extname(file.name)
    const fileName = `${timestamp}_${randomString}${fileExtension}`

    // Save to public/videos directory
    const filePath = path.join(process.cwd(), 'public', 'videos', fileName)
    await writeFile(filePath, buffer)

    // Return the public URL path
    const publicUrl = `/videos/${fileName}`

    return NextResponse.json({ 
      success: true, 
      fileName: fileName,
      originalName: file.name,
      url: publicUrl,
      size: file.size,
      type: file.type
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ success: false, error: 'Upload failed' })
  }
}
