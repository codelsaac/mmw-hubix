import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PermissionService, Permission } from '@/lib/permissions';
import { authenticateRequest } from '@/lib/auth-server';
import { logger } from '@/lib/logger';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limiter';
import { handleApiError } from '@/lib/error-handler';
import { HistoryEvent } from '@prisma/client';
import { z } from 'zod';

const historyEventUpdateSchema = z
  .object({
    title: z.string().min(1).optional(),
    description: z.string().max(2000).optional(),
    date: z.coerce.date().optional(),
    location: z.string().max(255).optional(),
    imageUrl: z.string().url().max(2048).optional(),
    tags: z.array(z.string().min(1)).optional(),
    status: z.enum(['active', 'archived']).optional(),
  })
  .refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

function serializeHistoryEvent(event: HistoryEvent) {
  const tags = event.tags ? (JSON.parse(event.tags) as string[]) : [];
  const date = event.date;
  const year = date.getFullYear().toString();
  const dateLabel = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  return {
    id: event.id,
    title: event.title,
    description: event.description || '',
    location: event.location || '',
    imageUrl: event.imageUrl || '',
    tags,
    status: (event.status as 'active' | 'archived') || 'active',
    year,
    dateLabel,
    rawDate: event.date.toISOString(),
  };
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const rateLimitResult = await rateLimit(request, RATE_LIMITS.AUTH);
    if (rateLimitResult) return rateLimitResult;

    const { user, response } = await authenticateRequest();
    if (response) {
      return response;
    }

    if (!PermissionService.hasPermission(user.role, Permission.MANAGE_IT_SYSTEM, user.permissions)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const id = (await params).id;
    const body = await request.json();
    const parsed = historyEventUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { date, tags, ...rest } = parsed.data;

    const updated = await prisma.historyEvent.update({
      where: { id },
      data: {
        ...rest,
        ...(date ? { date } : {}),
        ...(tags ? { tags: tags.length > 0 ? JSON.stringify(tags) : null } : {}),
      },
    });

    const serialized = serializeHistoryEvent(updated);

    return NextResponse.json(serialized);
  } catch (error) {
    logger.error('Error updating history event:', error);
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const rateLimitResult = await rateLimit(request, RATE_LIMITS.AUTH);
    if (rateLimitResult) return rateLimitResult;

    const { user, response } = await authenticateRequest();
    if (response) {
      return response;
    }

    if (!PermissionService.hasPermission(user.role, Permission.MANAGE_IT_SYSTEM, user.permissions)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const id = (await params).id;

    await prisma.historyEvent.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error deleting history event:', error);
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
