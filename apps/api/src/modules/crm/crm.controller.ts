import { Controller, Get, Post, Put, Delete, Param, Body, Req } from '@nestjs/common';
import { CrmService } from './crm.service';
import { AuthedRequest } from '../../common/jwt-auth.guard';
import { assertProviderAccess } from '../../common/ownership';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('crm')
export class CrmController {
  constructor(
    private readonly service: CrmService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('provider/:providerId')
  async getClients(@Param('providerId') providerId: string, @Req() req: AuthedRequest) {
    await assertProviderAccess(this.prisma, req.user, providerId);
    return this.service.getClientsForProvider(providerId);
  }

  @Get('provider/:providerId/client/:consumerId')
  async getClientDetail(
    @Param('providerId') providerId: string,
    @Param('consumerId') consumerId: string,
    @Req() req: AuthedRequest,
  ) {
    await assertProviderAccess(this.prisma, req.user, providerId);
    return this.service.getClientDetail(providerId, consumerId);
  }

  @Put('provider/:providerId/client/:consumerId')
  async updateClient(
    @Param('providerId') providerId: string,
    @Param('consumerId') consumerId: string,
    @Body() body: { tags?: string[]; customFields?: any; status?: string },
    @Req() req: AuthedRequest,
  ) {
    await assertProviderAccess(this.prisma, req.user, providerId);
    return this.service.updateClientRecord(providerId, consumerId, body);
  }

  @Post('provider/:providerId/client/:consumerId/notes')
  async addNote(
    @Param('providerId') providerId: string,
    @Param('consumerId') consumerId: string,
    @Body() body: { note: string },
    @Req() req: AuthedRequest,
  ) {
    await assertProviderAccess(this.prisma, req.user, providerId);
    return this.service.addNote(providerId, consumerId, req.user.sub, body.note);
  }

  @Delete('notes/:noteId')
  async deleteNote(@Param('noteId') noteId: string, @Req() req: AuthedRequest) {
    // Delete note requires checking provider access for the note's record
    const note = await this.prisma.clientNote.findUnique({
      where: { id: noteId },
      include: { clientRecord: true },
    });
    if (!note) return;
    await assertProviderAccess(this.prisma, req.user, note.clientRecord.providerId);
    return this.service.deleteNote(noteId);
  }

  @Post('provider/:providerId/campaign')
  async sendCampaign(
    @Param('providerId') providerId: string,
    @Body() body: { subject: string; body: string },
    @Req() req: AuthedRequest,
  ) {
    await assertProviderAccess(this.prisma, req.user, providerId);
    return this.service.sendEmailCampaign(providerId, body.subject, body.body);
  }
}
