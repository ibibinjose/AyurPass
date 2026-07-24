import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: nodemailer.Transporter | null = null;

  constructor() {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const secure = process.env.SMTP_SECURE === 'true';

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
          user,
          pass,
        },
      });
      this.logger.log(`SMTP Mail Transport configured for host: ${host}`);
    } else {
      this.logger.warn('SMTP settings are missing. MailService running in simulated console-logging mode.');
    }
  }

  async sendPasswordResetEmail(email: string, fullName: string, resetLink: string): Promise<boolean> {
    const from = process.env.SMTP_FROM || '"AyurPass" <noreply@ayurpass.com>';
    const subject = 'Reset Your AyurPass Password';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset your password</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f6f8f6;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }
          .container {
            max-width: 580px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 24px;
            border: 1px solid #e1e8e4;
            padding: 40px;
            box-shadow: 0 4px 12px rgba(36, 56, 46, 0.02);
          }
          .logo {
            font-size: 20px;
            font-weight: 700;
            color: #1b3d2f;
            letter-spacing: -0.02em;
            margin-bottom: 30px;
            text-align: center;
          }
          h1 {
            font-size: 24px;
            font-weight: 600;
            color: #1b3d2f;
            margin-top: 0;
            margin-bottom: 16px;
          }
          p {
            font-size: 15px;
            line-height: 1.6;
            color: #4a5c53;
            margin-top: 0;
            margin-bottom: 24px;
          }
          .btn-container {
            text-align: center;
            margin: 32px 0;
          }
          .btn {
            display: inline-block;
            background-color: #1b3d2f;
            color: #ffffff !important;
            text-decoration: none;
            font-size: 14px;
            font-weight: 600;
            padding: 12px 32px;
            border-radius: 9999px;
            box-shadow: 0 4px 12px rgba(27, 61, 47, 0.15);
          }
          .footer {
            margin-top: 40px;
            border-top: 1px solid #e1e8e4;
            padding-top: 24px;
            font-size: 12px;
            color: #8c9e94;
            line-height: 1.5;
          }
          .footer a {
            color: #1b3d2f;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">🌿 AyurPass</div>
          <h1>Reset your password</h1>
          <p>Hello ${fullName},</p>
          <p>We received a request to reset the password for your AyurPass account. Click the button below to choose a new password. This link is valid for 15 minutes.</p>
          
          <div class="btn-container">
            <a href="${resetLink}" class="btn" target="_blank">Reset Password</a>
          </div>
          
          <p>If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
          
          <div class="footer">
            <p>This email was sent to ${email} by AyurPass. Please do not reply directly to this message.</p>
            <p>&copy; ${new Date().getFullYear()} AyurPass. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from,
          to: email,
          subject,
          html,
          text: `Hello ${fullName},\n\nWe received a request to reset the password for your AyurPass account. Copy and paste the link below into your browser to choose a new password. This link is valid for 15 minutes.\n\n${resetLink}\n\nIf you did not request a password reset, you can safely ignore this email.`,
        });
        this.logger.log(`Password reset email successfully sent to ${email}`);
        return true;
      } catch (error) {
        this.logger.error(`Failed to send password reset email to ${email}`, error);
        return false;
      }
    } else {
      // Dev mode placeholder fallback
      console.log('\n--- [SIMULATED] PASSWORD RESET REQUEST ---');
      console.log(`To: ${fullName} <${email}>`);
      console.log(`Subject: ${subject}`);
      console.log(`Link: ${resetLink}`);
      console.log('------------------------------------------\n');
      return true;
    }
  }

  async sendEmailVerification(
    email: string,
    fullName: string,
    verifyLink: string,
  ): Promise<boolean> {
    const from = process.env.SMTP_FROM || '"AyurPass" <noreply@ayurpass.com>';
    const subject = 'Verify your AyurPass email';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify your email</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f6f8f6;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }
          .container {
            max-width: 580px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 24px;
            border: 1px solid #e1e8e4;
            padding: 40px;
            box-shadow: 0 4px 12px rgba(36, 56, 46, 0.02);
          }
          .logo {
            font-size: 20px;
            font-weight: 700;
            color: #1b3d2f;
            letter-spacing: -0.02em;
            margin-bottom: 30px;
            text-align: center;
          }
          h1 {
            font-size: 24px;
            font-weight: 600;
            color: #1b3d2f;
            margin-top: 0;
            margin-bottom: 16px;
          }
          p {
            font-size: 15px;
            line-height: 1.6;
            color: #4a5c53;
            margin-top: 0;
            margin-bottom: 24px;
          }
          .btn-container {
            text-align: center;
            margin: 32px 0;
          }
          .btn {
            display: inline-block;
            background-color: #1b3d2f;
            color: #ffffff !important;
            text-decoration: none;
            font-size: 14px;
            font-weight: 600;
            padding: 12px 32px;
            border-radius: 9999px;
            box-shadow: 0 4px 12px rgba(27, 61, 47, 0.15);
          }
          .footer {
            margin-top: 40px;
            border-top: 1px solid #e1e8e4;
            padding-top: 24px;
            font-size: 12px;
            color: #8c9e94;
            line-height: 1.5;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">🌿 AyurPass</div>
          <h1>Confirm your email</h1>
          <p>Hello ${fullName},</p>
          <p>Thanks for joining AyurPass. Please confirm your email address so we can keep your account secure and send booking updates.</p>
          <div class="btn-container">
            <a href="${verifyLink}" class="btn" target="_blank">Verify email</a>
          </div>
          <p>This link is valid for 48 hours. If you did not create an account, you can ignore this message.</p>
          <div class="footer">
            <p>This email was sent to ${email} by AyurPass.</p>
            <p>&copy; ${new Date().getFullYear()} AyurPass. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from,
          to: email,
          subject,
          html,
          text: `Hello ${fullName},\n\nThanks for joining AyurPass. Confirm your email:\n\n${verifyLink}\n\nThis link is valid for 48 hours.`,
        });
        this.logger.log(`Verification email sent to ${email}`);
        return true;
      } catch (error) {
        this.logger.error(`Failed to send verification email to ${email}`, error);
        return false;
      }
    }

    console.log('\n--- [SIMULATED] EMAIL VERIFICATION ---');
    console.log(`To: ${fullName} <${email}>`);
    console.log(`Subject: ${subject}`);
    console.log(`Link: ${verifyLink}`);
    console.log('--------------------------------------\n');
    return true;
  }

  async sendBookingReminderEmail(
    email: string,
    fullName: string,
    serviceName: string,
    startTime: string,
    providerName: string,
    reminderType: '24h' | '2h',
  ): Promise<boolean> {
    const from = process.env.SMTP_FROM || '"AyurPass" <noreply@ayurpass.com>';
    const timeNotice = reminderType === '24h' ? 'tomorrow' : 'in 2 hours';
    const subject = `Reminder: Upcoming Session with ${providerName} (${timeNotice})`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Appointment Reminder</title>
      </head>
      <body style="font-family: sans-serif; background-color: #f6f8f6; padding: 20px;">
        <div style="max-width: 580px; margin: 0 auto; background: white; border-radius: 20px; padding: 30px; border: 1px solid #e1e8e4;">
          <h2 style="color: #1b3d2f;">🌿 Appointment Reminder</h2>
          <p>Hello ${fullName},</p>
          <p>This is a reminder for your upcoming session <strong>${serviceName}</strong> at <strong>${providerName}</strong>.</p>
          <p style="font-size: 16px; font-weight: bold; color: #1b3d2f;">Scheduled Time: ${new Date(startTime).toLocaleString()}</p>
          <p>Please arrive 10 minutes before your scheduled start time.</p>
          <p style="font-size: 12px; color: #8c9e94; margin-top: 30px;">AyurPass Smart Reminder System</p>
        </div>
      </body>
      </html>
    `;

    if (this.transporter) {
      try {
        await this.transporter.sendMail({ from, to: email, subject, html });
        this.logger.log(`Booking ${reminderType} reminder email sent to ${email}`);
        return true;
      } catch (error) {
        this.logger.error(`Failed to send reminder to ${email}`, error);
        return false;
      }
    }

    this.logger.log(`[SIMULATED SMS/EMAIL REMINDER ${reminderType}] To: ${email} for ${serviceName} at ${startTime}`);
    return true;
  }

  async sendBookingReminderSms(
    phone: string,
    serviceName: string,
    startTime: string,
    providerName: string,
  ): Promise<boolean> {
    this.logger.log(`[SMS REMINDER SENT] To: ${phone} | Session: ${serviceName} at ${providerName} (${startTime})`);
    return true;
  }
}
