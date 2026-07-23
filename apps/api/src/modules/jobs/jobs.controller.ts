import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { Public } from '../../common/public.decorator';
import {
  ApplyJobDto,
  CreateJobDto,
  UpdateApplicationStatusDto,
  UpdateJobDto,
} from './jobs.dto';
import { JobsService } from './jobs.service';

@Controller()
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  /**
   * Public feed of job listings.
   * GET /jobs?category=AYURVEDA&employmentType=FULL_TIME&q=doctor
   */
  @Public()
  @Get('jobs')
  async findAll(
    @Query('category') category?: string,
    @Query('employmentType') employmentType?: string,
    @Query('locationType') locationType?: string,
    @Query('q') q?: string,
    @Query('providerId') providerId?: string,
    @Query('limit') limit?: number,
  ) {
    return this.jobsService.findAll({
      category,
      employmentType,
      locationType,
      q,
      providerId,
      limit,
    });
  }

  /**
   * Public endpoint to get open jobs for a specific provider.
   * GET /providers/:providerId/jobs
   */
  @Public()
  @Get('providers/:providerId/jobs')
  async findByProvider(@Param('providerId') providerId: string) {
    return this.jobsService.findByProvider(providerId);
  }

  /**
   * My submitted job applications (Applicant).
   * GET /jobs/my-applications
   */
  @Get('jobs/my-applications')
  @UseGuards(JwtAuthGuard)
  async getMyApplications(@Req() req: Request & { user: { userId: string } }) {
    return this.jobsService.getMyApplications(req.user.userId);
  }

  /**
   * Public job detail by ID.
   * GET /jobs/:id
   */
  @Public()
  @Get('jobs/:id')
  async findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  /**
   * Post a new job (Provider Admin/Owner).
   * POST /jobs
   */
  @Post('jobs')
  @UseGuards(JwtAuthGuard)
  async create(
    @Req() req: Request & { user: { userId: string } },
    @Body() dto: CreateJobDto,
  ) {
    return this.jobsService.create(req.user.userId, dto);
  }

  /**
   * Update a job listing (Provider Admin/Owner).
   * PATCH /jobs/:id
   */
  @Patch('jobs/:id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Req() req: Request & { user: { userId: string } },
    @Body() dto: UpdateJobDto,
  ) {
    return this.jobsService.update(id, req.user.userId, dto);
  }

  /**
   * Delete a job listing (Provider Admin/Owner).
   * DELETE /jobs/:id
   */
  @Delete('jobs/:id')
  @UseGuards(JwtAuthGuard)
  async remove(
    @Param('id') id: string,
    @Req() req: Request & { user: { userId: string } },
  ) {
    return this.jobsService.remove(id, req.user.userId);
  }

  /**
   * Submit job application (Applicant User).
   * POST /jobs/:id/apply
   */
  @Post('jobs/:id/apply')
  @UseGuards(JwtAuthGuard)
  async apply(
    @Param('id') jobId: string,
    @Req() req: Request & { user: { userId: string } },
    @Body() dto: ApplyJobDto,
  ) {
    return this.jobsService.apply(jobId, req.user.userId, dto);
  }

  /**
   * View job applicants for a posting (Provider Owner/Manager).
   * GET /jobs/:id/applications
   */
  @Get('jobs/:id/applications')
  @UseGuards(JwtAuthGuard)
  async getJobApplications(
    @Param('id') jobId: string,
    @Req() req: Request & { user: { userId: string } },
  ) {
    return this.jobsService.getJobApplications(jobId, req.user.userId);
  }

  /**
   * Update applicant status (Provider Owner/Manager).
   * PATCH /jobs/applications/:applicationId/status
   */
  @Patch('jobs/applications/:applicationId/status')
  @UseGuards(JwtAuthGuard)
  async updateApplicationStatus(
    @Param('applicationId') applicationId: string,
    @Req() req: Request & { user: { userId: string } },
    @Body() dto: UpdateApplicationStatusDto,
  ) {
    return this.jobsService.updateApplicationStatus(
      applicationId,
      req.user.userId,
      dto,
    );
  }
}
