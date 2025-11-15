import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PermissionService, Permission } from '@/lib/permissions';
import { authenticateRequest } from '@/lib/auth-server';
import { logger } from '@/lib/logger';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limiter';
import { handleApiError } from '@/lib/error-handler';
import { z } from 'zod';

type HistoryEventRecord = {
  id: string;
  title: string;
  description: string | null;
  date: Date;
  location: string | null;
  imageUrl: string | null;
  tags: string | null;
  status: string;
};

const historyEventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().max(2000).optional(),
  date: z.coerce.date(),
  location: z.string().max(255).optional(),
  imageUrl: z.string().url().max(2048).optional(),
  tags: z.array(z.string().min(1)).optional(),
  status: z.enum(['active', 'archived']).optional(),
});

function serializeHistoryEvent(event: HistoryEventRecord) {
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

const DEFAULT_HISTORY_EVENTS = [
  {
    title: 'Open Day AV Support',
    description:
      'IT Perfect students managed projection and sound for the full-day open day programme in the school hall.',
    date: new Date('2024-03-01T00:00:00.000Z'),
    location: 'School Hall',
    imageUrl: '/windows-computer.png',
    tags: JSON.stringify(['Event', 'AV', 'Students']),
    status: 'active',
  },
  {
    title: 'Assembly Hall Upgrade Testing',
    description:
      'Supported teachers in testing the new projector and display system, including input switching and audio checks.',
    date: new Date('2023-10-01T00:00:00.000Z'),
    location: 'Assembly Hall',
    imageUrl: '/security-lock.png',
    tags: JSON.stringify(['Testing', 'Projector', 'Sound']),
    status: 'active',
  },
  {
    title: 'IT Promotion Week Visuals',
    description:
      'Prepared looping slides and screen content to promote IT activities around the campus.',
    date: new Date('2023-05-01T00:00:00.000Z'),
    location: 'Campus Displays',
    imageUrl: '/icon2.png',
    tags: JSON.stringify(['Promotion', 'Slides', 'Media']),
    status: 'active',
  },
];

export async function GET(req: NextRequest) {
  try {
    const rateLimitResult = await rateLimit(req, RATE_LIMITS.GENERAL);
    if (rateLimitResult) return rateLimitResult;

    let events = await prisma.historyEvent.findMany({
      orderBy: { date: 'desc' },
    });

    if (events.length === 0) {
      await prisma.historyEvent.createMany({
        data: DEFAULT_HISTORY_EVENTS,
      });

      events = await prisma.historyEvent.findMany({
        orderBy: { date: 'desc' },
      });
    }

    const serialized = events.map(serializeHistoryEvent);

    return NextResponse.json(serialized);
  } catch (error) {
    logger.error('Error fetching history events:', error);
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const parsed = historyEventSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { date, tags, status, ...rest } = parsed.data;

    const created = await prisma.historyEvent.create({
      data: {
        ...rest,
        date,
        status: status || 'active',
        tags: tags && tags.length > 0 ? JSON.stringify(tags) : null,
        createdBy: user.id,
      },
    });

    const serialized = serializeHistoryEvent(created);

    return NextResponse.json(serialized, { status: 201 });
  } catch (error) {
    logger.error('Error creating history event:', error);
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
