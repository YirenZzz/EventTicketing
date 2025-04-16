import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { to, eventName, ticketCode } = await req.json();

  try {
    const data = await resend.emails.send({
      from: 'Event Ticketing <onboarding@resend.dev>',
      to,
      subject: `🎟️ Ticket Confirmation for ${eventName}`,
      html: `
        <p>Thank you for registering for <strong>${eventName}</strong>!</p>
        <p>Your ticket code is: <strong>${ticketCode}</strong></p>
        <p>Please keep this email for check-in at the event.</p>
      `,
    });

    return NextResponse.json({ success: true, id: data.id });
  } catch (error) {
    console.error('Resend error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}