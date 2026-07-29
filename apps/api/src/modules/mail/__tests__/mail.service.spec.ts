import { Test, TestingModule } from '@nestjs/testing';
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