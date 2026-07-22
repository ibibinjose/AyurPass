import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { StripeService } from './stripe.service';
import { PaymentSettlementService } from './payment-settlement.service';

@Injectable()
export class StripeConnectService {
  constructor(
    private prisma: PrismaService,
    private stripe: StripeService,
    private settlement: PaymentSettlementService,
  ) {}

  async connectOnboard(providerId: string, returnUrl: string, refreshUrl: string) {
    const provider = await this.prisma.provider.findUnique({
      where: { id: providerId },
      include: { user: { select: { email: true } } },
    });
    if (!provider) throw new NotFoundException('Provider not found');

    let accountId = provider.stripeAccountId;
    if (!accountId) {
      if (this.settlement.mockMode) {
        accountId = `acct_test_${randomUUID().replace(/-/g, '').slice(0, 16)}`;
        await this.prisma.provider.update({
          where: { id: providerId },
          data: { stripeAccountId: accountId },
        });
        return {
          mock: true,
          url: returnUrl,
          accountId,
          message: 'Mock Connect — add live Stripe keys to enable real onboarding',
        };
      }

      const account = await this.stripe.createConnectAccount({
        email: provider.user?.email ?? 'provider@ayurpass.com',
        businessName: provider.businessName,
      });
      accountId = account.id;
      await this.prisma.provider.update({
        where: { id: providerId },
        data: { stripeAccountId: accountId },
      });
    }

    if (this.settlement.mockMode) {
      return { mock: true, url: returnUrl, accountId };
    }

    const link = await this.stripe.createAccountLink(accountId, returnUrl, refreshUrl);
    return { mock: false, url: link.url, accountId };
  }

  async connectStatus(providerId: string) {
    const provider = await this.prisma.provider.findUnique({
      where: { id: providerId },
      select: { stripeAccountId: true },
    });
    if (!provider) throw new NotFoundException('Provider not found');

    if (!provider.stripeAccountId) {
      return {
        mock: this.settlement.mockMode,
        connected: false,
        chargesEnabled: false,
        payoutsEnabled: false,
        detailsSubmitted: false,
        accountId: null,
      };
    }

    if (this.settlement.mockMode || provider.stripeAccountId.startsWith('acct_test_')) {
      await this.syncStripeIntegration(providerId, provider.stripeAccountId, true);
      return {
        mock: true,
        connected: true,
        chargesEnabled: true,
        payoutsEnabled: true,
        detailsSubmitted: true,
        accountId: provider.stripeAccountId,
      };
    }

    const account = await this.stripe.retrieveAccount(provider.stripeAccountId);
    const connected = Boolean(account.charges_enabled && account.payouts_enabled);
    await this.syncStripeIntegration(providerId, provider.stripeAccountId, connected);
    return {
      mock: false,
      connected,
      chargesEnabled: Boolean(account.charges_enabled),
      payoutsEnabled: Boolean(account.payouts_enabled),
      detailsSubmitted: Boolean(account.details_submitted),
      accountId: provider.stripeAccountId,
    };
  }

  getPlatformConfig() {
    const secret = process.env.STRIPE_SECRET_KEY ?? '';
    const publishable = process.env.STRIPE_PUBLISHABLE_KEY ?? '';
    const webhook = process.env.STRIPE_WEBHOOK_SECRET ?? '';
    const placeholder = (v: string) => !v || v.endsWith('...') || v.includes('REPLACE');

    return {
      provider: 'stripe',
      mock: this.settlement.mockMode,
      publishableKey: placeholder(publishable) ? null : publishable,
      keysConfigured: !placeholder(secret) && !placeholder(publishable),
      webhookConfigured: !placeholder(webhook),
      connectEnabled: !this.settlement.mockMode,
      frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    };
  }

  async syncStripeIntegration(providerId: string, accountId: string, connected: boolean) {
    await this.prisma.integration.upsert({
      where: { providerId_type: { providerId, type: 'STRIPE_PAYMENTS' } },
      create: {
        providerId,
        type: 'STRIPE_PAYMENTS',
        status: connected ? 'connected' : 'disconnected',
        externalAccountId: accountId,
        connectedAt: connected ? new Date() : undefined,
      },
      update: {
        status: connected ? 'connected' : 'disconnected',
        externalAccountId: accountId,
        connectedAt: connected ? new Date() : null,
      },
    });
  }
}