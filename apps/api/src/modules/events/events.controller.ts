import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { EventCategory } from '@prisma/client';
import { EventsService } from './events.service';
import {
  CreateEventDto,
  RegisterEventDto,
  UpdateEventDto,
} from '../../dtos/event.dto';
import { Public } from '../../common/public.decorator';
import { AuthedRequest } from '../../common/jwt-auth.guard';

@Controller('events')
export class EventsController {
  constructor(private readonly events: EventsService) {}

  @Public()
  @Get()
  findAll(
    @Query('q') q?: string,
    @Query('category') category?: EventCategory,
    @Query('city') city?: string,
    @Query('country') country?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('free') free?: string,
    @Query('providerId') providerId?: string,
  ) {
    return this.events.findPublic({
      q,
      category,
      city,
      country,
      from,
      to,
      free: free === '1' || free === 'true',
      providerId,
    });
  }

  @Get('mine')
  listMine(@Req() req: AuthedRequest) {
    return this.events.listMine(req.user.sub);
  }

  @Get('tickets/mine')
  myTickets(@Req() req: AuthedRequest) {
    return this.events.myTickets(req.user.sub);
  }

  @Public()
  @Get('slug/:slug')
  bySlug(@Param('slug') slug: string) {
    return this.events.findBySlug(slug);
  }

  @Public()
  @Get(':id')
  byId(@Param('id') id: string) {
    return this.events.findById(id);
  }

  @Post()
  create(@Req() req: AuthedRequest, @Body() dto: CreateEventDto) {
    return this.events.create(req.user.sub, dto);
  }

  @Put(':id')
  @Patch(':id')
  update(
    @Req() req: AuthedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateEventDto,
  ) {
    return this.events.update(req.user.sub, id, dto);
  }

  @Delete(':id')
  remove(@Req() req: AuthedRequest, @Param('id') id: string) {
    return this.events.remove(req.user.sub, id);
  }

  @Post(':id/register')
  register(
    @Req() req: AuthedRequest,
    @Param('id') id: string,
    @Body() dto: RegisterEventDto,
  ) {
    return this.events.register(req.user.sub, id, dto);
  }

  @Get(':id/tickets')
  listTickets(@Req() req: AuthedRequest, @Param('id') id: string) {
    return this.events.listEventTickets(req.user.sub, id);
  }

  @Post('tickets/:ticketId/cancel')
  cancelTicket(@Req() req: AuthedRequest, @Param('ticketId') ticketId: string) {
    return this.events.cancelTicket(req.user.sub, ticketId);
  }
}
