import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  ApplyJobDto,
  CreateJobDto,
  UpdateApplicationStatusDto,
  UpdateJobDto,
} from './jobs.dto';
import { Prisma, ServiceCategory } from '@prisma/client';

@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find public open job listings with optional filtering.
   */
  async findAll(query?: {
    category?: string;
    employmentType?: string;
    locationType?: string;
    q?: string;
    providerId?: string;
    limit?: number;
  }) {
    const where: Prisma.JobListingWhereInput = {
      status: 'OPEN',
    };

    if (query?.category) {
      where.category = query.category.toUpperCase() as ServiceCategory;
    }

    if (query?.employmentType) {
      where.employmentType = query.employmentType.toUpperCase() as any;
    }

    if (query?.locationType) {
      where.locationType = query.locationType;
    }

    if (query?.providerId) {
      where.providerId = query.providerId;
    }

    if (query?.q?.trim()) {
      const search = query.q.trim();
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { requirements: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { provider: { businessName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const jobs = await this.prisma.jobListing.findMany({
      where,
      include: {
        provider: {
          select: {
            id: true,
            businessName: true,
            slug: true,
            type: true,
            address: true,
            rating: true,
            reviewCount: true,
            verificationStatus: true,
          },
        },
        _count: {
          select: { applications: true },
        },
      },
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
      take: query?.limit ? Number(query.limit) : 50,
    });

    return jobs.map((j) => ({
      ...j,
      applicationCount: j._count.applications,
    }));
  }

  /**
   * Get single job listing by ID.
   */
  async findOne(id: string) {
    const job = await this.prisma.jobListing.findUnique({
      where: { id },
      include: {
        provider: {
          select: {
            id: true,
            businessName: true,
            slug: true,
            type: true,
            address: true,
            rating: true,
            reviewCount: true,
            verificationStatus: true,
            brandProfile: true,
          },
        },
        _count: {
          select: { applications: true },
        },
      },
    });

    if (!job) {
      throw new NotFoundException(`Job listing #${id} not found.`);
    }

    return {
      ...job,
      applicationCount: job._count.applications,
    };
  }

  /**
   * Get open job listings for a specific provider.
   */
  async findByProvider(providerId: string) {
    const jobs = await this.prisma.jobListing.findMany({
      where: {
        providerId,
        status: 'OPEN',
      },
      include: {
        _count: {
          select: { applications: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return jobs.map((j) => ({
      ...j,
      applicationCount: j._count.applications,
    }));
  }

  /**
   * Create a new job listing for a provider (Provider Admin / Staff).
   */
  async create(userId: string, dto: CreateJobDto) {
    // Verify provider ownership / staff permission
    const provider = await this.prisma.provider.findUnique({
      where: { id: dto.providerId },
    });

    if (!provider) {
      throw new NotFoundException(`Provider #${dto.providerId} not found.`);
    }

    if (provider.userId !== userId) {
      const staff = await this.prisma.providerStaff.findFirst({
        where: { providerId: dto.providerId, userId, inviteStatus: 'ACCEPTED' },
      });
      if (!staff) {
        throw new UnauthorizedException('You do not have management access for this practice.');
      }
    }

    return this.prisma.jobListing.create({
      data: {
        providerId: dto.providerId,
        title: dto.title.trim(),
        category: dto.category,
        employmentType: (dto.employmentType as any) || 'FULL_TIME',
        locationType: dto.locationType || 'on_site',
        city: dto.city?.trim() || null,
        country: dto.country?.trim() || null,
        salaryMin: dto.salaryMin !== undefined ? dto.salaryMin : null,
        salaryMax: dto.salaryMax !== undefined ? dto.salaryMax : null,
        currency: dto.currency || 'AUD',
        experienceYears: dto.experienceYears !== undefined ? dto.experienceYears : null,
        description: dto.description.trim(),
        requirements: dto.requirements?.trim() || null,
        featured: dto.featured || false,
        status: 'OPEN',
      },
      include: {
        provider: {
          select: { id: true, businessName: true, slug: true },
        },
      },
    });
  }

  /**
   * Update a job listing.
   */
  async update(id: string, userId: string, dto: UpdateJobDto) {
    const job = await this.prisma.jobListing.findUnique({ where: { id } });
    if (!job) {
      throw new NotFoundException(`Job listing #${id} not found.`);
    }

    const provider = await this.prisma.provider.findUnique({ where: { id: job.providerId } });
    if (provider?.userId !== userId) {
      const staff = await this.prisma.providerStaff.findFirst({
        where: { providerId: job.providerId, userId, inviteStatus: 'ACCEPTED' },
      });
      if (!staff) {
        throw new UnauthorizedException('Permission denied.');
      }
    }

    return this.prisma.jobListing.update({
      where: { id },
      data: {
        ...(dto.title && { title: dto.title.trim() }),
        ...(dto.category && { category: dto.category }),
        ...(dto.employmentType && { employmentType: dto.employmentType as any }),
        ...(dto.locationType && { locationType: dto.locationType }),
        ...(dto.city !== undefined && { city: dto.city?.trim() || null }),
        ...(dto.country !== undefined && { country: dto.country?.trim() || null }),
        ...(dto.salaryMin !== undefined && { salaryMin: dto.salaryMin }),
        ...(dto.salaryMax !== undefined && { salaryMax: dto.salaryMax }),
        ...(dto.experienceYears !== undefined && { experienceYears: dto.experienceYears }),
        ...(dto.description && { description: dto.description.trim() }),
        ...(dto.requirements !== undefined && { requirements: dto.requirements?.trim() || null }),
        ...(dto.status && { status: dto.status as any }),
        ...(dto.featured !== undefined && { featured: dto.featured }),
      },
    });
  }

  /**
   * Delete a job listing.
   */
  async remove(id: string, userId: string) {
    const job = await this.prisma.jobListing.findUnique({ where: { id } });
    if (!job) {
      throw new NotFoundException(`Job listing #${id} not found.`);
    }

    const provider = await this.prisma.provider.findUnique({ where: { id: job.providerId } });
    if (provider?.userId !== userId) {
      const staff = await this.prisma.providerStaff.findFirst({
        where: { providerId: job.providerId, userId, inviteStatus: 'ACCEPTED' },
      });
      if (!staff) {
        throw new UnauthorizedException('Permission denied.');
      }
    }

    return this.prisma.jobListing.delete({ where: { id } });
  }

  /**
   * Submit job application.
   */
  async apply(jobId: string, applicantUserId: string, dto: ApplyJobDto) {
    const job = await this.prisma.jobListing.findUnique({ where: { id: jobId } });
    if (!job) {
      throw new NotFoundException(`Job listing #${jobId} not found.`);
    }
    if (job.status !== 'OPEN') {
      throw new BadRequestException('This job listing is no longer accepting applications.');
    }

    const existing = await this.prisma.jobApplication.findUnique({
      where: {
        jobId_applicantUserId: {
          jobId,
          applicantUserId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('You have already applied for this position.');
    }

    return this.prisma.jobApplication.create({
      data: {
        jobId,
        applicantUserId,
        fullName: dto.fullName.trim(),
        email: dto.email.trim().toLowerCase(),
        phone: dto.phone?.trim() || null,
        coverNote: dto.coverNote?.trim() || null,
        resumeUrl: dto.resumeUrl?.trim() || null,
        experienceYears: dto.experienceYears !== undefined ? dto.experienceYears : null,
        status: 'SUBMITTED',
      },
      include: {
        job: {
          select: { id: true, title: true, provider: { select: { businessName: true } } },
        },
      },
    });
  }

  /**
   * View applications for a job listing (Provider only).
   */
  async getJobApplications(jobId: string, userId: string) {
    const job = await this.prisma.jobListing.findUnique({ where: { id: jobId } });
    if (!job) {
      throw new NotFoundException(`Job listing #${jobId} not found.`);
    }

    const provider = await this.prisma.provider.findUnique({ where: { id: job.providerId } });
    if (provider?.userId !== userId) {
      const staff = await this.prisma.providerStaff.findFirst({
        where: { providerId: job.providerId, userId, inviteStatus: 'ACCEPTED' },
      });
      if (!staff) {
        throw new UnauthorizedException('Permission denied.');
      }
    }

    return this.prisma.jobApplication.findMany({
      where: { jobId },
      include: {
        applicantUser: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
            professional: {
              select: {
                id: true,
                title: true,
                yearsExperience: true,
                specializations: true,
                rating: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Update application status (Provider owner/manager).
   */
  async updateApplicationStatus(
    applicationId: string,
    userId: string,
    dto: UpdateApplicationStatusDto,
  ) {
    const app = await this.prisma.jobApplication.findUnique({
      where: { id: applicationId },
      include: { job: true },
    });

    if (!app) {
      throw new NotFoundException(`Job application #${applicationId} not found.`);
    }

    const provider = await this.prisma.provider.findUnique({ where: { id: app.job.providerId } });
    if (provider?.userId !== userId) {
      const staff = await this.prisma.providerStaff.findFirst({
        where: { providerId: app.job.providerId, userId, inviteStatus: 'ACCEPTED' },
      });
      if (!staff) {
        throw new UnauthorizedException('Permission denied.');
      }
    }

    return this.prisma.jobApplication.update({
      where: { id: applicationId },
      data: {
        status: dto.status as any,
        adminNotes: dto.adminNotes?.trim() || undefined,
      },
    });
  }

  /**
   * View my submitted job applications (Applicant User).
   */
  async getMyApplications(userId: string) {
    return this.prisma.jobApplication.findMany({
      where: { applicantUserId: userId },
      include: {
        job: {
          include: {
            provider: {
              select: { id: true, businessName: true, slug: true, address: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
