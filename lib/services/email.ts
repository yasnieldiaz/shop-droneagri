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
<body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: Arial, Helvetica, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8f9fa;">
    <tr>
      <td align="center" style="padding: 40px 20px;">

        <!-- Main Container -->
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border: 1px solid #e0e0e0;">

          <!-- Header -->
          <tr>
            <td style="background-color: #b91c1c; padding: 32px 40px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: 0.5px;">
                      XAG POLSKA
                    </h1>
                    <p style="margin: 4px 0 0; color: rgba(255,255,255,0.85); font-size: 13px; font-weight: 400; letter-spacing: 2px; text-transform: uppercase;">
                      B2B Partner Program
                    </p>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <span style="color: rgba(255,255,255,0.9); font-size: 12px; font-weight: 500; background: rgba(255,255,255,0.15); padding: 8px 16px; border: 1px solid rgba(255,255,255,0.3);">
                      ${isPL ? 'KONTO AKTYWNE' : 'ACCOUNT ACTIVE'}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">

              <!-- Greeting -->
              <p style="margin: 0 0 24px; color: #333333; font-size: 15px; line-height: 1.6;">
                ${isPL ? 'Szanowny Partnerze' : 'Dear Partner'},
              </p>

              <p style="margin: 0 0 24px; color: #333333; font-size: 15px; line-height: 1.6;">
                ${isPL
                  ? `Potwierdzamy rejestrację firmy <strong>${data.companyName}</strong> w programie B2B XAG Polska. Państwa konto zostało pomyślnie aktywowane.`
                  : `We confirm the registration of <strong>${data.companyName}</strong> in the XAG Polska B2B program. Your account has been successfully activated.`
                }
              </p>

              <!-- Account Details Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 32px;">
                <tr>
                  <td style="background-color: #f8f9fa; border-left: 3px solid #b91c1c; padding: 20px 24px;">
                    <p style="margin: 0 0 4px; color: #666666; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                      ${isPL ? 'Dane dostępowe' : 'Access Details'}
                    </p>
                    <p style="margin: 8px 0 0; color: #333333; font-size: 14px;">
                      <strong>Login:</strong> ${data.email}
                    </p>
                    <p style="margin: 4px 0 0; color: #666666; font-size: 13px;">
                      ${isPL ? 'Hasło: ustalone podczas rejestracji' : 'Password: set during registration'}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Benefits Section -->
              <p style="margin: 0 0 16px; color: #333333; font-size: 14px; font-weight: 600;">
                ${isPL ? 'W ramach współpracy B2B oferujemy:' : 'As part of B2B cooperation, we offer:'}
              </p>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 32px;">
                <tr>
                  <td style="padding: 6px 0; color: #444444; font-size: 14px;">
                    <span style="color: #b91c1c; margin-right: 8px;">—</span>
                    ${isPL ? 'Indywidualne warunki cenowe' : 'Individual pricing conditions'}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #444444; font-size: 14px;">
                    <span style="color: #b91c1c; margin-right: 8px;">—</span>
                    ${isPL ? 'Dedykowana obsługa klienta' : 'Dedicated customer service'}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #444444; font-size: 14px;">
                    <span style="color: #b91c1c; margin-right: 8px;">—</span>
                    ${isPL ? 'Priorytetowa realizacja zamówień' : 'Priority order fulfillment'}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #444444; font-size: 14px;">
                    <span style="color: #b91c1c; margin-right: 8px;">—</span>
                    ${isPL ? 'Wsparcie techniczne i szkolenia' : 'Technical support and training'}
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 8px 0 32px;">
                    <a href="https://shop.droneagri.pl/b2b/login" style="display: inline-block; background-color: #b91c1c; color: #ffffff; text-decoration: none; padding: 14px 32px; font-size: 14px; font-weight: 600; letter-spacing: 0.5px;">
                      ${isPL ? 'PRZEJDŹ DO PANELU B2B' : 'GO TO B2B PANEL'}
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Contact -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-top: 1px solid #e0e0e0; padding-top: 24px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 8px; color: #666666; font-size: 13px;">
                      ${isPL ? 'W razie pytań pozostajemy do dyspozycji:' : 'For any questions, please contact us:'}
                    </p>
                    <p style="margin: 0; color: #333333; font-size: 14px;">
                      <a href="mailto:biuro@imegagroup.pl" style="color: #b91c1c; text-decoration: none;">biuro@imegagroup.pl</a>
                      <span style="color: #999999; margin: 0 8px;">|</span>
                      <a href="tel:+48696350197" style="color: #333333; text-decoration: none;">+48 784 608 733</a>
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Signature -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 32px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 4px; color: #333333; font-size: 14px;">
                      ${isPL ? 'Z poważaniem,' : 'Best regards,'}
                    </p>
                    <p style="margin: 0; color: #333333; font-size: 14px; font-weight: 600;">
                      ${isPL ? 'Zespół XAG Polska' : 'XAG Polska Team'}
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #1a1a1a; padding: 24px 40px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <p style="margin: 0 0 4px; color: #ffffff; font-size: 13px; font-weight: 600;">
                      XAG Polska / iMega Group
                    </p>
                    <p style="margin: 0; color: #999999; font-size: 12px;">
                      ${isPL ? 'Oficjalny dystrybutor dronów XAG w Polsce i Europie' : 'Official XAG drone distributor in Poland and Europe'}
                    </p>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <a href="https://droneagri.pl" style="color: #999999; text-decoration: none; font-size: 12px; margin-right: 16px;">droneagri.pl</a>
                    <a href="https://shop.droneagri.pl" style="color: #999999; text-decoration: none; font-size: 12px;">shop.droneagri.pl</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>

        <!-- Legal Footer -->
        <table role="presentation" width="600" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center" style="padding: 20px 40px;">
              <p style="margin: 0; color: #999999; font-size: 11px; line-height: 1.5;">
                ${isPL
                  ? 'Wiadomość wygenerowana automatycznie w związku z rejestracją konta B2B.'
                  : 'This message was automatically generated due to B2B account registration.'
                }
                <br/>
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
    ? `Szanowny Partnerze,\n\nPotwierdzamy rejestrację firmy ${data.companyName} w programie B2B XAG Polska. Państwa konto zostało pomyślnie aktywowane.\n\nDane dostępowe:\nLogin: ${data.email}\nHasło: ustalone podczas rejestracji\n\nPanel B2B: https://shop.droneagri.pl/b2b/login\n\nW ramach współpracy B2B oferujemy:\n- Indywidualne warunki cenowe\n- Dedykowaną obsługę klienta\n- Priorytetową realizację zamówień\n- Wsparcie techniczne i szkolenia\n\nW razie pytań: biuro@imegagroup.pl | +48 784 608 733\n\nZ poważaniem,\nZespół XAG Polska`
    : `Dear Partner,\n\nWe confirm the registration of ${data.companyName} in the XAG Polska B2B program. Your account has been successfully activated.\n\nAccess Details:\nLogin: ${data.email}\nPassword: set during registration\n\nB2B Panel: https://shop.droneagri.pl/b2b/login\n\nAs part of B2B cooperation, we offer:\n- Individual pricing conditions\n- Dedicated customer service\n- Priority order fulfillment\n- Technical support and training\n\nFor questions: biuro@imegagroup.pl | +48 784 608 733\n\nBest regards,\nXAG Polska Team`;

  return sendEmail({ to, subject, html, text });
}
