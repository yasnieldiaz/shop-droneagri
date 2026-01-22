import nodemailer from 'nodemailer';
import { getPrisma } from '@/lib/db/prisma';

interface EmailConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  fromName: string;
  fromEmail: string;
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function getEmailConfig(): Promise<EmailConfig | null> {
  const prisma = await getPrisma();

  const settings = await prisma.settings.findMany({
    where: {
      key: {
        in: ['smtp_host', 'smtp_port', 'smtp_user', 'smtp_password', 'smtp_from_name', 'smtp_from_email']
      }
    }
  });

  const config: Record<string, string> = {};
  settings.forEach(s => {
    config[s.key] = s.value;
  });

  if (!config.smtp_host || !config.smtp_user || !config.smtp_password) {
    return null;
  }

  return {
    host: config.smtp_host || 'smtp.gmail.com',
    port: parseInt(config.smtp_port || '587'),
    user: config.smtp_user,
    password: config.smtp_password,
    fromName: config.smtp_from_name || 'DroneAgri.pl',
    fromEmail: config.smtp_from_email || config.smtp_user,
  };
}

export async function createTransporter() {
  const config = await getEmailConfig();

  if (!config) {
    throw new Error('Email not configured');
  }

  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: {
      user: config.user,
      pass: config.password,
    },
  });
}

export async function sendEmail(options: SendEmailOptions): Promise<{ success: boolean; error?: string }> {
  try {
    const config = await getEmailConfig();

    if (!config) {
      return { success: false, error: 'Email not configured' };
    }

    const transporter = await createTransporter();

    const result = await transporter.sendMail({
      from: `"${config.fromName}" <${config.fromEmail}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    console.log('Email sent:', result.messageId);
    return { success: true };
  } catch (error) {
    console.error('Email error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email'
    };
  }
}

export async function sendTestEmail(to: string): Promise<{ success: boolean; error?: string }> {
  return sendEmail({
    to,
    subject: 'Test Email from DroneAgri.pl',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc2626;">Test Email</h1>
        <p>This is a test email from your DroneAgri.pl store.</p>
        <p>If you received this email, your SMTP configuration is working correctly!</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="color: #6b7280; font-size: 12px;">
          Sent from DroneAgri.pl Admin Panel
        </p>
      </div>
    `,
    text: 'This is a test email from your DroneAgri.pl store. If you received this email, your SMTP configuration is working correctly!',
  });
}

export async function sendOrderConfirmationEmail(
  to: string,
  orderNumber: string,
  customerName: string,
  total: string
): Promise<{ success: boolean; error?: string }> {
  return sendEmail({
    to,
    subject: `Order Confirmation - ${orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc2626;">Order Confirmed!</h1>
        <p>Dear ${customerName},</p>
        <p>Thank you for your order. We have received your order and will process it shortly.</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Order Number:</strong> ${orderNumber}</p>
          <p style="margin: 10px 0 0;"><strong>Total:</strong> ${total}</p>
        </div>
        <p>You will receive another email when your order has been shipped.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="color: #6b7280; font-size: 12px;">
          Thank you for shopping with DroneAgri.pl
        </p>
      </div>
    `,
  });
}

interface B2BWelcomeEmailData {
  companyName: string;
  contactName: string;
  email: string;
  region: 'POLAND' | 'EU';
}

export async function sendB2BWelcomeEmail(
  to: string,
  data: B2BWelcomeEmailData
): Promise<{ success: boolean; error?: string }> {
  const isPL = data.region === 'POLAND';

  const subject = isPL
    ? 'Witamy w XAG Polska B2B - Twoje konto zostało aktywowane'
    : 'Welcome to XAG Polska B2B - Your account has been activated';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header with gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 40px 40px 30px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                      XAG Polska
                    </h1>
                    <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px; font-weight: 500;">
                      B2B Partner Program
                    </p>
                  </td>
                  <td align="right" style="vertical-align: top;">
                    <div style="background: rgba(255,255,255,0.2); border-radius: 12px; padding: 12px 16px;">
                      <span style="color: #ffffff; font-size: 24px;">🚁</span>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Welcome Badge -->
          <tr>
            <td align="center" style="padding: 0;">
              <div style="background: #fef2f2; margin: -20px 40px 0; padding: 16px 24px; border-radius: 12px; border: 2px solid #fecaca; display: inline-block;">
                <span style="color: #dc2626; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                  ✓ ${isPL ? 'Konto Aktywowane' : 'Account Activated'}
                </span>
              </div>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 8px; color: #111827; font-size: 24px; font-weight: 600;">
                ${isPL ? 'Witaj' : 'Welcome'}, ${data.contactName}!
              </h2>
              <p style="margin: 0 0 24px; color: #6b7280; font-size: 16px; line-height: 1.6;">
                ${isPL
                  ? `Cieszymy się, że ${data.companyName} dołącza do grona naszych partnerów B2B.`
                  : `We're excited to have ${data.companyName} join our B2B partner network.`
                }
              </p>

              <!-- Benefits Box -->
              <div style="background: #f9fafb; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                <h3 style="margin: 0 0 16px; color: #111827; font-size: 16px; font-weight: 600;">
                  ${isPL ? '🎁 Twoje korzyści B2B' : '🎁 Your B2B Benefits'}
                </h3>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="padding: 8px 0;">
                      <table role="presentation" cellspacing="0" cellpadding="0">
                        <tr>
                          <td style="width: 32px; vertical-align: top;">
                            <div style="background: #dcfce7; width: 24px; height: 24px; border-radius: 50%; text-align: center; line-height: 24px;">
                              <span style="color: #16a34a; font-size: 12px;">✓</span>
                            </div>
                          </td>
                          <td style="color: #374151; font-size: 14px; line-height: 1.5;">
                            ${isPL ? 'Specjalne ceny hurtowe dla partnerów' : 'Special wholesale prices for partners'}
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <table role="presentation" cellspacing="0" cellpadding="0">
                        <tr>
                          <td style="width: 32px; vertical-align: top;">
                            <div style="background: #dcfce7; width: 24px; height: 24px; border-radius: 50%; text-align: center; line-height: 24px;">
                              <span style="color: #16a34a; font-size: 12px;">✓</span>
                            </div>
                          </td>
                          <td style="color: #374151; font-size: 14px; line-height: 1.5;">
                            ${isPL ? 'Dedykowany opiekun klienta' : 'Dedicated account manager'}
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <table role="presentation" cellspacing="0" cellpadding="0">
                        <tr>
                          <td style="width: 32px; vertical-align: top;">
                            <div style="background: #dcfce7; width: 24px; height: 24px; border-radius: 50%; text-align: center; line-height: 24px;">
                              <span style="color: #16a34a; font-size: 12px;">✓</span>
                            </div>
                          </td>
                          <td style="color: #374151; font-size: 14px; line-height: 1.5;">
                            ${isPL ? 'Priorytetowa obsługa zamówień' : 'Priority order processing'}
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <table role="presentation" cellspacing="0" cellpadding="0">
                        <tr>
                          <td style="width: 32px; vertical-align: top;">
                            <div style="background: #dcfce7; width: 24px; height: 24px; border-radius: 50%; text-align: center; line-height: 24px;">
                              <span style="color: #16a34a; font-size: 12px;">✓</span>
                            </div>
                          </td>
                          <td style="color: #374151; font-size: 14px; line-height: 1.5;">
                            ${isPL ? 'Dostęp do szkoleń i wsparcia technicznego' : 'Access to training and technical support'}
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Account Info -->
              <div style="background: #eff6ff; border-radius: 12px; padding: 24px; margin-bottom: 24px; border-left: 4px solid #3b82f6;">
                <h3 style="margin: 0 0 12px; color: #1e40af; font-size: 14px; font-weight: 600;">
                  ${isPL ? '📧 Dane logowania' : '📧 Login Details'}
                </h3>
                <p style="margin: 0; color: #374151; font-size: 14px;">
                  <strong>Email:</strong> ${data.email}
                </p>
                <p style="margin: 8px 0 0; color: #6b7280; font-size: 13px;">
                  ${isPL
                    ? 'Użyj hasła ustalonego podczas rejestracji'
                    : 'Use the password you set during registration'
                  }
                </p>
              </div>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 8px 0 24px;">
                    <a href="https://shop.droneagri.pl/b2b/login" style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 14px rgba(220, 38, 38, 0.4);">
                      ${isPL ? 'Zaloguj się do panelu B2B' : 'Login to B2B Portal'}
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Contact Info -->
              <div style="text-align: center; padding-top: 16px; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
                  ${isPL ? 'Masz pytania? Skontaktuj się z nami:' : 'Have questions? Contact us:'}
                </p>
                <p style="margin: 0;">
                  <a href="mailto:biuro@imegagroup.pl" style="color: #dc2626; text-decoration: none; font-weight: 500;">
                    biuro@imegagroup.pl
                  </a>
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #1f2937; padding: 32px 40px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <p style="margin: 0 0 8px; color: #ffffff; font-size: 16px; font-weight: 600;">
                      XAG Polska
                    </p>
                    <p style="margin: 0; color: #9ca3af; font-size: 13px; line-height: 1.6;">
                      ${isPL
                        ? 'Oficjalny dystrybutor dronów XAG w Polsce i Europie'
                        : 'Official XAG drone distributor in Poland and Europe'
                      }
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 24px;">
                    <table role="presentation" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding-right: 16px;">
                          <a href="https://droneagri.pl" style="color: #9ca3af; text-decoration: none; font-size: 13px;">droneagri.pl</a>
                        </td>
                        <td style="padding-right: 16px; color: #4b5563;">|</td>
                        <td>
                          <a href="https://shop.droneagri.pl" style="color: #9ca3af; text-decoration: none; font-size: 13px;">shop.droneagri.pl</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>

        <!-- Legal Footer -->
        <table role="presentation" width="600" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center" style="padding: 24px 40px;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 1.6;">
                ${isPL
                  ? 'Ta wiadomość została wysłana automatycznie. Otrzymujesz ją, ponieważ zarejestrowałeś konto B2B w shop.droneagri.pl'
                  : 'This message was sent automatically. You received it because you registered a B2B account at shop.droneagri.pl'
                }
              </p>
              <p style="margin: 12px 0 0; color: #9ca3af; font-size: 11px;">
                © ${new Date().getFullYear()} XAG Polska / iMega Group. ${isPL ? 'Wszelkie prawa zastrzeżone.' : 'All rights reserved.'}
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = isPL
    ? `Witaj ${data.contactName}!\n\nCieszymy się, że ${data.companyName} dołącza do grona naszych partnerów B2B XAG Polska.\n\nTwoje konto zostało aktywowane. Możesz się zalogować na: https://shop.droneagri.pl/b2b/login\n\nEmail: ${data.email}\n\nKorzyści B2B:\n- Specjalne ceny hurtowe dla partnerów\n- Dedykowany opiekun klienta\n- Priorytetowa obsługa zamówień\n- Dostęp do szkoleń i wsparcia technicznego\n\nMasz pytania? Skontaktuj się: biuro@imegagroup.pl\n\nPozdrawiamy,\nZespół XAG Polska`
    : `Welcome ${data.contactName}!\n\nWe're excited to have ${data.companyName} join our B2B partner network at XAG Polska.\n\nYour account has been activated. You can login at: https://shop.droneagri.pl/b2b/login\n\nEmail: ${data.email}\n\nB2B Benefits:\n- Special wholesale prices for partners\n- Dedicated account manager\n- Priority order processing\n- Access to training and technical support\n\nHave questions? Contact us: biuro@imegagroup.pl\n\nBest regards,\nXAG Polska Team`;

  return sendEmail({ to, subject, html, text });
}
