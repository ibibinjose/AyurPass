import { PrismaService } from '../prisma/prisma.service';

export interface AccessAuditInput {
  consumerId: string;
  accessorId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  purpose?: string;
  ipAddress?: string;
}

/** Records sensitive health-data reads for compliance (AccessAuditLog). */
export async function logAccess(
  prisma: PrismaService,
  input: AccessAuditInput,
): Promise<void> {
  await prisma.accessAuditLog.create({
    data: {
      consumerId: input.consumerId,
      accessorId: input.accessorId,
      action: input.action,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      purpose: input.purpose,
      ipAddress: input.ipAddress,
    },
  });
}