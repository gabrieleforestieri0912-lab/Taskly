import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request: Request) {
  try {
    const { message, email, name } = await request.json();

    if (!message || !String(message).trim()) {
      return NextResponse.json(
        { error: 'Scrivi un messaggio prima di inviare.' },
        { status: 400 }
      );
    }

    const nomePulito = name ? String(name).trim() : '';
    const emailPulita = email ? String(email).trim().toLowerCase() : '';
    const messaggioPulito = String(message).trim();

    if (emailPulita) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailPulita)) {
        return NextResponse.json(
          { error: 'Email non valida.' },
          { status: 400 }
        );
      }
    }

    try {
      if (!resend) throw new Error('Resend not configured');
      await resend.emails.send({
        from: 'Taskly <noreply@taskly.app>',
        to: process.env.SUPPORT_EMAIL || 'gabriele.forestieri0912@gmail.com',
        subject: `Nuovo feedback${nomePulito ? ` da ${nomePulito}` : ''}`,
        html: `
          <h2>Nuovo feedback</h2>
          <p><strong>Nome:</strong> ${nomePulito || 'Anonimo'}</p>
          <p><strong>Email:</strong> ${emailPulita || 'non fornita'}</p>
          <p><strong>Messaggio:</strong></p>
          <p>${messaggioPulito}</p>
        `,
      });
    } catch (emailError) {
      console.error('Email send error:', emailError);
      return NextResponse.json(
        { error: 'Errore invio email.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Supporto error:', error);
    return NextResponse.json(
      { error: 'Errore del server.' },
      { status: 500 }
    );
  }
}