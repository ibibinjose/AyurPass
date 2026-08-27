import { Test, TestingModule } from '@nestjs/testing';
import * as nodemailer from 'nodemailer';
import { MailService } from '../mail.service';

describe('MailService', () => {
  let service: MailService;

  describe('without SMTP configured (default)', () => {
    beforeEach(async () => {
      delete process.env.SMTP_HOST;
      delete process.env.SMTP_USER;
      delete process.env.SMTP_PASS;
      const module: TestingModule = await Test.createTestingModule({ providers: [MailService] }).compile();
      service = module.get<MailService>(MailService);
    });

    describe('sendPasswordResetEmail', () => {
      it('should return true and log warning without SMTP', async () => {
        const result = await service.sendPasswordResetEmail(
          'test@example.com',
          'Test User',
          'https://example.com/reset',
        );
        expect(result).toBe(true);
      });
    });

    describe('sendEmailVerification', () => {
      it('should return true without SMTP', async () => {
        const result = await service.sendEmailVerification(
          'test@example.com',
          'Test User',
          'https://example.com/verify',
        );
        expect(result).toBe(true);
      });
    });

    describe('sendBookingReminderEmail', () => {
      it('should return true', async () => {
        const result = await service.sendBookingReminderEmail(
          'test@example.com',
          'Test User',
          'Massage',
          new Date().toISOString(),
          'Spa',
          '24h',
        );
        expect(result).toBe(true);
      });
    });

    describe('sendBookingReminderSms', () => {
      it('should return true', async () => {
        const result = await service.sendBookingReminderSms(
          '+1234567890',
          'Massage',
          new Date().toISOString(),
          'Spa',
        );
        expect(result).toBe(true);
      });
    });
  });

  describe('with SMTP configured', () => {
    afterEach(() => {
      delete process.env.SMTP_HOST;
      delete process.env.SMTP_USER;
      delete process.env.SMTP_PASS;
      delete process.env.NEXT_PUBLIC_SITE_URL;
      jest.restoreAllMocks();
    });

    it('includes the canonical brand header and text fallback in critical emails', async () => {
      const sendMail = jest.fn().mockResolvedValue({ messageId: 'message-1' });
      jest.spyOn(nodemailer, 'createTransport').mockReturnValue({ sendMail } as unknown as nodemailer.Transporter);
      process.env.SMTP_HOST = 'smtp.example.com';
      process.env.SMTP_USER = 'user';
      process.env.SMTP_PASS = 'pass';
      process.env.NEXT_PUBLIC_SITE_URL = 'https://staging.ayurpass.com';
      const module: TestingModule = await Test.createTestingModule({ providers: [MailService] }).compile();
      const svc = module.get<MailService>(MailService);

      await expect(svc.sendPasswordResetEmail('test@example.com', 'Test User', 'https://example.com/reset')).resolves.toBe(true);
      await expect(svc.sendEmailVerification('test@example.com', 'Test User', 'https://example.com/verify')).resolves.toBe(true);
      await expect(
        svc.sendBookingReminderEmail('test@example.com', 'Test User', 'Abhyanga', '2026-08-28T09:00:00.000Z', 'Local Wellness Studio', '24h'),
      ).resolves.toBe(true);

      expect(sendMail).toHaveBeenCalledTimes(3);
      for (const message of sendMail.mock.calls.map(([input]) => input)) {
        expect(message.html).toContain('https://staging.ayurpass.com/brand/ayurpass-botanical-a-mark.png');
        expect(message.html).toContain('Ayur<span style="color:#a67a24;">Pass</span>');
        expect(message.text).toContain('AyurPass');
      }
    });

    it('should attempt to send email when SMTP is configured', async () => {
      process.env.SMTP_HOST = 'smtp.example.com';
      process.env.SMTP_USER = 'user';
      process.env.SMTP_PASS = 'pass';
      const module: TestingModule = await Test.createTestingModule({ providers: [MailService] }).compile();
      const svc = module.get<MailService>(MailService);

      const result = await svc.sendEmailVerification('test@example.com', 'Test', 'http://link');

      expect(result).toBe(false);
    });
  });
});