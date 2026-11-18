import { EmailEventType } from './email.types';

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function wrapHtmlLayout(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>${escapeHtml(title)}</title></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background:#f8fafc; color:#0f172a; padding:24px; margin:0;">
  <div style="max-width:600px; margin:0 auto; background:#ffffff; border:1px solid #e2e8f0; border-radius:10px; overflow:hidden;">
    <div style="background:#0f172a; color:#ffffff; padding:20px 24px;">
      <strong style="font-size:16px; letter-spacing:0.2px;">Kiran's Infotech</strong>
      <div style="font-size:12px; color:#94a3b8; margin-top:2px;">Computer Hardware • Certified Refurbished • IT Service Lab</div>
    </div>
    <div style="padding:24px; font-size:14px; line-height:1.6;">
      ${bodyHtml}
    </div>
    <div style="background:#f1f5f9; padding:14px 24px; font-size:12px; color:#64748b; border-top:1px solid #e2e8f0;">
      This is an automated service notification from Kiran's Infotech. Please do not share sensitive account details over email.
    </div>
  </div>
</body>
</html>`;
}

export function renderEmailTemplate(
  event: EmailEventType,
  data: Record<string, unknown>,
): { subject: string; html: string; text: string } {
  const name = String(data.customerName || 'Customer');
  const ref = String(data.reference || '');

  switch (event) {
    case EmailEventType.CUSTOMER_REGISTRATION_VERIFICATION: {
      const subject = "Welcome to Kiran's Infotech — Verify Your Account";
      const verifyUrl = String(data.verifyUrl || '');
      const text = `Hello ${name},\n\nThank you for registering with Kiran's Infotech.${verifyUrl ? ` Verify your email: ${verifyUrl}` : ''}\n\nRegards,\nKiran's Infotech`;
      const html = wrapHtmlLayout(
        subject,
        `<p>Hello <strong>${escapeHtml(name)}</strong>,</p>
         <p>Thank you for creating an account with Kiran's Infotech. You can now track orders, submit enquiries, and manage repair bookings.</p>
         ${verifyUrl ? `<p><a href="${escapeHtml(verifyUrl)}" style="display:inline-block;background:#2563eb;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:600;">Verify Account</a></p>` : ''}`,
      );
      return { subject, html, text };
    }

    case EmailEventType.PASSWORD_RESET: {
      const subject = "Kiran's Infotech — Password Reset Request";
      const resetUrl = String(data.resetUrl || '');
      const text = `Hello ${name},\n\nWe received a password reset request for your account.${resetUrl ? ` Reset link: ${resetUrl}` : ''}\nIf you did not request this, ignore this email.`;
      const html = wrapHtmlLayout(
        subject,
        `<p>Hello <strong>${escapeHtml(name)}</strong>,</p>
         <p>We received a request to reset your Kiran's Infotech account password.</p>
         ${resetUrl ? `<p><a href="${escapeHtml(resetUrl)}" style="display:inline-block;background:#2563eb;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:600;">Reset Password</a></p>` : ''}
         <p style="font-size:12px;color:#64748b;">If you did not request this change, you can safely ignore this message.</p>`,
      );
      return { subject, html, text };
    }

    case EmailEventType.ORDER_REQUEST_CONFIRMATION: {
      const total = String(data.totalAmount || '0');
      const subject = `Order Request Received — ${ref}`;
      const text = `Hello ${name},\n\nYour order request ${ref} (Total: INR ${total}) has been received. Our sales desk will confirm availability and fulfilment shortly.`;
      const html = wrapHtmlLayout(
        subject,
        `<p>Hello <strong>${escapeHtml(name)}</strong>,</p>
         <p>Your order request <strong>${escapeHtml(ref)}</strong> has been logged.</p>
         <p><strong>Total Amount:</strong> INR ${escapeHtml(total)}</p>
         <p>Our sales team will confirm pickup or delivery details shortly.</p>`,
      );
      return { subject, html, text };
    }

    case EmailEventType.ORDER_STATUS_UPDATE: {
      const status = String(data.status || '');
      const subject = `Order ${ref} Status Updated: ${status}`;
      const text = `Hello ${name},\n\nYour order ${ref} status is now: ${status}.`;
      const html = wrapHtmlLayout(
        subject,
        `<p>Hello <strong>${escapeHtml(name)}</strong>,</p>
         <p>Your order <strong>${escapeHtml(ref)}</strong> has been updated to: <strong>${escapeHtml(status)}</strong>.</p>`,
      );
      return { subject, html, text };
    }

    case EmailEventType.REPAIR_BOOKING_CONFIRMATION: {
      const device = String(data.device || 'Hardware Device');
      const subject = `Repair Booking Confirmed — ${ref}`;
      const text = `Hello ${name},\n\nYour repair booking ${ref} for ${device} has been logged. Track live updates in your customer dashboard.`;
      const html = wrapHtmlLayout(
        subject,
        `<p>Hello <strong>${escapeHtml(name)}</strong>,</p>
         <p>We have logged your repair booking <strong>${escapeHtml(ref)}</strong> for <strong>${escapeHtml(device)}</strong>.</p>
         <p>You can track technician diagnostics and quotations anytime in your Customer Dashboard.</p>`,
      );
      return { subject, html, text };
    }

    case EmailEventType.REPAIR_STATUS_UPDATE: {
      const status = String(data.status || '');
      const message = String(data.message || '');
      const subject = `Repair ${ref} Update: ${status}`;
      const text = `Hello ${name},\n\nRepair ${ref} is now ${status}.\nUpdate: ${message}`;
      const html = wrapHtmlLayout(
        subject,
        `<p>Hello <strong>${escapeHtml(name)}</strong>,</p>
         <p>Repair <strong>${escapeHtml(ref)}</strong> status: <strong>${escapeHtml(status)}</strong>.</p>
         <p>${escapeHtml(message)}</p>`,
      );
      return { subject, html, text };
    }

    case EmailEventType.QUOTATION_NOTIFICATION: {
      const quotationNumber = String(data.quotationNumber || '');
      const total = String(data.totalAmount || '0');
      const subject = `Repair Quotation Ready (${quotationNumber}) — ${ref}`;
      const text = `Hello ${name},\n\nA repair quotation ${quotationNumber} for INR ${total} is ready for your approval on booking ${ref}.`;
      const html = wrapHtmlLayout(
        subject,
        `<p>Hello <strong>${escapeHtml(name)}</strong>,</p>
         <p>Quotation <strong>${escapeHtml(quotationNumber)}</strong> (Total: <strong>INR ${escapeHtml(total)}</strong>) is ready for your review on repair <strong>${escapeHtml(ref)}</strong>.</p>
         <p>Please sign in to your Customer Dashboard to approve or decline before work proceeds.</p>`,
      );
      return { subject, html, text };
    }

    case EmailEventType.QUOTATION_APPROVAL_CONFIRMATION: {
      const quotationNumber = String(data.quotationNumber || '');
      const decision = String(data.decision || 'APPROVED');
      const subject = `Quotation ${quotationNumber} ${decision} — ${ref}`;
      const text = `Hello ${name},\n\nYour response (${decision}) for quotation ${quotationNumber} on repair ${ref} has been recorded.`;
      const html = wrapHtmlLayout(
        subject,
        `<p>Hello <strong>${escapeHtml(name)}</strong>,</p>
         <p>We have recorded your decision (<strong>${escapeHtml(decision)}</strong>) for quotation <strong>${escapeHtml(quotationNumber)}</strong> on repair <strong>${escapeHtml(ref)}</strong>.</p>`,
      );
      return { subject, html, text };
    }

    case EmailEventType.ADMIN_ENQUIRY_NOTIFICATION: {
      const subjectLine = String(data.subject || 'New Customer Enquiry');
      const subject = `New Customer Enquiry ${ref}: ${subjectLine}`;
      const text = `New enquiry ${ref} from ${name}.\nSubject: ${subjectLine}\nMessage: ${String(data.message || '')}`;
      const html = wrapHtmlLayout(
        subject,
        `<p>New customer enquiry <strong>${escapeHtml(ref)}</strong> received from <strong>${escapeHtml(name)}</strong>.</p>
         <p><strong>Subject:</strong> ${escapeHtml(subjectLine)}</p>
         <p>${escapeHtml(data.message || '')}</p>`,
      );
      return { subject, html, text };
    }
  }
}
