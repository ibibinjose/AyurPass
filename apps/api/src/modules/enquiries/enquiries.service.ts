import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEnquiryDto, UpdateEnquiryDto } from '../../dtos/enquiry.dto';
import { CommunicationsService } from '../communications/communications.service';

@Injectable()
export class EnquiriesService {
  constructor(
    private prisma: PrismaService,
    private communications: CommunicationsService,
  ) {}

  /** Public: a visitor leaves a lead on a provider's listing page or partner form. */
  async create(dto: CreateEnquiryDto) {
    let targetProviderId = dto.providerId;
    if (targetProviderId) {
      const provider = await this.prisma.provider.findUnique({
        where: { id: targetProviderId },
        select: { id: true },
      });
      if (!provider) throw new NotFoundException('Provider not found');
    } else {
      const sysProvider = await this.prisma.provider.findFirst({ select: { id: true } });
      if (sysProvider) {
        targetProviderId = sysProvider.id;
      }
    }

    if (!targetProviderId) {
      throw new NotFoundException('No active provider target found');
    }

    const enquiry = await this.prisma.enquiry.create({
      data: {
        providerId: targetProviderId,
        retreatId: dto.retreatId || null,
        name: dto.name.trim(),
        email: dto.email.trim(),
        phone: dto.phone?.trim() || null,
        message: dto.message.trim(),
      },
    });
    await this.communications.queueProviderEnquiry(enquiry.id);
    return enquiry;
  }

  /**
   * The provider the acting user administers — resolved from the token's `sub`
   * (never client-supplied), so a caller can only ever reach their own leads.
   */
  private async providerForUser(userSub: string) {
    return this.prisma.provider.findFirst({
      where: {
        OR: [
          { userId: userSub },
          { professionals: { some: { userId: userSub } } },
        ],
      },
      select: { id: true },
    });
  }

  /** The acting provider's own enquiries, newest first. */
  async listMine(userSub: string) {
    const provider = await this.providerForUser(userSub);
    if (!provider) return [];
    return this.prisma.enquiry.findMany({
      where: { providerId: provider.id },
      orderBy: { createdAt: 'desc' },
      include: { retreat: { select: { title: true, slug: true } } },
    });
  }

  /** Update status (new | read | archived) on an enquiry the caller owns. */
  async updateStatus(userSub: string, id: string, dto: UpdateEnquiryDto) {
    const provider = await this.providerForUser(userSub);
    const enquiry = provider
      ? await this.prisma.enquiry.findUnique({ where: { id } })
      : null;
    if (!enquiry || enquiry.providerId !== provider!.id) {
      throw new ForbiddenException('You can only manage your own enquiries');
    }
    return this.prisma.enquiry.update({
      where: { id },
      data: { status: dto.status },
    });
  }
}
