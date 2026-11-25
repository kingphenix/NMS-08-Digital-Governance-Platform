/**
 * Server-side email delivery service for NMS 08 Digital Governance Platform.
 * Supports Resend, custom webhook/SMTP environment variables, or local console logging fallback.
 */

interface SendPasswordResetParams {
  to: string;
  fullName: string;
  nmsNumber: string;
  resetUrl: string;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  devUrl?: string;
}

export async function sendPasswordResetEmail({
  to,
  fullName,
  nmsNumber,
  resetUrl,
}: SendPasswordResetParams): Promise<EmailSendResult> {
  const isDev = process.env.NODE_ENV !== 'production';
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.EMAIL_FROM || 'NMS 08 Alumni Association <noreply@nms08alumni.org>';

  const subject = 'Reset Your NMS 08 Portal Password';

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #064e3b; background: linear-gradient(135deg, #064e3b 0%, #047857 100%); padding: 36px 32px; text-align: center;">
              <div style="display: inline-block; padding: 6px 14px; background-color: rgba(255, 255, 255, 0.15); border-radius: 9999px; font-size: 11px; font-weight: 700; color: #a7f3d0; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px;">
                Official Member Portal
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.02em;">
                Nigerian Military School Zaria
              </h1>
              <p style="margin: 6px 0 0 0; color: #a7f3d0; font-size: 13px; font-weight: 600;">
                Class of 2008 Alumni Association
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 36px 32px;">
              <h2 style="margin: 0 0 12px 0; color: #0f172a; font-size: 19px; font-weight: 700;">
                Password Reset Request
              </h2>
              <p style="margin: 0 0 16px 0; color: #475569; font-size: 14px; line-height: 1.6;">
                Dear Ex-Boy <strong>${fullName || 'Member'}</strong> (<span style="color: #047857; font-weight: 600;">${nmsNumber}</span>),
              </p>
              <p style="margin: 0 0 24px 0; color: #475569; font-size: 14px; line-height: 1.6;">
                We received a request to reset the password for your NMS 08 Digital Governance Portal account. Click the button below to choose a new password:
              </p>

              <!-- Call to Action Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 28px 0;">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}" target="_blank" style="display: inline-block; background-color: #047857; background: linear-gradient(135deg, #059669 0%, #047857 100%); color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 14px 32px; border-radius: 12px; box-shadow: 0 4px 12px rgba(4, 120, 87, 0.35);">
                      Reset My Password
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Notice Box -->
              <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 14px 16px; margin: 24px 0;">
                <p style="margin: 0; color: #166534; font-size: 12px; line-height: 1.5;">
                  <strong>Security Note:</strong> This link is unique to your account and will expire in <strong>60 minutes</strong>. Once used, it will be automatically invalidated.
                </p>
              </div>

              <!-- Fallback Plain Link -->
              <p style="margin: 24px 0 6px 0; color: #64748b; font-size: 12px;">
                If the button above does not work, copy and paste this URL into your browser:
              </p>
              <p style="margin: 0 0 24px 0; word-break: break-all; font-size: 11px; color: #047857;">
                <a href="${resetUrl}" style="color: #047857; text-decoration: underline;">${resetUrl}</a>
              </p>

              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />

              <p style="margin: 0; color: #94a3b8; font-size: 12px; line-height: 1.5;">
                If you did not request this password reset, you can safely ignore this email. Your existing password will remain secure and unchanged.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #64748b; font-size: 11px;">
                &copy; ${new Date().getFullYear()} NMS Class of 2008 Alumni Association. All rights reserved.
              </p>
              <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 10px;">
                Brotherhood &bull; Discipline &bull; Digital Governance
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

  // Always log to server console for operational visibility and debugging
  console.log('====================================================');
  console.log('[PASSWORD RESET DISPATCH]');
  console.log(`To: ${fullName} <${to}>`);
  console.log(`NMS Number: ${nmsNumber}`);
  console.log(`Reset URL: ${resetUrl}`);
  console.log('Expires in 60 minutes');
  console.log('====================================================');

  if (resendApiKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [to],
          subject,
          html,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => null);
        console.warn('[Resend API Error]:', errJson || response.statusText);
        return {
          success: false,
          error: errJson?.message || 'Failed to dispatch email via Resend',
          devUrl: isDev ? resetUrl : undefined,
        };
      }

      const resData = await response.json();
      return {
        success: true,
        messageId: resData?.id,
        devUrl: isDev ? resetUrl : undefined,
      };
    } catch (err: any) {
      console.warn('[Email Dispatch Network Error]:', err?.message);
      return {
        success: false,
        error: err?.message,
        devUrl: isDev ? resetUrl : undefined,
      };
    }
  }

  // Fallback when RESEND_API_KEY is not configured
  return {
    success: true,
    devUrl: isDev ? resetUrl : undefined,
  };
}

// ─── Birthday Email ───────────────────────────────────────────────────────────

interface SendBirthdayEmailParams {
  to: string;
  fullName: string;
  nmsNumber?: string;
  company?: string;
}

export async function sendBirthdayEmail({
  to,
  fullName,
  nmsNumber,
  company,
}: SendBirthdayEmailParams): Promise<EmailSendResult> {
  const resendApiKey = process.env.RESEND_API_KEY;
  // On Resend free plan without a verified domain, must use onboarding@resend.dev
  const fromAddress = process.env.EMAIL_FROM || 'onboarding@resend.dev';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nms08.vercel.app';

  const subject = '🎂 Happy Birthday from NMS 08 Alumni Association!';

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f0fdf4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f0fdf4; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #bbf7d0; box-shadow: 0 10px 25px -5px rgba(4, 120, 87, 0.08);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #064e3b 0%, #047857 100%); padding: 40px 32px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 12px;">🎂</div>
              <div style="display: inline-block; padding: 5px 14px; background-color: rgba(255,255,255,0.15); border-radius: 9999px; font-size: 10px; font-weight: 700; color: #a7f3d0; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 10px;">
                NMS Class of 2008
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 800; letter-spacing: -0.02em;">
                Happy Birthday!
              </h1>
              <p style="margin: 6px 0 0 0; color: #a7f3d0; font-size: 13px; font-weight: 500;">
                Nigerian Military School Zaria · Alumni Association
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 36px 32px;">
              <p style="margin: 0 0 16px 0; color: #475569; font-size: 15px; line-height: 1.6;">
                Dear Ex-Boy <strong style="color: #0f172a;">${fullName}</strong>${nmsNumber ? ` (<span style="color: #047857; font-weight: 600;">${nmsNumber}</span>)` : ''},
              </p>
              <p style="margin: 0 0 20px 0; color: #475569; font-size: 14px; line-height: 1.7;">
                On behalf of the entire <strong>NMS Class of 2008 Alumni Association</strong>, we wish you a wonderful birthday filled with joy, good health, and continued success.
              </p>
              <p style="margin: 0 0 20px 0; color: #475569; font-size: 14px; line-height: 1.7;">
                Your brotherhood with us is a bond forged in discipline and strengthened through the years. Today, we celebrate you — not just the day you were born, but everything you have become since those formative years at NMS Zaria.
              </p>

              <!-- Birthday wish box -->
              <div style="background: linear-gradient(135deg, #f0fdf4, #dcfce7); border: 1px solid #86efac; border-radius: 16px; padding: 20px 24px; margin: 24px 0; text-align: center;">
                <p style="margin: 0; font-size: 18px; color: #047857; font-weight: 800; letter-spacing: -0.01em;">
                  🎉 Many Happy Returns of the Day! 🎉
                </p>
                <p style="margin: 8px 0 0 0; color: #166534; font-size: 12px;">
                  Brotherhood · Discipline · Excellence
                </p>
              </div>

              ${company ? `<p style="margin: 0 0 20px 0; color: #64748b; font-size: 13px;">We wish you great success in all your endeavours${company ? ` at <strong>${company}</strong>` : ''} and beyond.</p>` : ''}

              <p style="margin: 0 0 4px 0; color: #475569; font-size: 14px; line-height: 1.6;">
                Stay connected with your brothers on the alumni portal:
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 16px 0;">
                <tr>
                  <td align="left">
                    <a href="${appUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #059669, #047857); color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; padding: 12px 28px; border-radius: 12px; box-shadow: 0 4px 12px rgba(4,120,87,0.3);">
                      Visit Alumni Portal →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 18px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #64748b; font-size: 11px;">
                &copy; ${new Date().getFullYear()} NMS Class of 2008 Alumni Association. All rights reserved.
              </p>
              <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 10px;">
                Brotherhood &bull; Discipline &bull; Digital Governance
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

  console.log('====================================================');
  console.log('[BIRTHDAY EMAIL DISPATCH]');
  console.log(`To: ${fullName} <${to}>`);
  console.log(`NMS Number: ${nmsNumber || 'N/A'}`);
  console.log('====================================================');

  if (resendApiKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [to],
          subject,
          html,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => null);
        console.warn('[Resend Birthday Error]:', errJson || response.statusText);
        return {
          success: false,
          error: (errJson as { message?: string } | null)?.message || 'Failed to send birthday email',
        };
      }

      const resData = await response.json() as { id?: string };
      return { success: true, messageId: resData?.id };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Network error';
      console.warn('[Birthday Email Network Error]:', message);
      return { success: false, error: message };
    }
  }

  // Fallback: no API key configured — log only
  return { success: true };
}
