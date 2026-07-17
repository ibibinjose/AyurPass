import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  ABUSE_CATEGORIES,
  CreateFeedbackDto,
  QUALITY_TARGET_TYPES,
  SetReactionDto,
  SUGGESTION_CATEGORIES,
  UpdateFeedbackStatusDto,
  UpsertReviewDto,
  type QualityTargetType,
} from '../../dtos/quality.dto';

@Injectable()
export class QualityService {
  constructor(private prisma: PrismaService) {}

  private assertTargetType(t: string): asserts t is QualityTargetType {
    if (!(QUALITY_TARGET_TYPES as readonly string[]).includes(t)) {
      throw new BadRequestException('Invalid target type.');
    }
  }

  private async assertTargetExists(targetType: QualityTargetType, targetId: string) {
    // review / user / other are soft targets (no hard FK check)
    if (targetType === 'review' || targetType === 'user' || targetType === 'other') return;

    let ok = false;
    switch (targetType) {
      case 'provider':
        ok = Boolean(await this.prisma.provider.findUnique({ where: { id: targetId }, select: { id: true } }));
        break;
      case 'professional':
        ok = Boolean(
          await this.prisma.professional.findUnique({ where: { id: targetId }, select: { id: true } }),
        );
        break;
      case 'service':
        ok = Boolean(await this.prisma.service.findUnique({ where: { id: targetId }, select: { id: true } }));
        break;
      case 'product':
        ok = Boolean(await this.prisma.product.findUnique({ where: { id: targetId }, select: { id: true } }));
        break;
      case 'retreat':
        ok = Boolean(await this.prisma.retreat.findUnique({ where: { id: targetId }, select: { id: true } }));
        break;
      case 'offer':
        ok = Boolean(await this.prisma.offer.findUnique({ where: { id: targetId }, select: { id: true } }));
        break;
    }
    if (!ok) throw new NotFoundException('Target not found.');
  }

  /** Recompute star averages on denormalized listing fields. */
  private async recomputeRating(targetType: QualityTargetType, targetId: string) {
    if (
      targetType !== 'provider' &&
      targetType !== 'professional' &&
      targetType !== 'service'
    ) {
      return;
    }

    const agg = await this.prisma.review.aggregate({
      where: { targetType, targetId, status: 'published' },
      _avg: { rating: true },
      _count: { _all: true },
    });
    const rating = Number(agg._avg.rating ?? 0);
    const reviewCount = agg._count._all;
    const data = { rating, reviewCount };

    if (targetType === 'provider') {
      await this.prisma.provider.update({ where: { id: targetId }, data });
    } else if (targetType === 'professional') {
      await this.prisma.professional.update({ where: { id: targetId }, data });
    } else {
      await this.prisma.service.update({ where: { id: targetId }, data });
    }
  }

  private async recomputeReactions(targetType: QualityTargetType, targetId: string) {
    if (
      targetType !== 'provider' &&
      targetType !== 'professional' &&
      targetType !== 'service'
    ) {
      return;
    }

    const [likes, dislikes] = await Promise.all([
      this.prisma.reaction.count({ where: { targetType, targetId, value: 'like' } }),
      this.prisma.reaction.count({ where: { targetType, targetId, value: 'dislike' } }),
    ]);
    const data = { likeCount: likes, dislikeCount: dislikes };

    if (targetType === 'provider') {
      await this.prisma.provider.update({ where: { id: targetId }, data });
    } else if (targetType === 'professional') {
      await this.prisma.professional.update({ where: { id: targetId }, data });
    } else {
      await this.prisma.service.update({ where: { id: targetId }, data });
    }
  }

  async summary(targetType: string, targetId: string, userId?: string) {
    this.assertTargetType(targetType);

    const [avg, count, likes, dislikes, distribution, myReview, myReaction] = await Promise.all([
      this.prisma.review.aggregate({
        where: { targetType, targetId, status: 'published' },
        _avg: { rating: true },
      }),
      this.prisma.review.count({
        where: { targetType, targetId, status: 'published' },
      }),
      this.prisma.reaction.count({ where: { targetType, targetId, value: 'like' } }),
      this.prisma.reaction.count({ where: { targetType, targetId, value: 'dislike' } }),
      this.prisma.review.groupBy({
        by: ['rating'],
        where: { targetType, targetId, status: 'published' },
        _count: { _all: true },
      }),
      userId
        ? this.prisma.review.findUnique({
            where: {
              userId_targetType_targetId: { userId, targetType, targetId },
            },
          })
        : null,
      userId
        ? this.prisma.reaction.findUnique({
            where: {
              userId_targetType_targetId: { userId, targetType, targetId },
            },
          })
        : null,
    ]);

    const stars: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
    for (const row of distribution) {
      stars[String(row.rating)] = row._count._all;
    }

    return {
      targetType,
      targetId,
      rating: Number(avg._avg.rating ?? 0),
      reviewCount: count,
      likeCount: likes,
      dislikeCount: dislikes,
      stars,
      myReview: myReview
        ? {
            id: myReview.id,
            rating: myReview.rating,
            title: myReview.title,
            body: myReview.body,
            createdAt: myReview.createdAt,
            updatedAt: myReview.updatedAt,
          }
        : null,
      myReaction: myReaction?.value ?? null,
    };
  }

  async listReviews(targetType: string, targetId: string, take = 20) {
    this.assertTargetType(targetType);
    const limit = Math.min(Math.max(take, 1), 50);

    const rows = await this.prisma.review.findMany({
      where: { targetType, targetId, status: 'published' },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    const userIds = [...new Set(rows.map((r) => r.userId))];
    const users = userIds.length
      ? await this.prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, fullName: true, avatarUrl: true },
        })
      : [];
    const byId = new Map(users.map((u) => [u.id, u]));

    return rows.map((r) => ({
      id: r.id,
      rating: r.rating,
      title: r.title,
      body: r.body,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      author: {
        id: r.userId,
        fullName: byId.get(r.userId)?.fullName ?? 'AyurPass member',
        avatarUrl: byId.get(r.userId)?.avatarUrl ?? null,
      },
    }));
  }

  async upsertReview(userId: string, dto: UpsertReviewDto) {
    this.assertTargetType(dto.targetType);
    await this.assertTargetExists(dto.targetType, dto.targetId);

    const rating = Math.round(dto.rating);
    if (rating < 1 || rating > 5) throw new BadRequestException('Rating must be 1–5.');

    const title = dto.title?.trim().slice(0, 120) || null;
    const body = dto.body?.trim().slice(0, 2000) || null;

    const review = await this.prisma.review.upsert({
      where: {
        userId_targetType_targetId: {
          userId,
          targetType: dto.targetType,
          targetId: dto.targetId,
        },
      },
      create: {
        userId,
        targetType: dto.targetType,
        targetId: dto.targetId,
        rating,
        title,
        body,
        status: 'published',
      },
      update: {
        rating,
        title,
        body,
        status: 'published',
      },
    });

    await this.recomputeRating(dto.targetType, dto.targetId);
    return review;
  }

  async deleteReview(userId: string, targetType: string, targetId: string) {
    this.assertTargetType(targetType);
    const existing = await this.prisma.review.findUnique({
      where: {
        userId_targetType_targetId: { userId, targetType, targetId },
      },
    });
    if (!existing) throw new NotFoundException('Review not found.');
    if (existing.userId !== userId) throw new ForbiddenException();

    await this.prisma.review.delete({ where: { id: existing.id } });
    await this.recomputeRating(targetType as QualityTargetType, targetId);
    return { deleted: true };
  }

  async setReaction(userId: string, dto: SetReactionDto) {
    this.assertTargetType(dto.targetType);
    await this.assertTargetExists(dto.targetType, dto.targetId);

    if (dto.value === 'none') {
      await this.prisma.reaction.deleteMany({
        where: { userId, targetType: dto.targetType, targetId: dto.targetId },
      });
    } else {
      await this.prisma.reaction.upsert({
        where: {
          userId_targetType_targetId: {
            userId,
            targetType: dto.targetType,
            targetId: dto.targetId,
          },
        },
        create: {
          userId,
          targetType: dto.targetType,
          targetId: dto.targetId,
          value: dto.value,
        },
        update: { value: dto.value },
      });
    }

    await this.recomputeReactions(dto.targetType, dto.targetId);
    return this.summary(dto.targetType, dto.targetId, userId);
  }

  // --- Abuse reports & suggestions ---

  async createFeedback(dto: CreateFeedbackDto, userId?: string) {
    const message = dto.message.trim();
    if (message.length < 10) {
      throw new BadRequestException('Please write at least 10 characters.');
    }

    const cats =
      dto.kind === 'abuse'
        ? (ABUSE_CATEGORIES as readonly string[])
        : (SUGGESTION_CATEGORIES as readonly string[]);
    if (!cats.includes(dto.category)) {
      throw new BadRequestException(
        `Invalid category for ${dto.kind}. Allowed: ${cats.join(', ')}.`,
      );
    }

    const contactEmail = dto.contactEmail?.trim().toLowerCase().slice(0, 160) || null;
    if (!userId && !contactEmail) {
      throw new BadRequestException('Email is required when not signed in.');
    }

    if (dto.targetType && dto.targetId) {
      // Soft validation — only enforce for known hard targets
      if ((QUALITY_TARGET_TYPES as readonly string[]).includes(dto.targetType)) {
        try {
          await this.assertTargetExists(dto.targetType as QualityTargetType, dto.targetId);
        } catch {
          // Still accept report (listing may have been removed)
        }
      }
    }

    // Soft duplicate guard: same reporter + same message within 10 minutes
    const since = new Date(Date.now() - 10 * 60 * 1000);
    const dupWhere = {
      kind: dto.kind,
      message: message.slice(0, 4000),
      createdAt: { gte: since },
      ...(userId ? { userId } : contactEmail ? { contactEmail } : {}),
    };
    const recent = await this.prisma.feedbackReport.findFirst({
      where: dupWhere,
      orderBy: { createdAt: 'desc' },
    });
    if (recent) {
      return {
        id: recent.id,
        kind: recent.kind,
        status: recent.status,
        category: recent.category,
        createdAt: recent.createdAt,
        duplicate: true,
      };
    }

    const created = await this.prisma.feedbackReport.create({
      data: {
        kind: dto.kind,
        category: dto.category,
        message: message.slice(0, 4000),
        targetType: dto.targetType?.trim().slice(0, 40) || null,
        targetId: dto.targetId?.trim().slice(0, 64) || null,
        targetLabel: dto.targetLabel?.trim().slice(0, 200) || null,
        pageUrl: dto.pageUrl?.trim().slice(0, 500) || null,
        userId: userId || null,
        contactEmail,
        contactName: dto.contactName?.trim().slice(0, 120) || null,
        status: 'open',
      },
    });

    return {
      id: created.id,
      kind: created.kind,
      status: created.status,
      category: created.category,
      createdAt: created.createdAt,
      duplicate: false,
    };
  }

  async listFeedback(status?: string, kind?: string) {
    const rows = await this.prisma.feedbackReport.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(kind ? { kind } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 150,
    });

    const userIds = [...new Set(rows.map((r) => r.userId).filter(Boolean))] as string[];
    const users = userIds.length
      ? await this.prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, fullName: true, email: true },
        })
      : [];
    const byId = new Map(users.map((u) => [u.id, u]));

    return rows.map((r) => {
      const reporter = r.userId ? byId.get(r.userId) : null;
      return {
        ...r,
        reporter: reporter
          ? { id: reporter.id, fullName: reporter.fullName, email: reporter.email }
          : null,
      };
    });
  }

  async feedbackCounts() {
    const [open, reviewing, abuseOpen, suggestionOpen, total] = await Promise.all([
      this.prisma.feedbackReport.count({ where: { status: 'open' } }),
      this.prisma.feedbackReport.count({ where: { status: 'reviewing' } }),
      this.prisma.feedbackReport.count({ where: { status: 'open', kind: 'abuse' } }),
      this.prisma.feedbackReport.count({ where: { status: 'open', kind: 'suggestion' } }),
      this.prisma.feedbackReport.count(),
    ]);
    return { open, reviewing, abuseOpen, suggestionOpen, total };
  }

  async updateFeedbackStatus(id: string, dto: UpdateFeedbackStatusDto) {
    const row = await this.prisma.feedbackReport.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Report not found.');

    const note =
      dto.adminNote === undefined
        ? undefined
        : dto.adminNote.trim()
          ? dto.adminNote.trim().slice(0, 1000)
          : null;

    return this.prisma.feedbackReport.update({
      where: { id },
      data: {
        status: dto.status,
        ...(note !== undefined ? { adminNote: note } : {}),
      },
    });
  }
}
