import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventCategory, EventStatus, Prisma, TicketStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { slugifyPublicName, withSlugSuffix } from '../../common/slug';
import {
  CreateEventDto,
  RegisterEventDto,
  UpdateEventDto,
} from '../../dtos/event.dto';
import { WellnessPassService } from '../wellness-pass/wellness-pass.service';

const PROVIDER_CARD = {
  select: {
    id: true,
    code: true,
    slug: true,
    businessName: true,
    type: true,
    verificationStatus: true,
    brandProfile: true,
    address: true,
    currency: true,
  },
} as const;

export type EventQuery = {
  q?: string;
  category?: EventCategory;
  city?: string;
  country?: string;
  from?: string;
  to?: string;
  free?: boolean;
  providerId?: string;
};

@Injectable()
export class EventsService {
  constructor(
    private prisma: PrismaService,
    private wellnessPass: WellnessPassService,
  ) {}

  private async uniqueSlug(title: string): Promise<string> {
    const base = slugifyPublicName(title, 'event');
    let n = 0;
    while (true) {
      const slug = n === 0 ? base : withSlugSuffix(base, n);
      const hit = await this.prisma.wellnessEvent.findFirst({
        where: { slug },
        select: { id: true },
      });
      if (!hit) return slug;
      n += 1;
    }
  }

  private async providerIdForUser(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { provider: true, staffMemberships: { where: { inviteStatus: 'ACCEPTED' } } },
    });
    if (!user) throw new NotFoundException('User not found');
    if (user.provider) return user.provider.id;
    const staff = user.staffMemberships[0];
    if (staff) return staff.providerId;
    throw new ForbiddenException('Only practice owners and staff can manage events.');
  }

  async findPublic(query: EventQuery = {}) {
    const where: Prisma.WellnessEventWhereInput = {
      status: 'PUBLISHED',
      endTime: { gte: new Date() },
    };
    if (query.category) where.category = query.category;
    if (query.providerId) where.providerId = query.providerId;
    if (query.free === true) where.isFree = true;
    if (query.from || query.to) {
      where.startTime = {};
      if (query.from) (where.startTime as Prisma.DateTimeFilter).gte = new Date(query.from);
      if (query.to) (where.startTime as Prisma.DateTimeFilter).lte = new Date(query.to);
    }
    if (query.q?.trim()) {
      const q = query.q.trim();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { summary: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { venueName: { contains: q, mode: 'insensitive' } },
      ];
    }

    const list = await this.prisma.wellnessEvent.findMany({
      where,
      include: {
        provider: PROVIDER_CARD,
        _count: { select: { tickets: { where: { status: { in: ['CONFIRMED', 'CHECKED_IN', 'PENDING'] } } } } },
      },
      orderBy: { startTime: 'asc' },
      take: 120,
    });

    // Soft location filter on JSON address / venue
    const city = query.city?.trim().toLowerCase();
    const country = query.country?.trim().toLowerCase();
    if (!city && !country) return list;

    return list.filter((ev) => {
      const addr = (ev.address ?? {}) as Record<string, string>;
      const providerAddr = (ev.provider?.address ?? {}) as Record<string, string>;
      const hay = [
        ev.venueName,
        addr.city,
        addr.state,
        addr.country,
        providerAddr.city,
        providerAddr.state,
        providerAddr.country,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (city && !hay.includes(city)) return false;
      if (country && !hay.includes(country)) return false;
      return true;
    });
  }

  async findBySlug(slug: string) {
    const event = await this.prisma.wellnessEvent.findFirst({
      where: { slug, status: { in: ['PUBLISHED', 'COMPLETED'] } },
      include: {
        provider: PROVIDER_CARD,
        _count: {
          select: {
            tickets: { where: { status: { in: ['CONFIRMED', 'CHECKED_IN', 'PENDING'] } } },
          },
        },
      },
    });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async findById(id: string) {
    const event = await this.prisma.wellnessEvent.findUnique({
      where: { id },
      include: {
        provider: PROVIDER_CARD,
        _count: {
          select: {
            tickets: { where: { status: { in: ['CONFIRMED', 'CHECKED_IN', 'PENDING'] } } },
          },
        },
      },
    });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async listMine(userId: string) {
    const providerId = await this.providerIdForUser(userId);
    return this.prisma.wellnessEvent.findMany({
      where: { providerId },
      include: {
        _count: { select: { tickets: true } },
      },
      orderBy: { startTime: 'desc' },
    });
  }

  async create(userId: string, dto: CreateEventDto) {
    const providerId = await this.providerIdForUser(userId);
    const start = new Date(dto.startTime);
    const end = new Date(dto.endTime);
    if (!(end > start)) throw new BadRequestException('End time must be after start time.');

    const isFree = dto.isFree ?? Number(dto.price ?? 0) <= 0;
    const status: EventStatus = dto.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT';
    const slug = await this.uniqueSlug(dto.title);

    return this.prisma.wellnessEvent.create({
      data: {
        providerId,
        slug,
        title: dto.title.trim(),
        summary: dto.summary?.trim(),
        description: dto.description?.trim(),
        category: dto.category,
        tags: dto.tags ?? [],
        startTime: start,
        endTime: end,
        timezone: dto.timezone,
        isVirtual: dto.isVirtual ?? false,
        meetingUrl: dto.meetingUrl,
        venueName: dto.venueName?.trim(),
        address: (dto.address as object) ?? undefined,
        capacity: dto.capacity,
        waitlistEnabled: dto.waitlistEnabled ?? true,
        price: isFree ? 0 : dto.price ?? 0,
        currency: (dto.currency || 'AUD').toUpperCase().slice(0, 3),
        isFree,
        images: dto.images ?? [],
        coverImageUrl: dto.coverImageUrl,
        whatToBring: dto.whatToBring ?? [],
        inclusions: dto.inclusions ?? [],
        skillLevel: dto.skillLevel,
        hostProfessionalId: dto.hostProfessionalId,
        status,
        publishedAt: status === 'PUBLISHED' ? new Date() : null,
      },
      include: { provider: PROVIDER_CARD },
    });
  }

  async update(userId: string, id: string, dto: UpdateEventDto) {
    const providerId = await this.providerIdForUser(userId);
    const existing = await this.prisma.wellnessEvent.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Event not found');
    if (existing.providerId !== providerId) {
      throw new ForbiddenException('You cannot edit this event.');
    }

    if (dto.startTime && dto.endTime) {
      if (!(new Date(dto.endTime) > new Date(dto.startTime))) {
        throw new BadRequestException('End time must be after start time.');
      }
    }

    const data: Prisma.WellnessEventUpdateInput = {};
    if (dto.title !== undefined) data.title = dto.title.trim();
    if (dto.summary !== undefined) data.summary = dto.summary?.trim() ?? null;
    if (dto.description !== undefined) data.description = dto.description?.trim() ?? null;
    if (dto.category !== undefined) data.category = dto.category;
    if (dto.tags !== undefined) data.tags = dto.tags;
    if (dto.startTime !== undefined) data.startTime = new Date(dto.startTime);
    if (dto.endTime !== undefined) data.endTime = new Date(dto.endTime);
    if (dto.timezone !== undefined) data.timezone = dto.timezone;
    if (dto.isVirtual !== undefined) data.isVirtual = dto.isVirtual;
    if (dto.meetingUrl !== undefined) data.meetingUrl = dto.meetingUrl;
    if (dto.venueName !== undefined) data.venueName = dto.venueName;
    if (dto.address !== undefined) data.address = dto.address === null ? Prisma.JsonNull : (dto.address as object);
    if (dto.capacity !== undefined) data.capacity = dto.capacity;
    if (dto.waitlistEnabled !== undefined) data.waitlistEnabled = dto.waitlistEnabled;
    if (dto.price !== undefined) data.price = dto.price;
    if (dto.currency !== undefined) data.currency = dto.currency.toUpperCase().slice(0, 3);
    if (dto.isFree !== undefined) data.isFree = dto.isFree;
    if (dto.images !== undefined) data.images = dto.images;
    if (dto.coverImageUrl !== undefined) data.coverImageUrl = dto.coverImageUrl;
    if (dto.whatToBring !== undefined) data.whatToBring = dto.whatToBring;
    if (dto.inclusions !== undefined) data.inclusions = dto.inclusions;
    if (dto.skillLevel !== undefined) data.skillLevel = dto.skillLevel;
    if (dto.hostProfessionalId !== undefined) data.hostProfessionalId = dto.hostProfessionalId;
    if (dto.status !== undefined) {
      data.status = dto.status;
      if (dto.status === 'PUBLISHED' && !existing.publishedAt) {
        data.publishedAt = new Date();
      }
    }

    return this.prisma.wellnessEvent.update({
      where: { id },
      data,
      include: { provider: PROVIDER_CARD },
    });
  }

  async remove(userId: string, id: string) {
    const providerId = await this.providerIdForUser(userId);
    const existing = await this.prisma.wellnessEvent.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Event not found');
    if (existing.providerId !== providerId) {
      throw new ForbiddenException('You cannot delete this event.');
    }
    await this.prisma.wellnessEvent.delete({ where: { id } });
    return { id, deleted: true };
  }

  async register(userId: string, eventId: string, dto: RegisterEventDto = {}) {
    const event = await this.prisma.wellnessEvent.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: {
            tickets: { where: { status: { in: ['CONFIRMED', 'CHECKED_IN', 'PENDING'] } } },
          },
        },
      },
    });
    if (!event) throw new NotFoundException('Event not found');
    if (event.status !== 'PUBLISHED') {
      throw new BadRequestException('This event is not open for registration.');
    }
    if (event.endTime < new Date()) {
      throw new BadRequestException('This event has already ended.');
    }

    // Ensure consumer + permanent pass
    let consumer = await this.prisma.consumer.findUnique({ where: { userId } });
    if (!consumer) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new NotFoundException('User not found');
      // Promote seeker profile if missing (staff who also want to attend)
      consumer = await this.prisma.consumer.create({
        data: { userId, preferences: {}, prakritiScores: {} },
      });
    }

    const existing = await this.prisma.eventTicket.findUnique({
      where: { eventId_consumerId: { eventId, consumerId: userId } },
    });
    if (existing && !['CANCELLED', 'REFUNDED'].includes(existing.status)) {
      throw new ConflictException('You are already registered for this event.');
    }

    const taken = event._count.tickets;
    const full = event.capacity != null && taken >= event.capacity;
    let status: TicketStatus = 'CONFIRMED';
    if (full) {
      if (!event.waitlistEnabled) {
        throw new BadRequestException('This event is full.');
      }
      status = 'WAITLISTED';
    }

    const pass = await this.wellnessPass.ensureForConsumer(userId);
    const isFree = event.isFree || Number(event.price) <= 0;
    const qty = Math.min(dto.quantity ?? 1, 4);

    if (existing) {
      return this.prisma.eventTicket.update({
        where: { id: existing.id },
        data: {
          status,
          quantity: qty,
          totalAmount: isFree ? 0 : Number(event.price) * qty,
          currency: event.currency,
          paymentStatus: isFree ? 'free' : 'unpaid',
          wellnessPassId: pass.id,
          notes: dto.notes,
        },
        include: {
          event: { include: { provider: PROVIDER_CARD } },
          wellnessPass: true,
        },
      });
    }

    return this.prisma.eventTicket.create({
      data: {
        eventId,
        consumerId: userId,
        wellnessPassId: pass.id,
        status,
        quantity: qty,
        totalAmount: isFree ? 0 : Number(event.price) * qty,
        currency: event.currency,
        paymentStatus: isFree ? 'free' : 'unpaid',
        notes: dto.notes,
      },
      include: {
        event: { include: { provider: PROVIDER_CARD } },
        wellnessPass: true,
      },
    });
  }

  async myTickets(userId: string) {
    return this.prisma.eventTicket.findMany({
      where: {
        consumerId: userId,
        status: { notIn: ['CANCELLED', 'REFUNDED'] },
      },
      include: {
        event: { include: { provider: PROVIDER_CARD } },
        wellnessPass: { select: { id: true, serialNumber: true, publicToken: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listEventTickets(userId: string, eventId: string) {
    const providerId = await this.providerIdForUser(userId);
    const event = await this.prisma.wellnessEvent.findUnique({ where: { id: eventId } });
    if (!event || event.providerId !== providerId) {
      throw new ForbiddenException('Not your event.');
    }
    return this.prisma.eventTicket.findMany({
      where: { eventId },
      include: {
        consumer: { include: { user: { select: { id: true, fullName: true, email: true, avatarUrl: true } } } },
        wellnessPass: { select: { serialNumber: true, publicToken: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async cancelTicket(userId: string, ticketId: string) {
    const ticket = await this.prisma.eventTicket.findUnique({
      where: { id: ticketId },
      include: { event: true },
    });
    if (!ticket) throw new NotFoundException('Ticket not found');
    if (ticket.consumerId !== userId) {
      throw new ForbiddenException('Not your ticket.');
    }
    if (ticket.status === 'CHECKED_IN') {
      throw new BadRequestException('Already checked in — cannot cancel.');
    }
    return this.prisma.eventTicket.update({
      where: { id: ticketId },
      data: { status: 'CANCELLED' },
    });
  }
}
