import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== 'admin') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const userId = params.id;
  const body = await request.json();

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: body,
    });
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('[USER_PATCH]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}