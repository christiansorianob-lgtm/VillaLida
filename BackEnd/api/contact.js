// =====================================================
// FINCA VILLA LIDA — Backend API: Contact Handler
// Archivo: BackEnd/api/contact.js
// Compatible con: Vercel Serverless Functions (Node.js)
// =====================================================

// ──────────────────────────────────────────────────
// HOW TO USE:
//  1. Deploy to Vercel → this becomes /api/contact
//  2. Set environment variables in Vercel dashboard:
//     - EMAIL_TO      → your receiving email
//     - FROM_EMAIL    → sender email (e.g. Nodemailer/SendGrid)
//     - LOG_MESSAGES  → "true" to enable JSON file logging
// ──────────────────────────────────────────────────

const fs = require('fs');
const path = require('path');

/**
 * Serverless function handler for contact form submissions.
 * Stores message in a JSON log and optionally sends email.
 */
module.exports = async function handler(req, res) {
  // ── CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  // ── Parse Body
  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: 'Invalid JSON body.' });
  }

  const { name, phone, email, message } = body;

  // ── Validation
  if (!name || !phone || !email || !message) {
    return res.status(422).json({
      error: 'Validation failed',
      missing: ['name', 'phone', 'email', 'message'].filter(k => !body[k])
    });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(422).json({ error: 'Invalid email address.' });
  }

  // ── Build contact record
  const record = {
    id: `MSG-${Date.now()}`,
    timestamp: new Date().toISOString(),
    nombre: name.trim(),
    telefono: phone.trim(),
    correo: email.trim().toLowerCase(),
    mensaje: message.trim(),
    ip: req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown',
    userAgent: req.headers['user-agent'] || 'unknown',
    leido: false,
    respondido: false
  };

  // ── Log to JSON file (development / Vercel with writable /tmp)
  try {
    const logDir = process.env.VERCEL
      ? '/tmp'
      : path.join(__dirname, '..', 'logs');

    // Crear directorio si no existe
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const logFile = path.join(logDir, 'mensajes.json');
    let messages = [];

    if (fs.existsSync(logFile)) {
      try {
        const content = fs.readFileSync(logFile, 'utf8');
        messages = JSON.parse(content);
        if (!Array.isArray(messages)) messages = [];
      } catch { messages = []; }
    }

    messages.push(record);
    fs.writeFileSync(logFile, JSON.stringify(messages, null, 2), 'utf8');
    console.log(`[VillaLida] Mensaje guardado: ${record.id}`);

  } catch (logError) {
    // Log storage is optional — don't fail the request
    console.error('[VillaLida] Log error:', logError.message);
  }

  // ── Email notification via SendGrid (optional, if configured)
  if (process.env.SENDGRID_API_KEY && process.env.EMAIL_TO) {
    try {
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);

      await sgMail.send({
        to: process.env.EMAIL_TO,
        from: process.env.FROM_EMAIL || 'no-reply@villalida.com',
        subject: `📩 Nueva solicitud de ${record.nombre} – Finca Villa Lida`,
        html: buildEmailHtml(record),
        replyTo: record.correo
      });

      console.log(`[VillaLida] Email enviado a ${process.env.EMAIL_TO}`);
    } catch (emailErr) {
      console.error('[VillaLida] Email error:', emailErr.message);
      // Don't fail — email is optional
    }
  }

  // ── Success response
  return res.status(200).json({
    success: true,
    id: record.id,
    message: '¡Mensaje recibido! Nos pondremos en contacto pronto.'
  });
};


// ─── Email HTML Template ──────────────────────
function buildEmailHtml(record) {
  return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width"/></head>
<body style="font-family:Inter,Arial,sans-serif;background:#f5f0e8;margin:0;padding:20px;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 30px rgba(0,0,0,0.1);">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1a4a2e,#2d6a4a);padding:32px;text-align:center;">
      <h1 style="color:#ffffff;font-size:24px;margin:0;">🌿 Finca Villa Lida</h1>
      <p style="color:#52b788;margin:8px 0 0;font-size:14px;">Nueva solicitud de contacto</p>
    </div>
    <!-- Body -->
    <div style="padding:32px;">
      <div style="background:#f5f0e8;border-radius:12px;padding:20px;margin-bottom:20px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr style="border-bottom:1px solid #e5e7eb;">
            <td style="padding:10px 0;font-weight:600;color:#1a4a2e;width:130px;">ID Mensaje</td>
            <td style="padding:10px 0;color:#4b5563;">${record.id}</td>
          </tr>
          <tr style="border-bottom:1px solid #e5e7eb;">
            <td style="padding:10px 0;font-weight:600;color:#1a4a2e;">Fecha</td>
            <td style="padding:10px 0;color:#4b5563;">${new Date(record.timestamp).toLocaleString('es-CO', {timeZone:'America/Bogota'})}</td>
          </tr>
          <tr style="border-bottom:1px solid #e5e7eb;">
            <td style="padding:10px 0;font-weight:600;color:#1a4a2e;">Nombre</td>
            <td style="padding:10px 0;color:#4b5563;">${record.nombre}</td>
          </tr>
          <tr style="border-bottom:1px solid #e5e7eb;">
            <td style="padding:10px 0;font-weight:600;color:#1a4a2e;">📱 WhatsApp</td>
            <td style="padding:10px 0;">
              <a href="https://wa.me/${record.telefono.replace(/\D/g,'')}" style="color:#25D366;font-weight:600;">${record.telefono}</a>
            </td>
          </tr>
          <tr style="border-bottom:1px solid #e5e7eb;">
            <td style="padding:10px 0;font-weight:600;color:#1a4a2e;">Correo</td>
            <td style="padding:10px 0;">
              <a href="mailto:${record.correo}" style="color:#1a4a2e;">${record.correo}</a>
            </td>
          </tr>
        </table>
      </div>
      <div style="background:#f0faf5;border-left:4px solid #52b788;border-radius:8px;padding:16px;margin-bottom:20px;">
        <p style="font-weight:600;color:#1a4a2e;margin:0 0 8px;">Mensaje:</p>
        <p style="color:#4b5563;margin:0;line-height:1.6;">${record.mensaje.replace(/\n/g,'<br/>')}</p>
      </div>
      <div style="text-align:center;">
        <a href="https://wa.me/${record.telefono.replace(/\D/g,'')}"
           style="display:inline-block;background:#25D366;color:#fff;font-weight:bold;
                  padding:12px 28px;border-radius:40px;text-decoration:none;font-size:15px;">
          💬 Responder por WhatsApp
        </a>
      </div>
    </div>
    <!-- Footer -->
    <div style="background:#1a4a2e;padding:16px;text-align:center;">
      <p style="color:#52b788;font-size:12px;margin:0;">Finca Villa Lida · Plántulas de Palma de Aceite © 2025</p>
    </div>
  </div>
</body>
</html>`;
}
