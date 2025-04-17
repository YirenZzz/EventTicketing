import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendTicketEmail({
  to,
  eventName,
  ticketTypeName,
  code,
}: {
  to: string;
  eventName: string;
  ticketTypeName: string;
  code: string;
}) {
  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to,
    subject: `Your Ticket for ${eventName}`,
    html: `
      <h2>Thank you for your purchase!</h2>
      <p>You've successfully purchased a <strong>${ticketTypeName}</strong> ticket for <strong>${eventName}</strong>.</p>
      <p>Your ticket code is: <strong>${code}</strong></p>
    `,
  });
}