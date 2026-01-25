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
    ? 'XAG Polska B2B - Potwierdzenie rejestracji konta'
    : 'XAG Polska B2B - Account Registration Confirmation';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, Helvetica, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#f4f4f4">
    <tr>
      <td align="center" style="padding: 20px 10px;">

        <!-- Main Container -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#ffffff" style="max-width: 600px;">

          <!-- Header -->
          <tr>
            <td bgcolor="#b91c1c" style="padding: 28px 24px;">
              <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700;">
                XAG POLSKA
              </h1>
              <p style="margin: 6px 0 0; color: #ffffff; font-size: 12px; letter-spacing: 1px; opacity: 0.9;">
                B2B PARTNER PROGRAM
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px 24px;">

              <p style="margin: 0 0 20px; color: #333333; font-size: 15px; line-height: 1.5;">
                ${isPL ? 'Szanowny Partnerze,' : 'Dear Partner,'}
              </p>

              <p style="margin: 0 0 24px; color: #333333; font-size: 15px; line-height: 1.5;">
                ${isPL
                  ? `Potwierdzamy rejestrację firmy <strong>${data.companyName}</strong> w programie B2B XAG Polska. Państwa konto zostało pomyślnie aktywowane.`
                  : `We confirm the registration of <strong>${data.companyName}</strong> in the XAG Polska B2B program. Your account has been successfully activated.`
                }
              </p>

              <!-- Account Details Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 28px;">
                <tr>
                  <td bgcolor="#f8f8f8" style="border-left: 3px solid #b91c1c; padding: 16px 20px;">
                    <p style="margin: 0 0 4px; color: #888888; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">
                      ${isPL ? 'Dane logowania' : 'Login Details'}
                    </p>
                    <p style="margin: 8px 0 0; color: #333333; font-size: 14px;">
                      <strong>Email:</strong> ${data.email}
                    </p>
                    <p style="margin: 4px 0 0; color: #666666; font-size: 13px;">
                      ${isPL ? 'Hasło ustalone podczas rejestracji' : 'Password set during registration'}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Benefits -->
              <p style="margin: 0 0 12px; color: #333333; font-size: 14px; font-weight: 600;">
                ${isPL ? 'Korzyści współpracy B2B:' : 'B2B cooperation benefits:'}
              </p>

              <p style="margin: 0 0 6px; color: #444444; font-size: 14px; line-height: 1.4;">
                • ${isPL ? 'Indywidualne warunki cenowe' : 'Individual pricing conditions'}
              </p>
              <p style="margin: 0 0 6px; color: #444444; font-size: 14px; line-height: 1.4;">
                • ${isPL ? 'Dedykowana obsługa klienta' : 'Dedicated customer service'}
              </p>
              <p style="margin: 0 0 6px; color: #444444; font-size: 14px; line-height: 1.4;">
                • ${isPL ? 'Priorytetowa realizacja zamówień' : 'Priority order fulfillment'}
              </p>
              <p style="margin: 0 0 24px; color: #444444; font-size: 14px; line-height: 1.4;">
                • ${isPL ? 'Wsparcie techniczne i szkolenia' : 'Technical support and training'}
              </p>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="padding: 8px 0 28px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td bgcolor="#b91c1c" style="padding: 14px 28px;">
                          <a href="https://shop.droneagri.pl/b2b/login" style="color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600;">
                            ${isPL ? 'PANEL B2B' : 'B2B PANEL'}
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Contact -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-top: 1px solid #eeeeee;">
                <tr>
                  <td style="padding-top: 20px;">
                    <p style="margin: 0 0 6px; color: #666666; font-size: 13px;">
                      ${isPL ? 'Kontakt:' : 'Contact:'}
                    </p>
                    <p style="margin: 0; color: #333333; font-size: 14px;">
                      biuro@imegagroup.pl
                    </p>
                    <p style="margin: 4px 0 0; color: #333333; font-size: 14px;">
                      +48 518 416 466
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Signature -->
              <p style="margin: 28px 0 0; color: #333333; font-size: 14px;">
                ${isPL ? 'Z poważaniem,' : 'Best regards,'}<br/>
                <strong>${isPL ? 'Zespół XAG Polska' : 'XAG Polska Team'}</strong>
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td bgcolor="#222222" style="padding: 20px 24px;">
              <p style="margin: 0 0 4px; color: #ffffff; font-size: 13px; font-weight: 600;">
                XAG Polska / iMega Group
              </p>
              <p style="margin: 0; color: #aaaaaa; font-size: 12px;">
                droneagri.pl | shop.droneagri.pl
              </p>
            </td>
          </tr>

        </table>

        <!-- Legal -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px;">
          <tr>
            <td align="center" style="padding: 16px 24px;">
              <p style="margin: 0; color: #999999; font-size: 11px;">
                © ${new Date().getFullYear()} XAG Polska / iMega Group
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
    ? `Szanowny Partnerze,\n\nPotwierdzamy rejestrację firmy ${data.companyName} w programie B2B XAG Polska. Państwa konto zostało pomyślnie aktywowane.\n\nDane dostępowe:\nLogin: ${data.email}\nHasło: ustalone podczas rejestracji\n\nPanel B2B: https://shop.droneagri.pl/b2b/login\n\nW ramach współpracy B2B oferujemy:\n- Indywidualne warunki cenowe\n- Dedykowaną obsługę klienta\n- Priorytetową realizację zamówień\n- Wsparcie techniczne i szkolenia\n\nW razie pytań: biuro@imegagroup.pl | +48 518 416 466\n\nZ poważaniem,\nZespół XAG Polska`
    : `Dear Partner,\n\nWe confirm the registration of ${data.companyName} in the XAG Polska B2B program. Your account has been successfully activated.\n\nAccess Details:\nLogin: ${data.email}\nPassword: set during registration\n\nB2B Panel: https://shop.droneagri.pl/b2b/login\n\nAs part of B2B cooperation, we offer:\n- Individual pricing conditions\n- Dedicated customer service\n- Priority order fulfillment\n- Technical support and training\n\nFor questions: biuro@imegagroup.pl | +48 518 416 466\n\nBest regards,\nXAG Polska Team`;

  return sendEmail({ to, subject, html, text });
}
