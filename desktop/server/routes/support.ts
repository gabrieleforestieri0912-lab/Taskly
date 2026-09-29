
const express = require("express");
const router = express.Router();

// Support/feedback form — mirrors the web project. Sends an email via Resend
// when RESEND_API_KEY is configured; otherwise reports a clear configuration error.
router.post("/", async (req, res) => {
  try {
    const { message, email, name } = req.body || {};

    if (!message || !String(message).trim()) {
      return res.status(400).json({ error: "Scrivi un messaggio prima di inviare." });
    }

    const nomePulito = name ? String(name).trim() : "";
    const emailPulita = email ? String(email).trim().toLowerCase() : "";
    const messaggioPulito = String(message).trim();

    if (emailPulita) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailPulita)) {
        return res.status(400).json({ error: "Email non valida." });
      }
    }

    let Resend = null;
    try {
      Resend = require("resend").Resend;
    } catch {
      Resend = null;
    }

    const resend = process.env.RESEND_API_KEY && Resend ? new Resend(process.env.RESEND_API_KEY) : null;

    try {
      if (!resend) throw new Error("Resend not configured");
      await resend.emails.send({
        from: "Taskly <noreply@taskly.app>",
        to: process.env.SUPPORT_EMAIL || "gabriele.forestieri0912@gmail.com",
        subject: `Nuovo feedback${nomePulito ? ` da ${nomePulito}` : ""}`,
        html: `
          <h2>Nuovo feedback</h2>
          <p><strong>Nome:</strong> ${nomePulito || "Anonimo"}</p>
          <p><strong>Email:</strong> ${emailPulita || "non fornita"}</p>
          <p><strong>Messaggio:</strong></p>
          <p>${messaggioPulito}</p>
        `,
      });
    } catch (emailError) {
      console.error("Email send error:", emailError);
      return res.status(500).json({ error: "Errore invio email." });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Supporto error:", error);
    res.status(500).json({ error: "Errore del server." });
  }
});

module.exports = router;

