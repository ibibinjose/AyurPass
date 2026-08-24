import { Injectable, BadRequestException } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly stripe: Stripe | null;

  constructor() {
    const key = process.env.STRIPE_SECRET_KEY ?? '';
    this.stripe =
      key && !key.endsWith('...')
        ? new Stripe(key, { apiVersion: '2025-02-24.acacia' })
        : null;
  }

  get enabled(): boolean {
    return this.stripe !== null;
  }

  get publishableKey(): string | null {
    const key = process.env.STRIPE_PUBLISHABLE_KEY ?? '';
    return key && !key.endsWith('...') ? key : null;
  }

  private client(): Stripe {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured — running in mock payment mode');
    }
    return this.stripe;
  }

  async createConnectAccount(params: {
    email: string;
    businessName: string;
    country?: string;
  }): Promise<Stripe.Account> {
    return this.client().accounts.create({
      type: 'express',
      country: params.country ?? 'AU',
      email: params.email,
      business_profile: { name: params.businessName },
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });
  }

  async createAccountLink(
    accountId: string,
    returnUrl: string,
    refreshUrl: string,
  ): Promise<Stripe.AccountLink> {
    return this.client().accountLinks.create({
      account: accountId,
      return_url: returnUrl,
      refresh_url: refreshUrl,
      type: 'account_onboarding',
    });
  }

  async retrieveAccount(accountId: string): Promise<Stripe.Account> {
    return this.client().accounts.retrieve(accountId);
  }

  async createPaymentIntent(params: {
    amountCents: number;
    currency: string;
    destinationAccountId: string;
    applicationFeeCents: number;
    metadata: Record<string, string>;
    idempotencyKey?: string;
  }): Promise<Stripe.PaymentIntent> {
    return this.client().paymentIntents.create(
      {
        amount: params.amountCents,
        currency: params.currency.toLowerCase(),
        automatic_payment_methods: { enabled: true },
        application_fee_amount: params.applicationFeeCents,
        transfer_data: { destination: params.destinationAccountId },
        metadata: params.metadata,
      },
      params.idempotencyKey ? { idempotencyKey: params.idempotencyKey } : undefined,
    );
  }

  async retrievePaymentIntent(id: string): Promise<Stripe.PaymentIntent> {
    return this.client().paymentIntents.retrieve(id);
  }

  async createBillingCustomer(params: {
    email: string;
    name?: string | null;
    providerId: string;
  }): Promise<Stripe.Customer> {
    return this.client().customers.create({
      email: params.email,
      name: params.name ?? undefined,
      metadata: { providerId: params.providerId, product: 'ayurpass_growth' },
    });
  }

  async createSubscriptionCheckout(params: {
    customerId: string;
    priceId: string;
    successUrl: string;
    cancelUrl: string;
    providerId: string;
    trialDays?: number;
    idempotencyKey: string;
  }): Promise<Stripe.Checkout.Session> {
    return this.client().checkout.sessions.create(
      {
        mode: 'subscription',
        customer: params.customerId,
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        line_items: [{ price: params.priceId, quantity: 1 }],
        allow_promotion_codes: true,
        billing_address_collection: 'required',
        automatic_tax: { enabled: false },
        client_reference_id: params.providerId,
        metadata: { providerId: params.providerId, product: 'ayurpass_growth' },
        subscription_data: {
          metadata: { providerId: params.providerId, product: 'ayurpass_growth' },
          ...(params.trialDays && params.trialDays > 0 ? { trial_period_days: params.trialDays } : {}),
        },
      },
      { idempotencyKey: params.idempotencyKey },
    );
  }

  async createBillingPortalSession(params: {
    customerId: string;
    returnUrl: string;
  }): Promise<Stripe.BillingPortal.Session> {
    return this.client().billingPortal.sessions.create({
      customer: params.customerId,
      return_url: params.returnUrl,
    });
  }

  async retrieveSubscription(id: string): Promise<Stripe.Subscription> {
    return this.client().subscriptions.retrieve(id);
  }

  /**
   * Refund a destination-charge PaymentIntent. `reverse_transfer` pulls the
   * refunded amount back out of the connected account (otherwise the platform
   * eats the full refund while the provider keeps their cut); `refund_application_fee`
   * returns our platform commission proportionally.
   */
  async refundPaymentIntent(
    paymentIntentId: string,
    idempotencyKey?: string,
  ): Promise<Stripe.Refund> {
    return this.client().refunds.create(
      {
        payment_intent: paymentIntentId,
        reverse_transfer: true,
        refund_application_fee: true,
      },
      idempotencyKey ? { idempotencyKey } : undefined,
    );
  }

  constructWebhookEvent(payload: Buffer, signature: string): Stripe.Event {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) {
      throw new BadRequestException('STRIPE_WEBHOOK_SECRET is not configured');
    }
    return this.client().webhooks.constructEvent(payload, signature, secret);
  }
}