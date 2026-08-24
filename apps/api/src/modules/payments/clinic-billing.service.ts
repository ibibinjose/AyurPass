import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ClinicPlan, ClinicSubscriptionStatus, Prisma } from "@prisma/client";
import type Stripe from "stripe";
import { PrismaService } from "../../prisma/prisma.service";
import { StripeService } from "./stripe.service";

const GROWTH_PRODUCT = "ayurpass_growth";
const PROVISIONED_STATUSES = new Set<ClinicSubscriptionStatus>([
  ClinicSubscriptionStatus.TRIALING,
  ClinicSubscriptionStatus.ACTIVE,
  ClinicSubscriptionStatus.PAST_DUE,
]);

type SubscriptionRef = string | Stripe.Subscription | null | undefined;
type CustomerRef =
  string | Stripe.Customer | Stripe.DeletedCustomer | null | undefined;

@Injectable()
export class ClinicBillingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stripe: StripeService,
  ) {}

  get platformConfigured(): boolean {
    return this.stripe.enabled && Boolean(this.growthPriceId(false));
  }

  async getSubscription(providerId: string) {
    const subscription = await this.prisma.clinicSubscription.findUnique({
      where: { providerId },
    });
    return {
      configured: this.platformConfigured,
      priceConfigured: Boolean(this.growthPriceId(false)),
      plan: subscription?.plan ?? ClinicPlan.FREE,
      status: subscription?.status ?? ClinicSubscriptionStatus.INACTIVE,
      cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd ?? false,
      currentPeriodEnd: subscription?.currentPeriodEnd ?? null,
      trialEnd: subscription?.trialEnd ?? null,
      portalAvailable: Boolean(
        subscription?.stripeCustomerId && this.stripe.enabled,
      ),
    };
  }

  async createCheckout(
    providerId: string,
    successUrl: string,
    cancelUrl: string,
  ) {
    this.assertBillingUrl(successUrl, "successUrl");
    this.assertBillingUrl(cancelUrl, "cancelUrl");
    const priceId = this.growthPriceId(true)!;
    const provider = await this.prisma.provider.findUnique({
      where: { id: providerId },
      include: { user: { select: { email: true, fullName: true } } },
    });
    if (!provider) throw new NotFoundException("Provider not found");
    if (!provider.user?.email) {
      throw new BadRequestException(
        "The practice owner needs a verified account email before starting billing",
      );
    }

    const existing = await this.prisma.clinicSubscription.findUnique({
      where: { providerId },
    });
    if (existing && PROVISIONED_STATUSES.has(existing.status)) {
      throw new BadRequestException(
        "Growth is already active for this practice. Use Manage billing instead.",
      );
    }

    const customerId = await this.ensureCustomer(
      providerId,
      provider.user.email,
      provider.user.fullName,
    );
    const session = await this.stripe.createSubscriptionCheckout({
      customerId,
      priceId,
      successUrl,
      cancelUrl,
      providerId,
      trialDays: this.trialDays(),
      idempotencyKey: `growth-checkout:${providerId}:${priceId}`,
    });
    if (!session.url)
      throw new BadRequestException("Stripe did not return a checkout URL");
    return { url: session.url, sessionId: session.id };
  }

  async createPortal(providerId: string, returnUrl: string) {
    this.assertBillingUrl(returnUrl, "returnUrl");
    if (!this.stripe.enabled) {
      throw new BadRequestException("Stripe Billing is not configured");
    }
    const subscription = await this.prisma.clinicSubscription.findUnique({
      where: { providerId },
    });
    if (!subscription?.stripeCustomerId) {
      throw new BadRequestException(
        "No Stripe Billing customer exists for this practice",
      );
    }
    const session = await this.stripe.createBillingPortalSession({
      customerId: subscription.stripeCustomerId,
      returnUrl,
    });
    return { url: session.url };
  }

  async handleWebhookEvent(
    event: Stripe.Event,
  ): Promise<{ handled: boolean; type: string; providerId?: string }> {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      if (
        session.mode !== "subscription" ||
        session.metadata?.product !== GROWTH_PRODUCT
      ) {
        return { handled: false, type: event.type };
      }
      const providerId =
        session.metadata.providerId ?? session.client_reference_id;
      const customerId = this.customerIdOf(session.customer);
      const subscriptionId = this.subscriptionIdOf(session.subscription);
      if (!providerId || !customerId || !subscriptionId) {
        return { handled: false, type: event.type };
      }
      const subscription =
        await this.stripe.retrieveSubscription(subscriptionId);
      await this.persistSubscription(providerId, customerId, subscription);
      return { handled: true, type: event.type, providerId };
    }

    if (event.type.startsWith("customer.subscription.")) {
      const subscription = event.data.object as Stripe.Subscription;
      const providerId =
        subscription.metadata?.providerId ??
        (await this.providerIdForSubscription(subscription.id));
      if (
        !providerId ||
        (subscription.metadata?.product &&
          subscription.metadata.product !== GROWTH_PRODUCT)
      ) {
        return { handled: false, type: event.type };
      }
      const customerId = this.customerIdOf(subscription.customer);
      if (!customerId) return { handled: false, type: event.type };
      await this.persistSubscription(providerId, customerId, subscription);
      return { handled: true, type: event.type, providerId };
    }

    if (
      event.type === "invoice.paid" ||
      event.type === "invoice.payment_failed" ||
      event.type === "invoice.finalization_failed"
    ) {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = this.invoiceSubscriptionId(invoice);
      if (!subscriptionId) return { handled: false, type: event.type };
      const existing = await this.prisma.clinicSubscription.findUnique({
        where: { stripeSubscriptionId: subscriptionId },
      });
      if (!existing) return { handled: false, type: event.type };
      await this.prisma.clinicSubscription.update({
        where: { id: existing.id },
        data: {
          lastInvoiceId: invoice.id,
          lastInvoiceStatus: invoice.status ?? event.type,
          ...(event.type === "invoice.payment_failed"
            ? { status: ClinicSubscriptionStatus.PAST_DUE }
            : {}),
        },
      });
      return {
        handled: true,
        type: event.type,
        providerId: existing.providerId,
      };
    }

    return { handled: false, type: event.type };
  }

  private async ensureCustomer(
    providerId: string,
    email: string,
    name?: string | null,
  ): Promise<string> {
    const existing = await this.prisma.clinicSubscription.findUnique({
      where: { providerId },
    });
    if (existing?.stripeCustomerId) return existing.stripeCustomerId;

    const customer = await this.stripe.createBillingCustomer({
      email,
      name,
      providerId,
    });
    try {
      const record = await this.prisma.clinicSubscription.upsert({
        where: { providerId },
        create: { providerId, stripeCustomerId: customer.id },
        update: { stripeCustomerId: customer.id },
      });
      return record.stripeCustomerId;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        const raced = await this.prisma.clinicSubscription.findUnique({
          where: { providerId },
        });
        if (raced?.stripeCustomerId) return raced.stripeCustomerId;
      }
      throw error;
    }
  }

  private async persistSubscription(
    providerId: string,
    stripeCustomerId: string,
    subscription: Stripe.Subscription,
  ): Promise<void> {
    const status = this.subscriptionStatus(subscription.status);
    const priceId = subscription.items.data[0]?.price?.id ?? null;
    const periodEnd = this.periodEndOf(subscription);
    const trialEnd = subscription.trial_end
      ? new Date(subscription.trial_end * 1000)
      : null;
    const plan = PROVISIONED_STATUSES.has(status)
      ? ClinicPlan.GROWTH
      : ClinicPlan.FREE;

    await this.prisma.$transaction([
      this.prisma.clinicSubscription.upsert({
        where: { providerId },
        create: {
          providerId,
          stripeCustomerId,
          stripeSubscriptionId: subscription.id,
          stripePriceId: priceId,
          plan,
          status,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          currentPeriodEnd: periodEnd,
          trialEnd,
        },
        update: {
          stripeCustomerId,
          stripeSubscriptionId: subscription.id,
          stripePriceId: priceId,
          plan,
          status,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          currentPeriodEnd: periodEnd,
          trialEnd,
        },
      }),
      this.prisma.provider.update({
        where: { id: providerId },
        data: {
          subscriptionTier: plan === ClinicPlan.GROWTH ? "GROWTH" : "FREE",
        },
      }),
    ]);
  }

  private growthPriceId(required: boolean): string | null {
    const value = process.env.STRIPE_GROWTH_PRICE_ID?.trim() ?? "";
    const configured =
      value.startsWith("price_") &&
      !value.endsWith("...") &&
      !value.includes("REPLACE");
    if (!configured && required) {
      throw new BadRequestException(
        "Stripe Billing is not configured. Set STRIPE_GROWTH_PRICE_ID to the live Growth monthly Price ID.",
      );
    }
    return configured ? value : null;
  }

  private trialDays(): number | undefined {
    const value = process.env.STRIPE_GROWTH_TRIAL_DAYS?.trim();
    if (!value) return undefined;
    const days = Number(value);
    if (!Number.isInteger(days) || days < 1 || days > 90) {
      throw new BadRequestException(
        "STRIPE_GROWTH_TRIAL_DAYS must be a whole number from 1 to 90",
      );
    }
    return days;
  }

  private assertBillingUrl(value: string, field: string): void {
    try {
      const url = new URL(value);
      const configuredFrontend = process.env.FRONTEND_URL?.trim();
      if (configuredFrontend) {
        const allowed = new URL(configuredFrontend);
        if (url.origin !== allowed.origin) {
          throw new Error("unexpected origin");
        }
      } else if (url.hostname !== "localhost") {
        throw new Error("frontend origin is not configured");
      }
      if (url.protocol !== "https:" && url.hostname !== "localhost") {
        throw new Error("unsupported protocol");
      }
    } catch {
      throw new BadRequestException(
        `${field} must use the configured frontend origin`,
      );
    }
  }

  private subscriptionStatus(
    status: Stripe.Subscription.Status,
  ): ClinicSubscriptionStatus {
    const mapped: Record<Stripe.Subscription.Status, ClinicSubscriptionStatus> =
      {
        active: ClinicSubscriptionStatus.ACTIVE,
        canceled: ClinicSubscriptionStatus.CANCELLED,
        incomplete: ClinicSubscriptionStatus.INCOMPLETE,
        incomplete_expired: ClinicSubscriptionStatus.INCOMPLETE_EXPIRED,
        past_due: ClinicSubscriptionStatus.PAST_DUE,
        paused: ClinicSubscriptionStatus.PAUSED,
        trialing: ClinicSubscriptionStatus.TRIALING,
        unpaid: ClinicSubscriptionStatus.UNPAID,
      };
    return mapped[status] ?? ClinicSubscriptionStatus.INACTIVE;
  }

  private customerIdOf(ref: CustomerRef): string | null {
    if (!ref) return null;
    return typeof ref === "string" ? ref : ref.id;
  }

  private subscriptionIdOf(ref: SubscriptionRef): string | null {
    if (!ref) return null;
    return typeof ref === "string" ? ref : ref.id;
  }

  private invoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
    const legacy = (
      invoice as Stripe.Invoice & { subscription?: SubscriptionRef }
    ).subscription;
    if (legacy) return this.subscriptionIdOf(legacy);
    const parent = (
      invoice as Stripe.Invoice & {
        parent?: {
          subscription_details?: { subscription?: SubscriptionRef } | null;
        } | null;
      }
    ).parent;
    return this.subscriptionIdOf(parent?.subscription_details?.subscription);
  }

  private periodEndOf(subscription: Stripe.Subscription): Date | null {
    const timestamp = (
      subscription as Stripe.Subscription & { current_period_end?: number }
    ).current_period_end;
    return timestamp ? new Date(timestamp * 1000) : null;
  }

  private async providerIdForSubscription(
    subscriptionId: string,
  ): Promise<string | null> {
    const record = await this.prisma.clinicSubscription.findUnique({
      where: { stripeSubscriptionId: subscriptionId },
      select: { providerId: true },
    });
    return record?.providerId ?? null;
  }
}
