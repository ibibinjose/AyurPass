import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Throttle } from '@nestjs/throttler';
import { QualityService } from './quality.service';
import {
  CreateFeedbackDto,
  SetReactionDto,
  UpdateFeedbackStatusDto,
  UpsertReviewDto,
} from '../../dtos/quality.dto';
import { Public } from '../../common/public.decorator';
import { AuthedRequest, AuthedUser } from '../../common/jwt-auth.guard';
import { accessSecret } from '../../common/env';
import { AdminGuard } from '../admin/admin.guard';

@Controller('quality')
export class QualityController {
  constructor(
    private readonly quality: QualityService,
    private readonly jwt: JwtService,
  ) {}

  /** Best-effort user id from Bearer token on public routes. */
  private optionalUserId(req: AuthedRequest): string | undefined {
    if (req.user?.sub) return req.user.sub;
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return undefined;
    try {
      const payload = this.jwt.verify<AuthedUser>(token, { secret: accessSecret() });
      return payload.sub;
    } catch {
      return undefined;
    }
  }

  @Public()
  @Get('summary')
  async summary(
    @Query('targetType') targetType: string,
    @Query('targetId') targetId: string,
    @Req() req: AuthedRequest,
  ) {
    return this.quality.summary(targetType, targetId, this.optionalUserId(req));
  }

  @Public()
  @Get('reviews')
  list(
    @Query('targetType') targetType: string,
    @Query('targetId') targetId: string,
    @Query('take') take?: string,
  ) {
    return this.quality.listReviews(targetType, targetId, take ? Number(take) : 20);
  }

  @Put('reviews')
  upsertReview(@Req() req: AuthedRequest, @Body() dto: UpsertReviewDto) {
    return this.quality.upsertReview(req.user.sub, dto);
  }

  @Delete('reviews/:targetType/:targetId')
  deleteReview(
    @Req() req: AuthedRequest,
    @Param('targetType') targetType: string,
    @Param('targetId') targetId: string,
  ) {
    return this.quality.deleteReview(req.user.sub, targetType, targetId);
  }

  @Put('reactions')
  setReaction(@Req() req: AuthedRequest, @Body() dto: SetReactionDto) {
    return this.quality.setReaction(req.user.sub, dto);
  }

  /** Report abuse or send a suggestion — guests OK with email. */
  @Public()
  @Post('feedback')
  @Throttle({ default: { limit: 8, ttl: 60_000 } })
  createFeedback(@Req() req: AuthedRequest, @Body() dto: CreateFeedbackDto) {
    return this.quality.createFeedback(dto, this.optionalUserId(req));
  }

  @Get('feedback')
  @UseGuards(AdminGuard)
  listFeedback(@Query('status') status?: string, @Query('kind') kind?: string) {
    return this.quality.listFeedback(status, kind);
  }

  @Get('feedback/counts')
  @UseGuards(AdminGuard)
  feedbackCounts() {
    return this.quality.feedbackCounts();
  }

  @Put('feedback/:id')
  @UseGuards(AdminGuard)
  updateFeedback(@Param('id') id: string, @Body() dto: UpdateFeedbackStatusDto) {
    return this.quality.updateFeedbackStatus(id, dto);
  }
}
