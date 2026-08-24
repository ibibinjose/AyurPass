import { ClinicPlan, ClinicSubscriptionStatus } from "@prisma/client";
import { BadRequestException } from "@nestjs/common";
import { ClinicBillingService } from "../clinic-billing.service";

describe("ClinicBillingService", () => {
  const previous = {
    price: process.env.STRIPE_GROWTH_PRICE_ID,
    frontend: process.env.FRONTEND_URL,
    trial: process.env.STRIPE_GROWTH_TRIAL_DAYS,
  };

  afterEach(() => {
    process.env.STRIPE_GROWTH_PRICE_ID = previous.price;
    process.env.FRONTEND_URL = previous.frontend;
    process.env.STRIPE_GROWTH_TRIAL_DAYS = previous.trial;
  });

  const setup = () => {
    const prisma = {
      provider: {
        findUnique: jest.fn().mockResolvedValue({
          id: "provider-1",
          user: { email: "owner@example.com", fullName: "Provider Owner" },
        }),
        update: jest.fn().mockResolvedValue({}),
      },
      clinicSubscription: {
        findUnique: jest.fn().mockResolvedValue(null),
        upsert: jest.fn().mockResolvedValue({ stripeCustomerId: "cus_123" }),
        update: jest.fn().mockResolvedValue({}),
      },
      $transaction: jest.fn().mockResolvedValue([]),
    };
    const stripe = {
      enabled: true,
      createBillingCustomer: jest.fn().mockResolvedValue({ id: "cus_123" }),
      createSubscriptionCheckout: jest
        .fn()
        .mockResolvedValue({
          id: "cs_123",
          url: "https://checkout.stripe.com/c/pay/cs_123",
        }),
      createBillingPortalSession: jest.fn(),
      retrieveSubscription: jest.fn(),
    };
    return {
      prisma,
      stripe,
      service: new ClinicBillingService(prisma as never, stripe as never),
    };
  };

  it("fails closed when a Growth Price ID is absent", async () => {
    delete process.env.STRIPE_GROWTH_PRICE_ID;
    process.env.FRONTEND_URL = "https://ayurpass.com";
    const { service } = setup();

    await expect(
      service.createCheckout(
        "provider-1",
        "https://ayurpass.com/dashboard/payments?billing=success",
        "https://ayurpass.com/dashboard/payments?billing=cancelled",
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("creates an owner-scoped hosted subscription Checkout session from a configured Growth Price ID", async () => {
    process.env.STRIPE_GROWTH_PRICE_ID = "price_growth_monthly";
    process.env.FRONTEND_URL = "https://ayurpass.com";
    process.env.STRIPE_GROWTH_TRIAL_DAYS = "14";
    const { service, stripe } = setup();

    const result = await service.createCheckout(
      "provider-1",
      "https://ayurpass.com/dashboard/payments?billing=success",
      "https://ayurpass.com/dashboard/payments?billing=cancelled",
    );

    expect(result).toEqual({
      url: "https://checkout.stripe.com/c/pay/cs_123",
      sessionId: "cs_123",
    });
    expect(stripe.createBillingCustomer).toHaveBeenCalledWith({
      email: "owner@example.com",
      name: "Provider Owner",
      providerId: "provider-1",
    });
    expect(stripe.createSubscriptionCheckout).toHaveBeenCalledWith(
      expect.objectContaining({
        customerId: "cus_123",
        priceId: "price_growth_monthly",
        providerId: "provider-1",
        trialDays: 14,
      }),
    );
  });

  it("synchronizes Growth access from a completed Stripe Checkout webhook", async () => {
    const { service, prisma, stripe } = setup();
    stripe.retrieveSubscription.mockResolvedValue({
      id: "sub_123",
      customer: "cus_123",
      status: "active",
      cancel_at_period_end: false,
      current_period_end: 1_900_000_000,
      trial_end: null,
      items: { data: [{ price: { id: "price_growth_monthly" } }] },
    });

    const result = await service.handleWebhookEvent({
      type: "checkout.session.completed",
      data: {
        object: {
          mode: "subscription",
          metadata: { product: "ayurpass_growth", providerId: "provider-1" },
          customer: "cus_123",
          subscription: "sub_123",
        },
      },
    } as never);

    expect(result).toEqual({
      handled: true,
      type: "checkout.session.completed",
      providerId: "provider-1",
    });
    expect(prisma.clinicSubscription.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { providerId: "provider-1" },
        create: expect.objectContaining({
          plan: ClinicPlan.GROWTH,
          status: ClinicSubscriptionStatus.ACTIVE,
          stripeSubscriptionId: "sub_123",
        }),
      }),
    );
    expect(prisma.provider.update).toHaveBeenCalledWith({
      where: { id: "provider-1" },
      data: { subscriptionTier: "GROWTH" },
    });
  });
});
