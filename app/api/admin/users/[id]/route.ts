import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { UserRole } from '@/lib/permissions';

import { logger } from "@/lib/logger"
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

  if (session?.user?.role !== UserRole.ADMIN) {
    return new NextResponse('Unauthorized', { status: 403 });
  }

  const { id: userId } = await params

  const schema = z.object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    role: z.enum(['ADMIN', 'HELPER', 'STUDENT']).optional(),
    department: z.string().optional(),
    isActive: z.boolean().optional()
  });

  try {
    const body = await request.json();
    const data = schema.parse(body);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data
    });
    return NextResponse.json(updatedUser);
  } catch (error) {
    logger.error('[USER_PATCH]', error);
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 400 });
    }
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)

  if (session?.user?.role !== UserRole.ADMIN) {
    return new NextResponse('Unauthorized', { status: 403 })
  }

  const { id: userId } = await params

  try {
    await prisma.user.delete({ where: { id: userId } })
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    logger.error('[USER_DELETE]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
